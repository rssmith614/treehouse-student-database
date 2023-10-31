import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../../Services/can";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Services/firebase";
import EvalsTable from "../../Components/EvalsTable";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, 'tutors', params.tutorid));

  useEffect(() => {

    getDoc(tutorDocRef.current)
      .then((doc) => setTutor(doc.data()))

  }, [params.tutorid])

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return '';
    }
  }
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
        <div className='d-flex flex-fill m-3 card bg-light-subtle justify-content-center'>
          <div className="card-header">
            <ul className="nav nav-underline">
              <li className="nav-item">
                <button className="nav-link active" data-bs-toggle="tab" aria-current="true" href="#about">About</button>
              </li>
              <li className="nav-item">
                <button className="nav-link" data-bs-toggle="tab" href="#evals">Evaluations</button>
              </li>
            </ul>
          </div>
          <div className="card-body tab-content">
            <div className="tab-pane active" id="about">
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
            </div>
            <div className="tab-pane" id="evals">
              <div className="d-flex flex-column">
                <EvalsTable filterBy='tutor' id={tutorDocRef.current.id} />
              </div>
            </div>
          </div>
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