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
  
  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className='d-flex'>
        Student - {student.student_name}
      </h1>
      <div className='d-flex p-3 card w-75 bg-light-subtle justify-content-center'>
        <div>
          Info
        </div>
        <hr />
        <div>
          Evals, Assessments
        </div>
      </div>
      <button className="btn btn-danger m-3" onClick={studentRemoval}>Delete Student</button>
    </div>
  );
}

export default StudentProfile;