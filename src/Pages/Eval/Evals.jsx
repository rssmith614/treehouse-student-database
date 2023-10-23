import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../../Services/firebase";
import { useEffect, useRef, useState } from "react";

const Evals = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState('');
  const [tutorFilter, setTutorFilter] = useState('');

  const [tableSort, setTableSort] = useState('name_asc');

  const studentCollRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const queryStudents = async () => {
      studentCollRef.current = collection(db, "students");
      await getDocs(studentCollRef.current).then((res) => setStudents(res.docs));
    }

    queryStudents()
      .then(setLoading(false));
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
        student.data().student_name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        student.data().preferred_tutor_name.toLowerCase().includes(tutorFilter.toLowerCase())
      );
    })

    if (tableSort === 'name_asc')
      tableData.sort((a,b) => { return a.data().student_name.localeCompare(b.data().student_name) });
    else if (tableSort === 'name_desc')
      tableData.sort((a,b) => { return b.data().student_name.localeCompare(a.data().student_name) });

    return tableData.map((student) => {
      let studentData = student.data();
      return (
        <tr className="p-3" key={student.id} onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}>
          <td>{studentData.student_name}</td>
          <td>{studentData.preferred_tutor_name}</td>
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
            return <><i className="bi bi-sort-alpha-up" /><i className="bi bi-funnel-fill" /></>
          else if (tableSort === 'name_desc')
            return <><i className="bi bi-sort-alpha-down-alt" /><i className="bi bi-funnel-fill" /></>
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

  const listTable = (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                <div className="me-auto">Student Name</div> {filterIcon('name')}
              </div>
              <ul className="dropdown-menu dropdown-menu-lg-end">
                <li className="px-2">
                  <div className="input-group">
                    <input className="form-control" type="text" placeholder="Search" value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)} />
                    <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => setNameFilter('')} />
                  </div>
                </li>
                <li><div className="dropdown-item" onClick={() => setTableSort('name_asc')}>A - Z</div></li>
                <li><div className="dropdown-item" onClick={() => setTableSort('name_desc')}>Z - A</div></li>
              </ul>
            </div>
          </th>
          <th>
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                Preferred Tutor {filterIcon('tutor')}
              </div>
              <ul className="dropdown-menu dropdown-menu-lg-end">
                <li className="px-2">
                  <div className="input-group">
                    <input className="form-control" type="text" placeholder="Search" value={tutorFilter}
                      onChange={(e) => setTutorFilter(e.target.value)} />
                    <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => setTutorFilter('')} />
                  </div>
                </li>
              </ul>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {studentList()}
      </tbody>
    </table>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>
        Select a Student
      </div>
      <div className='h5'>To View All Session Evaluations</div>
      <div className='d-flex pt-3 px-3 m-3 card bg-light-subtle'>
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
    </div>
  );
}

export default Evals;