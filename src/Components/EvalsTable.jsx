import { collection, doc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownButton, InputGroup, Modal, Table, Form } from "react-bootstrap";


const EvalsTable = ({ filterBy, id }) => {
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tableSort, setTableSort] = useState('date_desc');

  const [tutorFilter, setTutorFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');

  const docRef = useRef(doc(db, filterBy, id));

  const navigate = useNavigate();

  useEffect(() => {
    docRef.current = doc(db, filterBy, id);

    if (filterBy === 'tutor') {
      getDocs(query(collection(db, 'evaluations'), where('tutor_id', '==', id)))
        .then((res) => setEvals(res.docs))
        .then(setLoading(false));
    } else if (filterBy === 'student') {
      getDocs(query(collection(db, 'evaluations'), where('student_id', '==', id)))
        .then((res) => setEvals(res.docs))
        .then(setLoading(false));
    }

  }, [filterBy, id])

  function evalList() {
    const tableData = evals.filter((evaluation) => {
      return (
        evaluation.data().student_name.toLowerCase().includes(studentFilter.toLowerCase()) &&
        evaluation.data().tutor_name.toLowerCase().includes(tutorFilter.toLowerCase())
      );
    })
    
    switch (tableSort) {
      case 'date_asc':
        tableData.sort((a,b) => { return dayjs(a.data().date).diff(dayjs(b.data().date)) });
        break;
      case 'date_desc':
        tableData.sort((a,b) => { return dayjs(b.data().date).diff(dayjs(a.data().date)) });
        break;
      default:
        break;
    }

    return tableData.map((evaluation) => {
      let evaluationData = evaluation.data();
      return (
        <tr key={evaluation.id} onClick={() => navigate(`/eval/${evaluation.id}`)}
          style={{ cursor: "pointer" }}>
          <td>{dayjs(evaluationData.date).format('MMMM DD, YYYY')}</td>
          <td>{filterBy === 'tutor' ? evaluationData.student_name : evaluationData.tutor_name}</td>
          <td>{evaluationData.subject}</td>
        </tr>
      )
    })
  }

  function filterIcon(column) {
    switch (column) {
      case 'date':
        if (tableSort === 'date_asc')
          return <i className="bi bi-sort-up ms-auto" />
        else if (tableSort === 'date_desc')
          return <i className="bi bi-sort-down ms-auto" />
        else
          return <i className="bi bi-filter ms-auto" />

      case 'student':
        if (studentFilter !== '')
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />
      case 'tutor':
        if (tutorFilter !== '')
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />
     
      default:
        return <i className="bi bi-filter ms-auto" />
    }
  }

  if (loading)
    return <div className="spinner-border align-self-center" />;

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

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th className="w-25">
            <Dropdown variant="" drop="up">
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Date {filterIcon('date')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTableSort('date_desc')}>Newer First</Dropdown.Item>
                <Dropdown.Item onClick={() => setTableSort('date_asc')}>Older First</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
          {filterBy === 'tutor' ? 
          <th className="w-25">
            <Dropdown autoClose='outside' drop='up'>
            <Dropdown.Toggle as={DropdownTableHeaderToggle} id="student-filter">
                Student {filterIcon('student')}
              </Dropdown.Toggle>
              
              <Dropdown.Menu as={FilterTableHeader} value={studentFilter} valueSetter={setStudentFilter} />
            </Dropdown>
          </th>
          :
          <th className="w-25">
            <Dropdown autoClose='outside' drop='up'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle} id="tutor-filter">
                Tutor {filterIcon('tutor')}
              </Dropdown.Toggle>
              
              <Dropdown.Menu as={FilterTableHeader} value={tutorFilter} valueSetter={setTutorFilter} />
            </Dropdown>
          </th>
          }
          <th className="w-50">Subject</th>
        </tr>
      </thead>
      <tbody>
        {evalList()}
      </tbody>
    </Table>
  )
}

export default EvalsTable;