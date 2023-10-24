import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";


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

  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th className="w-25">
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                Date
                {filterIcon('date')}
              </div>
              <ul className="dropdown-menu dropdown-menu-lg-end">
                <li><div className="dropdown-item" onClick={() => setTableSort('date_desc')}>Newer First</div></li>
                <li><div className="dropdown-item" onClick={() => setTableSort('date_asc')}>Older First</div></li>
              </ul>
            </div>
          </th>
          {filterBy === 'tutor' ? 
          <th>
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                Student
                {filterIcon('student')}
              </div>
              <ul className="dropdown-menu dropdown-menu-lg-end">
              <li className="px-2">
              <div className="input-group">
                <input className="form-control" type="text" placeholder="Search" value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)} />
                <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => setStudentFilter('')} />
              </div>
            </li>
              </ul>
            </div>
          </th>
          :
          <th>
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                Tutor
                {filterIcon('tutor')}
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
          }
          <th className="w-50">Subject</th>
        </tr>
      </thead>
      <tbody>
        {evalList()}
      </tbody>
    </table>
  )
}

export default EvalsTable;