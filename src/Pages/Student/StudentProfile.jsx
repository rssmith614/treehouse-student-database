import { doc, getDoc } from "firebase/firestore";

import { db } from "../../Services/firebase";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Can } from "../../Services/can";
import EvalsTable from "../../Components/EvalsTable";

const StudentProfile = () => {
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);

  const studentRef = useRef();

  const navigate = useNavigate();
  
  const params = useParams();
  
  studentRef.current = doc(db, "students", params.studentid);
  
  useEffect(() => {

    getDoc(studentRef.current)
      .then((res) => {
        setStudent(res.data());
      }).then(setLoading(false))

  }, [params.studentid])

  const emergencyContactList = () => {
    if (!student.emergency_contacts) return null;
    return student.emergency_contacts.map((c) => {
      return (
        <tr key={c.name}>
          <td>{c.name}</td>
          <td>{c.relation}</td>
          <td>{c.phone}</td>
        </tr>
      )
    })
  }

  const innerContent = (
    <>
    <div className="card-header">
      <ul class="nav nav-underline">
        <li class="nav-item">
          <button class="nav-link active" data-bs-toggle="tab" aria-current="true" href="#about">About</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-bs-toggle="tab" href="#evals">Evaluations</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-bs-toggle="tab" href="#standards">Standards</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-bs-toggle="tab" href="#assessments">Assessments</button>
        </li>
      </ul>
    </div>
    <div className="card-body tab-content">
      <div className="tab-pane active" id="about">
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Birthday</div>
            <div className="d-flex">{student.student_dob}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Grade</div>
            <div className="d-flex">{student.student_grade}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">School</div>
            <div className="d-flex">{student.student_school}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Source</div>
            <div className="d-flex">{student.student_source}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Parent Name</div>
            <div className="d-flex">{student.parent_name}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Parent Phone Number</div>
            <div className="d-flex">{student.parent_phone}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Preferred Tutor</div>
            <div className="d-flex">{student.preferred_tutor_name}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Medical Conditions</div>
            <div className="d-flex">{student.medical_conditions}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Other Info</div>
            <div className="d-flex">{student.other}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start table-responsive flex-column flex-fill">
          <div className="d-flex p-3 h5">Emergency Contacts</div>
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
      </div>
      <div className="tab-pane" id="evals">
        <EvalsTable filterBy='student' id={studentRef.current.id} />
      </div>
      <div className="tab-pane" id="standards">
        <div className="card-title">Standards</div>
      </div>
      <div className="tab-pane" id="assessments">
        <div className="card-title">Assessments</div>
      </div>
    </div>
    </>
  )
  
  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Student Profile - {student.student_name}
      </h1>
      <div className="d-flex ">
        <div className='d-flex m-3 card bg-light-subtle flex-fill'>
          {loading ? <div className="spinner-border align-self-center" /> : innerContent}
        </div>
      </div>
        <div className="d-flex">
          {/* <button className="btn btn-secondary m-3 me-auto" onClick={() => navigate('/students')}>Back to Student List</button> */}
          <Can do="manage" on="students">
            <button className="btn btn-info m-3" onClick={() => navigate(`/student/edit/${studentRef.current.id}`)}>Make Changes</button>
          </Can>
          <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate(`/eval/new/${studentRef.current.id}`)}>New Session Eval</button>
        </div>
    </div>
  );
}

export default StudentProfile;