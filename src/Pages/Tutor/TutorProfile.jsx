import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../../Services/can";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Services/firebase";
import dayjs from "dayjs";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tableSort, setTableSort] = useState('date_desc');
  const [tableFilter, setTableFilter] = useState('');

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, 'tutors', params.tutorid));

  useEffect(() => {

    getDoc(tutorDocRef.current)
      .then((doc) => setTutor(doc.data()))
      .then(setLoading(false));

    getDocs(query(collection(db, 'evaluations'), where('tutor_id', '==', tutorDocRef.current.id)))
      .then((res) => setEvals(res.docs));

  }, [params.tutorid])

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return '';
    }
  }

  function selectEval(evalid) {
    navigate(`/eval/${evalid}`);
  }

  function evalList() {
    // if (evals.length === 0) {
    //   return null
    // }

    const tableData = evals.filter((evaluation) => {
      return evaluation.data().student_name.toLowerCase().includes(tableFilter.toLowerCase());
    })

    // const tableData = evals.filter(() => { return true });

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
        <tr key={evaluation.id} onClick={() => selectEval(evaluation.id)}
          style={{ cursor: "pointer" }}>
          <td>{dayjs(evaluationData.date).format('MMMM DD, YYYY')}</td>
          <td>{evaluationData.student_name}</td>
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
        if (tableFilter !== '')
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />
      break;        
      default:
        return <i className="bi bi-filter ms-auto" />
    }
  }

  const innerContent = (
    <>
      <div className="d-flex">
        <img src={tutor.photoURL} alt="" />
        <div className="d-flex flex-column p-3">
          <div className="h3">Email</div>
          <div>{tutor.email}</div>
        </div>
        <div className="d-flex flex-column p-3">
          <div className="h3">Clearance</div>
          <div>{capitalize(tutor.clearance)}</div>
        </div>
      </div>
      <hr />
      <div className="h3">Evaluations</div>
      <div className="d-flex flex-column">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>
                <div className="dropdown">
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
              <th>
                <div className="dropup">
                  <div className="d-flex" data-bs-toggle="dropdown">
                    Student
                    {filterIcon('student')}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-lg-end">
                    {/* <li><div className="dropdown-item" onClick={() => setTableFilter('student_asc')}>Ascending</div></li>
                    <li><div className="dropdown-item" onClick={() => setTableFilter('student_desc')}>Descending</div></li> */}
                    <li><input className="dropdown-item form-control" placeholder="Search" onChange={(e) => setTableFilter(e.target.value)}></input></li>
                  </ul>
                </div>
              </th>
              <th className="w-50">Subject</th>
            </tr>
          </thead>
          <tbody>
            {evalList()}
          </tbody>
        </table>
        <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate(`/eval/new`)}>New Eval</button>
      </div>
    </>
  );

  class Tutor {
    constructor(dict) {
      for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
          this[key] = dict[key];
        }
      }
    }
  }

  let tutorInstance = new Tutor(tutor);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Tutor Profile - {tutor.displayName}
      </h1>
      <div className="d-flex flex-row justify-content-center">
        <div className='d-flex flex-fill m-3 p-3 card bg-light-subtle justify-content-center'>
          {loading ? <div className="spinner-border align-self-center" /> : innerContent}
        </div>
      </div>
        <div className="d-flex">
          <Can I="edit" this={tutorInstance} >
            <button className="btn btn-info m-3 ms-auto" onClick={() => navigate(`/tutor/edit/${tutorDocRef.current.id}`)}>Make Changes</button>
          </Can>
        </div>
    </div>
  )
}

export default TutorProfile;