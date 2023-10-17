import { addDoc, collection } from "firebase/firestore";
import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";


const NewTutorPage = () => {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
  
    const tutorCollRef = collection(db, "tutors");
    addDoc(tutorCollRef, {
      email: document.getElementById("tutoremail").value,
      clearance: document.getElementById("tutorclearance").value,
      activated: false,
    }).then(() => navigate('/tutors'));
  }

  return (
    <div className="d-flex flex-column vh-100 justify-content-evenly">
      <div className="d-flex justify-content-center">
        <div className="d-flex card p-3 m-3 bg-light-subtle w-50">
          <form className="d-flex flex-column p-1" onSubmit={handleSubmit}>
            <span>
              Enter the new tutor's email, associated with a Google Account. The next time they attempt to log in, the system will grant them access.
            </span>
            <input id="tutoremail" className="form-control m-1" type="email" placeholder="Email" required />
            <select id="tutorclearance" className="form-control m-1" required>
              <option value="" disabled>Assign Clearance</option>
              <option value="admin">Admin</option>
              <option value="tutor">Tutor</option>
              <option value="held">Held</option>
              <option value="revoked">Revoked</option>
            </select>
            <button className="btn btn-primary m-1" type="submit">Submit</button>
          </form>
        </div>
      </div>
      <div className="p-5"></div>
    </div>
  )
}

export default NewTutorPage;