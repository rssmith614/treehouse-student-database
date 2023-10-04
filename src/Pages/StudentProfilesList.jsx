import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../Services/firebase";

const studentCollRef = collection(db, "students");
const querySnap = await getDocs(studentCollRef);
querySnap.docs.forEach(doc => {
  console.log(doc.id, doc.data())
});

const StudentProfilesList = () => {

  const navigate = useNavigate();

  function selectStudent(id) {
    navigate(`/student/${id}`)
  }

  function studentList() {
    return querySnap.docs.map((doc) => {
      return (
        <div className="card p-3" key={doc.id} onClick={() => selectStudent(doc.id)}
          style={{ cursor: "pointer" }}>
          {doc.data()['student_name']}
        </div>
      )
    })
  }

  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className='d-flex'>
        Student Profiles
      </h1>
      <div className='d-flex p-3 card w-75 bg-light-subtle'>
        {studentList()}
      </div>
    </div>
  );
}

export default StudentProfilesList;