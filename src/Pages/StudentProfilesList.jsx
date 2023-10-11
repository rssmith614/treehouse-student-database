import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../Services/firebase";
import { useEffect, useRef, useState } from "react";

const StudentProfilesList = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const studentCollRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const queryStudents = async () => {
      studentCollRef.current = collection(db, "students");
      await getDocs(studentCollRef.current).then((res) => setStudents(res.docs));
    }

    queryStudents()
      .then(setLoading(false));
  }, [])

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  function selectStudent(id) {
    navigate(`/student/${id}`)
  }

  function studentList() {
    if (!students) {
      return null
    }

    const tableData = students.filter((student) => {
      return student.data()['student_name'].toLowerCase().includes(search.toLowerCase());
    })

    return tableData.map((student) => {
      return (
        <tr className="p-3" key={student.id} onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}>
          <td>
            {student.data()['student_name']}
          </td>
          <td>
            {student.data()['student_source']}
          </td>
          <td></td>
        </tr>
      )
    })
  }

  const listTable = (
    <>
    <div className="d-flex">
      <input type="text" className="form-control my-1 w-25 d-flex" onChange={handleSearch}
        placeholder="Search" />
    </div>
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Student Source</th>
          <th>~~~? (SRS was incomplete)</th>
        </tr>
      </thead>
      <tbody>
        {studentList()}
      </tbody>
    </table>
    </>
  );

  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <div className='display-1 d-flex'>
        Student Profiles
      </div>
      <div className='d-flex p-3 card w-75 bg-light-subtle'>
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
      <button className="btn btn-primary m-3" onClick={() => navigate(`/newstudent`)}>Add New Student</button>
    </div>
  );
}

export default StudentProfilesList;