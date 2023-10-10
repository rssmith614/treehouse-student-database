import { deleteDoc, doc, getDoc } from "firebase/firestore";

import { db } from "../Services/firebase";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmergencyContactList from "../Components/EmergencyContactList";

const StudentProfileEdit = () => {
  const [student, setStudent] = useState({});

  const studentRef = useRef();

  const navigate = useNavigate();
  
  const params = useParams();
  
  studentRef.current = doc(db, "students", params.studentid);
  
  useEffect(() => {
    const getStudentData = async () => {
      await getDoc(studentRef.current).then((docs) => setStudent(docs.data()))
    }

    getStudentData();
  }, [params.studentid])
  
  async function backAction() {
    if (!window.confirm("Changes will not be saved")) {
      return;
    }

    navigate(`/student/${studentRef.current.id}`);
  }

  // to be replaced with DB call
    let tutors = ["Robert Smith"]

    function tutorOptions() {
        return tutors.map((tutor) => {
            return (
            <option value={tutor} key={tutor.id}>{tutor}</option>
            );
        });
    }

  const emergencyContactList = () => {
    if (!student.emergency_contacts) return null;
    return student.emergency_contacts.map((c) => {
      return (
        <tr>
          <td>{c.name}</td>
          <td>{c.relation}</td>
          <td>{c.phone}</td>
        </tr>
      )
    })
  }
  
  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className='d-flex display-1'>
        Student - {student.student_name}
      </h1>
      <div className='d-flex p-3 card w-75 bg-light-subtle justify-content-center'>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Birthday</div>
            <input type="date" className="form-control" value={student.student_dob} />
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Grade</div>
            <input type="text" className="form-control" value={student.student_grade} />
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">School</div>
            <input type="text" className="form-control" value={student.student_school} />
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Source</div>
            <input type="text" className="form-control" value={student.student_source} />
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Parent Name</div>
            <input type="text" className="form-control" value={student.parent_name} />
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Parent Phone</div>
            <input type="tel" className="form-control" value={student.parent_phone} />
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Preferred Tutor</div>
            <select type="text" className="form-control" id="preferredTutor">
                <option defaultValue>Select One</option>
                {tutorOptions()}
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Medical Conditions</div>
            <textarea className="d-flex form-control">{student.medical_conditions}</textarea>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Other Info</div>
            <textarea className="d-flex form-control">{student.other}</textarea>
          </div>
        </div>
        {/* <div className="d-flex justify-content-start table-responsive flex-column">
            <div className="d-flex p-3 h3">Emergency Contacts</div>
            <div className="d-flex px-5">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Relation</th>
                    <th scope="col">Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyContactList()}
                </tbody>
              </table>
            </div>
        </div> */}
        <div>
            <EmergencyContactList list={student.emergency_contacts}/>
        </div>
      </div>
      <div className="d-flex">
        <button className="btn btn-secondary m-3" onClick={backAction}>Back to Student</button>
        <button className="btn btn-primary m-3">Save Changes</button>
        {/* <button className="btn btn-danger m-3" onClick={studentRemoval}>Delete Student</button> */}
      </div>
    </div>
  );
}

export default StudentProfileEdit;