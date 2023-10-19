import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../Services/can";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../Services/firebase";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // const tableData = evals.filter((evaluation) => {
    //   return evaluation.data().student_name.toLowerCase().includes(search.toLowerCase());
    // })

    // const tableData = evals.filter(() => { return true });

    evals.sort((a,b) => { return a.data().date < b.data().date });

    return evals.map((evaluation) => {
      let evaluationData = evaluation.data();
      return (
        <tr className="p-3" key={evaluation.id} onClick={() => selectEval(evaluation.id)}
          style={{ cursor: "pointer" }}>
          <td>{evaluationData.date}</td>
          <td>{evaluationData.student_name}</td>
          <td>{evaluationData.subject}</td>
        </tr>
      )
    })
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
      <div className="d-flex">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            {evalList()}
          </tbody>
        </table>
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