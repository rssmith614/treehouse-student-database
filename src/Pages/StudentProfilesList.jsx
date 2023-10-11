import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../Services/firebase";
import { useEffect, useRef, useState } from "react";

const StudentProfilesList = () => {
  const [querySnap, setQuerySnap] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentCollRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const queryStudents = async () => {
      studentCollRef.current = collection(db, "students");
      const temp = await getDocs(studentCollRef.current);
      setQuerySnap(temp);
    }

    queryStudents()
      .then(setLoading(false));
  }, [])

  function selectStudent(id) {
    navigate(`/student/${id}`)
  }

  function studentList() {
    if (!querySnap) {
      return null;
    }
    if (loading) {
      return (
        <div className="spinner-border d-flex align-self-center" />
      );
    }
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
      <div className='display-1 d-flex'>
        Student Profiles
      </div>
      <div className='d-flex p-3 card w-75 bg-light-subtle'>
        {studentList()}
      </div>
      <button className="btn btn-primary m-3" onClick={() => navigate(`/newstudent`)}>Add New Student</button>
    </div>
  );
}

export default StudentProfilesList;