import { useState } from "react";
import { db } from "../Services/firebase";

import { addDoc, collection } from "firebase/firestore";
import EmergencyContactList from "./EmergencyContactList";
import { useNavigate } from "react-router-dom";


// to be replaced with DB call
let tutors = ["Robert Smith"]

function tutorOptions() {
  return tutors.map((tutor) => {
    return (
      <option value={tutor} key={tutor.id}>{tutor}</option>
    );
  });
}

const NewStudentForm = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const navigate = useNavigate();

  function addEContact() {
    setEmergencyContacts([...emergencyContacts, {name:"", relation:"", phone:""}]);
  }


  async function addStudent(e) {
    e.preventDefault();
    const newStudent = {
      student_name: document.getElementById('studentName').value,
      student_dob: document.getElementById('studentDOB').value,
      parent_name: document.getElementById('parentName').value,
      parent_phone: document.getElementById('parentPhone').value,
      student_grade: document.getElementById('studentGrade').value,
      student_school: document.getElementById('studentSchool').value,
      student_source: document.getElementById('studentSource').value,
      preferred_tutor: document.getElementById('preferredTutor').value,
      other: document.getElementById('extraInfo').value,
      medical_conditions: document.getElementById('medicalConditions').value,
      emergency_contacts: emergencyContacts,
    }

    const studentCollRef = collection(db, "students");
    await addDoc(studentCollRef, newStudent).then(() => navigate('/students'));
  }

  return (
    <>
    <form onSubmit={addStudent}>
      <div className="row">
        <div className="col mb-3">
          <label for="studentName" className="form-label">Student Name</label>
          <input type="text" className="form-control" id="studentName" />
        </div>
        <div className="col mb-3">
        <label for="studentDOB" className="form-label">Student DOB</label>
        <input type="date" className="form-control" id="studentDOB" />
      </div>
      </div>
      <div className="row">
        <div className="col mb-3">
          <label for="parentName" className="form-label">Parent Name</label>
          <input type="text" className="form-control" id="parentName" />
        </div>
        <div className="col mb-3">
          <label for="parentPhone" className="form-label">Parent Phone</label>
          <input type="tel" className="form-control" id="parentPhone" />
        </div>
      </div>
      <div className="row">
        <div className="col mb-3">
          <label for="studentGrade" className="form-label">Student Grade</label>
          <input type="text" className="form-control" id="studentGrade" />
        </div>
        <div className="col mb-3">
          <label for="studentSchool" className="form-label">Student School</label>
          <input type="text" className="form-control" id="studentSchool" />
        </div>
      </div>
      <div className="mb-3">
        <label for="studentSource" className="form-label">Student Source</label>
        <input type="text" className="form-control" id="studentSource" />
      </div>

      <div className="mb-3">
        <label for="preferredTutor" className="form-label">Preferred Tutor</label>
        <select type="text" className="form-control" id="preferredTutor">
          <option defaultValue>Select One</option>
          {tutorOptions()}
        </select>
      </div>
      
      <div className="mb-3">
        <label for="extraInfo" className="form-label">Other Info</label>
        <textarea className="form-control" id="extraInfo" />
      </div>
      <div className="mb-3">
        <label for="medicalConditions" className="form-label">Medical Conditions</label>
        <textarea className="form-control" id="medicalConditions" />
      </div>
      <span className="mb-3">Emergency Contacts</span>
      <div className="mx-3 mb-3" id="emergencyContacts">
        <EmergencyContactList list={emergencyContacts} setList={setEmergencyContacts} />
      </div>
      <button className="btn btn-secondary mb-3" type="button" onClick={addEContact}>Add New Emergency Contact</button>

      <br/>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>

    
    </>
  );
}

export default NewStudentForm;