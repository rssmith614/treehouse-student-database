import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../Services/can";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Services/firebase";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, 'tutors', params.tutorid));

  useEffect(() => {

    getDoc(tutorDocRef.current)
      .then((doc) => setTutor(doc.data()))
      .then(setLoading(false));

  }, [params.tutorid])

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return '';
    }
  }

  const innerContent = (
    <div className="d-flex">
      <div className="d-flex flex-column p-3">
        <div className="h3">Email</div>
        <div>{tutor.email}</div>
      </div>
      <div className="d-flex flex-column p-3">
        <div className="h3">Clearance</div>
        <div>{capitalize(tutor.clearance)}</div>
      </div>
    </div>
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
        <div className='d-flex p-3 card w-75 bg-light-subtle justify-content-center'>
          {loading ? <div className="spinner-border align-self-center" /> : innerContent}
        </div>
      </div>
        <div className="d-flex">
          <button className="btn btn-secondary m-3" onClick={() => navigate('/tutors')}>Back to Tutor List</button>
          <Can I="edit" this={tutorInstance} >
            <button className="btn btn-info m-3" onClick={() => navigate(`/tutor/edit/${tutorDocRef.current.id}`)}>Make Changes</button>
          </Can>
        </div>
    </div>
  )
}

export default TutorProfile;