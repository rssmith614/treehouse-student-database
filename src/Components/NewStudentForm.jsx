import { useState } from "react";
import { db } from "../Services/firebase";

import { addDoc, collection } from "firebase/firestore";
// import EmergencyContactList from "./EmergencyContactList";
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
    debugger;
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

  function updateEContacts() {
    let newList = emergencyContacts.map((e) => {return e});
    newList.forEach((eContact, i) => {
      eContact.name = document.getElementById(`contact${i}name`).value;
      eContact.relation = document.getElementById(`contact${i}rel`).value;
      eContact.phone = document.getElementById(`contact${i}phone`).value;
    })

    setEmergencyContacts(newList);
  }

  function removeEContact(idx) {
    if (typeof(idx) === "object") idx.preventDefault();
    let newList = emergencyContacts.map((e) => {return e});
  
    newList.forEach((eContact, i) => {
      document.getElementById(`contact${i}name`).value = "";
      document.getElementById(`contact${i}rel`).value = "";
      document.getElementById(`contact${i}phone`).value = "";
    });
    
    newList.splice(idx, 1);

    newList.forEach((eContact, i) => {
      document.getElementById(`contact${i}name`).value = eContact.name;
      document.getElementById(`contact${i}rel`).value = eContact.relation;
      document.getElementById(`contact${i}phone`).value = eContact.phone;
    });

    setEmergencyContacts(newList);
  }

  const emergencyContactList = () => {
    if (!emergencyContacts) return null;
    return emergencyContacts.map((c, i) => {
      let rowid = "contact" + i;
      return (
        <tr>
          <td><button id={rowid + 'del'} type="button" className="btn btn-danger" onClick={() => {removeEContact(i)}}>🗑️</button></td>
          <td><input id={rowid + 'name'} className="form-control" onBlur={updateEContacts} /></td>
          <td><input id={rowid + 'rel'} className="form-control" onBlur={updateEContacts} /></td>
          <td><input id={rowid + 'phone'} className="form-control" onBlur={updateEContacts} /></td>
        </tr>
      )
    })
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
          <label for="parentPhone" className="form-label">Parent Phone Number</label>
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
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Relation</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {emergencyContactList()}
          </tbody>
        </table>
      <button className="d-flex btn btn-secondary mb-3" type="button" onClick={addEContact}>Add New Emergency Contact</button>
      </div>

      <br/>
      <button type="submit" className="btn btn-primary">Submit</button>
    </form>

    
    </>
  );
}

export default NewStudentForm;