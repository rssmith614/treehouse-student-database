import { doc, getDoc } from "firebase/firestore";

import { db } from "../Services/firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentProfile = () => {
  const [student, setStudent] = useState({});
  
  const params = useParams();
  
  useEffect(() => {
    const getStudentData = async () => {
      await getDoc(doc(db, "students", params.studentid)).then((docs) => setStudent(docs.data()))
    }

    getStudentData();
  }, [params.studentid])
  
  
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
    </div>
  );
}

export default StudentProfile;