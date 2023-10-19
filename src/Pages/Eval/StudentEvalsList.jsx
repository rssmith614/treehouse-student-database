import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";


const StudentEvalsList = () => {
  const [evals, setEvals] = useState([]);
  const [studentName, setStudentName] = useState('');

  const [loading, setLoading] = useState(true);

  const params = useParams();

  const navigate = useNavigate();

  useEffect(() => {

    const q = query(collection(db, 'evaluations'), where('student_id', '==', params.studentid))

    getDocs(q)
      .then((docs) => setEvals(docs.docs))
      .then(() => setLoading(false));

    getDoc(doc(db, 'students', params.studentid))
      .then((res) => setStudentName(res.data().student_name));

  }, [params.studentid])

  function selectEval(evalid) {
    navigate(`/eval/${evalid}`)
  }

  function evalList() {
    // if (evals.length === 0) {
    //   return null
    // }

    // const tableData = evals.filter((evaluation) => {
    //   return evaluation.data().student_name.toLowerCase().includes(search.toLowerCase());
    // })

    // const tableData = evals.filter(() => { return true });

    evals.sort((a,b) => { return a.data().date < b.data().date });

    return evals.map((evaluation) => {
      let evaluationData = evaluation.data();
      return (
        <tr className="p-3" key={evaluation.id} onClick={() => selectEval(evaluation.id)}
          style={{ cursor: "pointer" }}>
          <td>
            {evaluationData.date}
          </td>
          <td>
            {evaluationData.tutor_name}
          </td>
          <td>
            {evaluationData.subject}
          </td>
        </tr>
      )
    })
  }

  const listTable = (
    <>
    {/* <div className="d-flex">
      <input type="text" className="form-control mb-3 w-25 d-flex" onChange={handleSearch}
        placeholder="Search" />
    </div> */}
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Date</th>
          <th>Tutor</th>
          <th>Subject</th>
        </tr>
      </thead>
      <tbody>
        {evalList()}
      </tbody>
    </table>
    </>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>
        Evaluations - {studentName}
      </div>
      <div className='d-flex p-3 m-3 card bg-light-subtle'>
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
      <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate(`/eval/new/${params.studentid}`)}>New Session Eval</button>
    </div>
  );
}

export default StudentEvalsList;