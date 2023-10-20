import { doc, getDoc, updateDoc, deleteDoc, getDocs, collection } from "firebase/firestore";

import { db } from "../../Services/firebase";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentProfileEdit = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentRef = useRef();

  const navigate = useNavigate();
  
  const params = useParams();
  
  studentRef.current = doc(db, "students", params.studentid);
  
  useEffect(() => {
    getDoc(studentRef.current).then((docs) => {
      setStudent(docs.data());
      setEmergencyContacts(docs.data().emergency_contacts);
      setSelectedTutor(docs.data().preferred_tutor);
    }).then(setLoading(false));

    getDocs(collection(db, 'tutors'))
      .then((res) => setTutors(res.docs));

  }, [params.studentid])

  async function studentRemoval() {
    if (!window.confirm("Are you sure you want to PERMANENTLY REMOVE the record for this student?")) {
      return;
    }

    await deleteDoc(studentRef.current).then(() => navigate('/students'));
  }

  async function updateStudent(e) {
    e.preventDefault();

    document.getElementById("saveChanges").innerHTML = "Save Changes <span class='spinner-border spinner-border-sm' />";

    let preferredTutorName = tutors.find(tutor => tutor.id === document.getElementById('preferredTutor').value).data().displayName;
    
    const newStudent = {
      student_dob: document.getElementById('studentDOB').value,
      parent_name: document.getElementById('parentName').value,
      parent_phone: document.getElementById('parentPhone').value,
      student_grade: document.getElementById('studentGrade').value,
      student_school: document.getElementById('studentSchool').value,
      student_source: document.getElementById('studentSource').value,
      preferred_tutor: document.getElementById('preferredTutor').value,
      preferred_tutor_name: preferredTutorName,
      other: document.getElementById('extraInfo').value,
      medical_conditions: document.getElementById('medicalConditions').value,
      emergency_contacts: emergencyContacts,
    }
    
    await updateDoc(studentRef.current, newStudent).then(() => navigate(`/student/${studentRef.current.id}`));
  }
  
  function backAction() {
    if (!window.confirm("Changes will not be saved")) {
      return;
    }

    navigate(`/student/${studentRef.current.id}`);
  }

  // to be replaced with DB call
  // let tutors = ["Robert Smith", "Marcus Arellano", "Alex Gonzales"]

  function tutorOptions() {
    return tutors.map((tutor) => {
      return (
        <option value={tutor.id} key={tutor.id}>{tutor.data().displayName}</option>
      );
    });
  }

  function addEContact() {
    setEmergencyContacts([...emergencyContacts, {name:"", relation:"", phone:""}]);
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
    if (Object.keys(student).length === 0) return null;
    return emergencyContacts.map((c, i) => {
      let rowid = "contact" + i;
      return (
        <tr>
          <td><button id={rowid + 'del'} type="button" className="btn btn-danger" onClick={() => {removeEContact(i)}}>🗑️</button></td>
          <td><input id={rowid + 'name'} className="form-control"
            defaultValue={c.name} onBlur={updateEContacts} /></td>
          <td><input id={rowid + 'rel'} className="form-control"
            defaultValue={c.relation} onBlur={updateEContacts} /></td>
          <td><input id={rowid + 'phone'} className="form-control"
            defaultValue={c.phone} onBlur={updateEContacts} /></td>
        </tr>
      )
    })
  }

  const innerForm = (
    <>
      <div className="d-flex justify-content-start">
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Birthday</div>
          <input type="date" id="studentDOB" className="form-control" defaultValue={student.student_dob} />
        </div>
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Grade</div>
          <input type="text" id="studentGrade" className="form-control" defaultValue={student.student_grade} />
        </div>
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">School</div>
          <input type="text" id="studentSchool" className="form-control" defaultValue={student.student_school} />
        </div>
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Source</div>
          <input type="text" id="studentSource" className="form-control" defaultValue={student.student_source} />
        </div>
      </div>
      <div className="d-flex justify-content-start">
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Parent Name</div>
          <input type="text" id="parentName" className="form-control" defaultValue={student.parent_name} />
        </div>
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Parent Phone Number</div>
          <input type="tel" id="parentPhone" className="form-control" defaultValue={student.parent_phone} />
        </div>
      </div>
      <div className="d-flex justify-content-start">
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Preferred Tutor</div>
          <select type="text" className="form-control" id="preferredTutor"
            value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.value)}>
          <option disabled value="">Select One</option>
            {tutorOptions()}
          </select>
        </div>
      </div>
      <div className="d-flex justify-content-start">
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Medical Conditions</div>
          <textarea className="d-flex form-control" id="medicalConditions" defaultValue={student.medical_conditions} />
        </div>
        <div className="d-flex p-3 flex-column">
          <div className="d-flex h3">Other Info</div>
          <textarea className="d-flex form-control" id="extraInfo" defaultValue={student.other} />
        </div>
      </div>
      <div className="d-flex p-3 h3">Emergency Contacts</div>
      <div className="d-flex flex-column px-5">
        <table className="table table-striped">
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
        <button type="button" className="btn btn-secondary me-auto" onClick={addEContact}>Add New Emergency Contact</button>
      </div>
    </>
  );
  
  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Edit Student - {student.student_name}
      </h1>
      <form onSubmit={updateStudent}>
        <div className='d-flex p-3 m-3 card bg-light-subtle'>
          {loading ? <div className="spinner-border align-self-center" /> : innerForm}
        </div>
        <div className="d-flex">
          <button type="button" className="btn btn-secondary m-3 me-auto" onClick={backAction}>Back to Student</button>
          <button type="button" className="btn btn-danger m-3" onClick={studentRemoval}>Delete Student</button>
          <button type="submit" className="btn btn-primary m-3" id="saveChanges">Save Changes</button>
      </div>
      </form>
    </div>
  );
}

export default StudentProfileEdit;