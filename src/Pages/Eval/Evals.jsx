import { collection, onSnapshot } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../../Services/firebase";
import React, { useEffect, useState } from "react";
import { Dropdown, InputGroup, Table, Form } from "react-bootstrap";

const Evals = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState('');
  const [tutorFilter, setTutorFilter] = useState('');

  const [tableSort, setTableSort] = useState('name_asc');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        const newStudents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setStudents(newStudents);
        setLoading(false);
      })

    return () => unsubscribeStudents();
  }, [])

  function selectStudent(id) {
    navigate(`/evals/${id}`)
  }

  function studentList() {
    if (!students) {
      return null
    }

    const tableData = students.filter((student) => {
      return (
        student.student_name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        student.preferred_tutor_name.toLowerCase().includes(tutorFilter.toLowerCase())
      );
    })

    if (tableSort === 'name_asc')
      tableData.sort((a,b) => { return a.student_name.localeCompare(b.student_name) });
    else if (tableSort === 'name_desc')
      tableData.sort((a,b) => { return b.student_name.localeCompare(a.student_name) });

    return tableData.map((student) => {
      return (
        <tr className="p-3" key={student.id} onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}>
          <td>{student.student_name}</td>
          <td>{student.preferred_tutor_name}</td>
        </tr>
      )
    })
  }

  function filterIcon(column) {
    switch (column) {
      case 'name':
        if (!tableSort.includes('name') && nameFilter === '') { // neither
          return <i className="bi bi-filter ms-auto" />
        } else if (tableSort.includes('name') && nameFilter !== '') { // both
          if (tableSort === 'name_asc')
            return <><i className="bi bi-sort-alpha-up ms-auto" /><i className="bi bi-funnel-fill" /></>
          else if (tableSort === 'name_desc')
            return <><i className="bi bi-sort-alpha-down-alt ms-auto" /><i className="bi bi-funnel-fill" /></>
        } else if (nameFilter !== '') { // filter only
          return <i className="bi bi-funnel-fill ms-auto" />
        } else { // sort only
          if (tableSort === 'name_asc')
            return <i className="bi bi-sort-alpha-up ms-auto" />
          else if (tableSort === 'name_desc')
            return <i className="bi bi-sort-alpha-down-alt ms-auto" />
        }

        break;

      case 'tutor':
        if (tutorFilter !== '')
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />


      default:
        return <></>
    }
  }

  const DropdownTableHeaderToggle = React.forwardRef(({children, onClick}, ref) => (
    <div className="d-flex"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}>
      {children}
    </div>
  )) 

  const FilterTableHeader = React.forwardRef(({ children, style, className, 'aria-labelledby': labeledBy, value, valueSetter }, ref) => (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}>
      <Dropdown.Item>
        <InputGroup>
          <Form.Control autoFocus type="text" placeholder="Search" value={value}
            onChange={(e) => valueSetter(e.target.value)} />
          <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => valueSetter('')} />
        </InputGroup>
      </Dropdown.Item>
    </div>
  ))

  const ComboTableHeader = React.forwardRef(({ children, style, className, 'aria-labelledby': labeledBy, value, valueSetter }, ref) => (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}>
      <Dropdown.Item>
        <InputGroup>
          <Form.Control autoFocus type="text" placeholder="Search" value={value}
            onChange={(e) => valueSetter(e.target.value)} />
          <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => valueSetter('')} />
        </InputGroup>
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setTableSort('name_asc')}>A - Z</Dropdown.Item>
      <Dropdown.Item onClick={() => setTableSort('name_desc')}>Z - A</Dropdown.Item>
    </div>
  ))

  const listTable = (
    <Table striped hover>
      <thead>
        <tr>
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop='up' autoClose='outside'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Student Name {filterIcon('name')}
              </Dropdown.Toggle>
              <Dropdown.Menu as={ComboTableHeader} value={nameFilter} valueSetter={setNameFilter} />
            </Dropdown>
          </th>
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop="up" autoClose='outside'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Preferred Tutor {filterIcon('tutor')}
              </Dropdown.Toggle>
              <Dropdown.Menu as={FilterTableHeader} value={tutorFilter} valueSetter={setTutorFilter} />
            </Dropdown>
          </th>
        </tr>
      </thead>
      <tbody>
        {studentList()}
      </tbody>
    </Table>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>
        View All Session Evaluations
      </div>
      <div className='h5'>Select a Student</div>
      <div className='d-flex pt-3 px-3 card bg-light-subtle'>
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
    </div>
  );
}

export default Evals;