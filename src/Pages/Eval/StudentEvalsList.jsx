import {  doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";
import EvalsTable from "../../Components/EvalsTable";


const StudentEvalsList = () => {
  const [studentName, setStudentName] = useState('');

  const params = useParams();

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(doc(db, 'students', params.studentid))
      .then((res) => setStudentName(res.data().student_name));

  }, [params.studentid])

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>
        Evaluations - {studentName}
      </div>
      <div className='d-flex pt-3 px-3 m-3 card bg-light-subtle'>
        <EvalsTable filterBy='student' id={params.studentid} />
      </div>
      <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate(`/eval/new/${params.studentid}`)}>New Session Eval</button>
    </div>
  );
}

export default StudentEvalsList;