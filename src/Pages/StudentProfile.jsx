import { deleteDoc, doc, getDoc } from "firebase/firestore";

import { db } from "../Services/firebase";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const StudentProfile = () => {
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
  
  async function studentRemoval() {
    if (!window.confirm("Are you sure you want to PERMANENTLY REMOVE the record for this student?")) {
      return;
    }

    await deleteDoc(studentRef.current).then(() => navigate('/students'));
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
            <div className="d-flex">{student.student_dob}</div>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Grade</div>
            <div className="d-flex">{student.student_grade}</div>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">School</div>
            <div className="d-flex">{student.student_school}</div>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Source</div>
            <div className="d-flex">{student.student_source}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Parent Name</div>
            <div className="d-flex">{student.parent_name}</div>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Parent Phone Number</div>
            <div className="d-flex">{student.parent_phone}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Preferred Tutor</div>
            <div className="d-flex">{student.preferred_tutor}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Medical Conditions</div>
            <div className="d-flex">{student.medical_conditions}</div>
          </div>
          <div className="d-flex p-3 flex-column">
            <div className="d-flex h3">Other Info</div>
            <div className="d-flex">{student.other}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start table-responsive flex-column">
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
        </div>
        <hr />
        <div>
          Evals, Assessments
        </div>
      </div>
      <div className="d-flex">
        <button className="btn btn-secondary m-3" onClick={() => navigate('/students')}>Back to Student List</button>
        <button className="btn btn-info m-3" onClick={() => navigate(`/student/edit/${studentRef.current.id}`)}>Make Changes</button>
        <button className="btn btn-danger m-3" onClick={studentRemoval}>Delete Student</button>
      </div>
    </div>
  );
}

export default StudentProfile;