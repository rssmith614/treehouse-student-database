import { collection, getDocs } from "firebase/firestore";

import { useNavigate } from 'react-router-dom';

import { db } from "../../Services/firebase";
import { useEffect, useRef, useState } from "react";

const Evals = () => {
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
    navigate(`/evals/${id}`)
  }

  function studentList() {
    if (!students) {
      return null
    }

    const tableData = students.filter((student) => {
      return student.data().student_name.toLowerCase().includes(search.toLowerCase());
    })

    tableData.sort((a,b) => { return a.data().student_name.localeCompare(b.data().student_name) });

    return tableData.map((student) => {
      let studentData = student.data();
      return (
        <tr className="p-3" key={student.id} onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}>
          <td>
            {studentData.student_name}
          </td>
          <td>
            {studentData.preferred_tutor_name}
          </td>
        </tr>
      )
    })
  }

  const listTable = (
    <>
    <div className="d-flex">
      <input type="text" className="form-control mb-3 w-25 d-flex" onChange={handleSearch}
        placeholder="Search" />
    </div>
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Preferred Tutor</th>
        </tr>
      </thead>
      <tbody>
        {studentList()}
      </tbody>
    </table>
    </>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>
        Select a Student
      </div>
      <div className='h5'>To View All Session Evaluations</div>
      <div className='d-flex p-3 m-3 card bg-light-subtle'>
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
    </div>
  );
}

export default Evals;