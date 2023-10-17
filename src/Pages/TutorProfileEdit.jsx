import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../Services/can";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../Services/firebase";


const TutorProfile = () => {
  const [tutor, setTutor] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = doc(db, 'tutors', params.tutorid);

  useEffect(() => {

    getDoc(tutorDocRef)
      .then((doc) => setTutor(doc.data()))
      .then(setLoading(false));

  }, [params.tutorid])

  function handleSubmit(e) {
    e.preventDefault();

    let newClearance = document.getElementById("tutorclearance").value;

    if ((newClearance === "held" || newClearance === "revoked") && (tutor.clearance !== newClearance)) {
      if (!window.confirm(`You are about to REMOVE ALL priveleges for ${tutor.displayName}. They will not be allowed to view or alter any data. Are you sure you want to do this?`)) {
        return;
      }
    } else if (tutor.clearance === "admin" && newClearance !== tutor.clearance) {
      if (!window.confirm(`You are about to REMOVE admin priveleges for ${tutor.displayName}. Are you sure you want to do this?`)) {
        return;
      }
    } else if (newClearance === "admin" && newClearance !== tutor.clearance) {
      if (!window.confirm(`You are about to GRANT admin priveleges to ${tutor.displayName}. They will have full read, write, and edit permissions on all data. Are you sure you want to do this?`)) {
        return;
      }
    }

    tutor.clearance = newClearance;

    updateDoc(tutorDocRef, tutor).then(() => navigate(`/tutor/${tutorDocRef.id}`));
  }

  const innerContent = (
    <div className="d-flex">
      <div className="d-flex flex-column p-3">
        <div className="h3">Email</div>
        <div>{tutor.email}</div>
      </div>
      <div className="d-flex flex-column p-3">
        <div className="h3">Clearance</div>
        <select id="tutorclearance" className="form-control m-1" required>
          <option value="" disabled>Assign Clearance</option>
          <option value="admin" selected={tutor.clearance === "admin"}>Admin</option>
          <option value="tutor" selected={tutor.clearance === "tutor"}>Tutor</option>
          <option value="held" selected={tutor.clearance === "held"}>Held</option>
          <option value="revoked" selected={tutor.clearance === "revoked"}>Revoked</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Tutor Profile - {tutor.displayName}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-row justify-content-center">
          <div className='d-flex p-3 card w-75 bg-light-subtle justify-content-center'>
            {loading ? <div className="spinner-border align-self-center" /> : innerContent}
          </div>
        </div>
        <div className="d-flex">
          <button type="button" className="btn btn-secondary m-3" onClick={() => navigate(`/tutor/${tutorDocRef.id}`)}>Back</button>
          <button type="sumbit" className="btn btn-primary m-3">Submit</button>
        </div>
      </form>
    </div>
  )
}

export default TutorProfile;