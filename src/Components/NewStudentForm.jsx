import { useEffect, useState } from "react";
import { db } from "../Services/firebase";

import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// to be replaced with DB call
// let tutors = ["Robert Smith", "Marcus Arellano", "Alex Gonzales"];

const NewStudentForm = () => {
  const [tutors, setTutors] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeTutors = onSnapshot(collection(db, "tutors"), (res) => {
      setTutors(res.docs);
    });

    return () => unsubscribeTutors();
  });

  function addEContact() {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: "", relation: "", phone: "" },
    ]);
  }

  async function addStudent(e) {
    e.preventDefault();

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    let preferredTutorName = tutors
      .find(
        (tutor) => tutor.id === document.getElementById("preferredTutor").value,
      )
      .data().displayName;

    const newStudent = {
      student_name: document.getElementById("studentName").value,
      student_dob: document.getElementById("studentDOB").value,
      parent_name: document.getElementById("parentName").value,
      parent_phone: document.getElementById("parentPhone").value,
      student_grade: document.getElementById("studentGrade").value,
      student_school: document.getElementById("studentSchool").value,
      student_source: document.getElementById("studentSource").value,
      preferred_tutor: document.getElementById("preferredTutor").value,
      preferred_tutor_name: preferredTutorName,
      other: document.getElementById("extraInfo").value,
      medical_conditions: document.getElementById("medicalConditions").value,
      emergency_contacts: emergencyContacts,
    };

    const studentCollRef = collection(db, "students");
    await addDoc(studentCollRef, newStudent).then(() => navigate("/students"));
  }

  function updateEContacts() {
    let newList = emergencyContacts.map((e) => {
      return e;
    });
    newList.forEach((eContact, i) => {
      eContact.name = document.getElementById(`contact${i}name`).value;
      eContact.relation = document.getElementById(`contact${i}rel`).value;
      eContact.phone = document.getElementById(`contact${i}phone`).value;
    });

    setEmergencyContacts(newList);
  }

  function removeEContact(idx) {
    if (typeof idx === "object") idx.preventDefault();
    let newList = emergencyContacts.map((e) => {
      return e;
    });

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
        <tr key={i}>
          <td>
            <button
              id={rowid + "del"}
              type='button'
              className='btn btn-danger'
              onClick={() => {
                removeEContact(i);
              }}
            >
              🗑️
            </button>
          </td>
          <td>
            <input
              id={rowid + "name"}
              className='form-control'
              onBlur={updateEContacts}
            />
          </td>
          <td>
            <input
              id={rowid + "rel"}
              className='form-control'
              onBlur={updateEContacts}
            />
          </td>
          <td>
            <input
              id={rowid + "phone"}
              className='form-control'
              onBlur={updateEContacts}
            />
          </td>
        </tr>
      );
    });
  };

  function tutorOptions() {
    return tutors.map((tutor) => {
      return (
        <option value={tutor.id} key={tutor.id}>
          {tutor.data().displayName}
        </option>
      );
    });
  }

  function backAction() {
    if (!window.confirm("Changes will not be saved")) {
      return;
    }

    navigate("/students");
  }

  return (
    <>
      <form onSubmit={addStudent}>
        <div className='row'>
          <div className='col mb-3'>
            <label htmlFor='studentName' className='form-label h5'>
              Student Name
            </label>
            <input
              type='text'
              className='form-control'
              id='studentName'
              required
            />
          </div>
          <div className='col mb-3'>
            <label htmlFor='studentDOB' className='form-label h5'>
              Student DOB
            </label>
            <input type='date' className='form-control' id='studentDOB' />
          </div>
        </div>
        <div className='row'>
          <div className='col mb-3'>
            <label htmlFor='parentName' className='form-label h5'>
              Parent Name
            </label>
            <input type='text' className='form-control' id='parentName' />
          </div>
          <div className='col mb-3'>
            <label htmlFor='parentPhone' className='form-label h5'>
              Parent Phone Number
            </label>
            <input type='tel' className='form-control' id='parentPhone' />
          </div>
        </div>
        <div className='row'>
          <div className='col mb-3'>
            <label htmlFor='studentGrade' className='form-label h5'>
              Student Grade
            </label>
            <input type='text' className='form-control' id='studentGrade' />
          </div>
          <div className='col mb-3'>
            <label htmlFor='studentSchool' className='form-label h5'>
              Student School
            </label>
            <input type='text' className='form-control' id='studentSchool' />
          </div>
        </div>
        <div className='mb-3'>
          <label htmlFor='studentSource' className='form-label h5'>
            Student Source
          </label>
          <input type='text' className='form-control' id='studentSource' />
        </div>

        <div className='mb-3'>
          <label htmlFor='preferredTutor' className='form-label h5'>
            Preferred Tutor
          </label>
          <select
            type='text'
            className='form-control'
            id='preferredTutor'
            defaultValue=''
            required
          >
            <option disabled value=''>
              Select One
            </option>
            {tutorOptions()}
          </select>
        </div>

        <div className='mb-3'>
          <label htmlFor='extraInfo' className='form-label h5'>
            Other Info
          </label>
          <textarea className='form-control' id='extraInfo' />
        </div>
        <div className='mb-3'>
          <label htmlFor='medicalConditions' className='form-label h5'>
            Medical Conditions
          </label>
          <textarea className='form-control' id='medicalConditions' />
        </div>
        <div className='mb-3 h5'>Emergency Contacts</div>
        <div className='d-flex flex-column mx-3 mb-3' id='emergencyContacts'>
          <table className='table'>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Relation</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>{emergencyContactList()}</tbody>
          </table>
          <button
            className='btn btn-secondary mb-3 me-auto'
            type='button'
            onClick={addEContact}
          >
            Add New Emergency Contact
          </button>
        </div>

        <button
          type='button'
          className='btn btn-secondary m-3'
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button type='submit' className='btn btn-primary m-3' id='submit'>
          Submit
        </button>
      </form>
    </>
  );
};

export default NewStudentForm;
