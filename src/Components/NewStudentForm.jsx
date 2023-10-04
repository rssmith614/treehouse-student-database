import { useState } from "react";
import { db } from "../Services/firebase";

import { addDoc, collection } from "firebase/firestore";


// to be replaced with DB call
let tutors = ["Robert Smith"]

function tutorOptions() {
  return tutors.map((tutor) => {
    return (
      <option value={tutor}>{tutor}</option>
    );
  });
}

const NewStudentForm = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  function addEContact() {
    setEmergencyContacts([...emergencyContacts, {id: emergencyContacts.length, name:"", relation:"", phone:""}]);
  }

  function removeEContact(id) {
    const newList = emergencyContacts.filter(contact => contact.id !== id);
    setEmergencyContacts(newList);
  }
  
  function eContacts() {
    return emergencyContacts.map((contact, i) => {
      let rowid = "contact" + i;
      return (
        <div className="row" key={i}>
          <div className="col mb-1">
            <label for={rowid + 'name'} class="form-label">Name</label>
            <input type="text" class="form-control" id={rowid + 'name'} defaultValue={contact.name} />
          </div>
          <div className="col mb-1">
            <label for={rowid + 'rel'} class="form-label">Relation</label>
            <input type="text" class="form-control" id={rowid + 'rel'} defaultValue={contact.relation} />
          </div>
          <div className="col mb-1">
            <label for={rowid + 'phone'} class="form-label">Phone</label>
            <input type="tel" class="form-control" id={rowid + 'phone'} defaultValue={contact.phone} />
          </div>
          {/* <div className="col mb-1 position-relative">
            <button type="button" onClick={() => removeEContact(contact.id)}
              class="form-control btn btn-danger
              position-absolute bottom-0">Remove</button>
          </div> */}
        </div>
      );
    });
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
  
    console.log(newStudent);

    const studentCollRef = collection(db, "students");
    await addDoc(studentCollRef, newStudent);
  }

  return (
    <>
    <form onSubmit={addStudent}>
      <div className="row">
        <div class="col mb-3">
          <label for="studentName" class="form-label">Student Name</label>
          <input type="text" class="form-control" id="studentName" />
        </div>
        <div class="col mb-3">
        <label for="studentDOB" class="form-label">Student DOB</label>
        <input type="date" class="form-control" id="studentDOB" />
      </div>
      </div>
      <div className="row">
        <div class="col mb-3">
          <label for="parentName" class="form-label">Parent Name</label>
          <input type="text" class="form-control" id="parentName" />
        </div>
        <div class="col mb-3">
          <label for="parentPhone" class="form-label">Parent Phone</label>
          <input type="tel" class="form-control" id="parentPhone" />
        </div>
      </div>
      <div className="row">
        <div class="col mb-3">
          <label for="studentGrade" class="form-label">Student Grade</label>
          <input type="text" class="form-control" id="studentGrade" />
        </div>
        <div class="col mb-3">
          <label for="studentSchool" class="form-label">Student School</label>
          <input type="text" class="form-control" id="studentSchool" />
        </div>
      </div>
      <div class="mb-3">
        <label for="studentSource" class="form-label">Student Source</label>
        <input type="text" class="form-control" id="studentSource" />
      </div>

      <div class="mb-3">
        <label for="preferredTutor" class="form-label">Preferred Tutor</label>
        <select type="text" class="form-control" id="preferredTutor">
          <option defaultValue>Select One</option>
          {tutorOptions()}
        </select>
      </div>
      
      <div class="mb-3">
        <label for="extraInfo" class="form-label">Other Info</label>
        <textarea class="form-control" id="extraInfo" />
      </div>
      <div class="mb-3">
        <label for="medicalConditions" class="form-label">Medical Conditions</label>
        <textarea class="form-control" id="medicalConditions" />
      </div>
      <span className="mb-3">Emergency Contacts</span>
      <div class="mx-3 mb-3" id="emergencyContacts">
        {eContacts()}
      </div>
      <button className="btn btn-secondary mb-3" type="button" onClick={addEContact}>Add New Emergency Contact</button>

      <br/>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>

    
    </>
  );
}

export default NewStudentForm;