import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";
import dayjs from "dayjs";


const StudentEvalsList = () => {
  const [evals, setEvals] = useState([]);
  const [studentName, setStudentName] = useState('');

  const [tableSort, setTableSort] = useState('date_desc');
  const [tableFilter, setTableFilter] = useState('');

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

  function filterIcon(column) {
    switch (column) {
      case 'date':
        if (tableSort === 'date_asc')
          return <i className="bi bi-sort-up ms-auto" />
        else if (tableSort === 'date_desc')
          return <i className="bi bi-sort-down ms-auto" />
        else
          return <i className="bi bi-filter ms-auto" />

      case 'tutor':
        if (tableFilter !== '')
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />
      break;
      default:
        return <i className="bi bi-filter ms-auto" />
    }
  }

  function evalList() {
    // if (evals.length === 0) {
    //   return null
    // }

    // const tableData = evals.filter((evaluation) => {
    //   return evaluation.data().student_name.toLowerCase().includes(search.toLowerCase());
    // })

    // const tableData = evals.filter(() => { return true });
    
    const tableData = evals.filter((evaluation) => {
      return evaluation.data().tutor_name.toLowerCase().includes(tableFilter.toLowerCase());
    })

    // const tableData = evals.filter(() => { return true });

    switch (tableSort) {
      case 'date_asc':
        tableData.sort((a,b) => { return dayjs(a.data().date).diff(dayjs(b.data().date)) });
        break;
      case 'date_desc':
        tableData.sort((a,b) => { return dayjs(b.data().date).diff(dayjs(a.data().date)) });
        break;
      default:
        break;
    }


    return tableData.map((evaluation) => {
      let evaluationData = evaluation.data();
      return (
        <tr key={evaluation.id} onClick={() => selectEval(evaluation.id)}
          style={{ cursor: "pointer" }}>
          <td>{dayjs(evaluationData.date).format('MMMM DD, YYYY')}</td>
          <td>{evaluationData.tutor_name}</td>
          <td>{evaluationData.subject}</td>
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
              <th>
                <div className="dropdown">
                  <div className="d-flex" data-bs-toggle="dropdown">
                    Date
                    {filterIcon('date')}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-lg-end">
                    <li><div className="dropdown-item" onClick={() => setTableSort('date_desc')}>Newer First</div></li>
                    <li><div className="dropdown-item" onClick={() => setTableSort('date_asc')}>Older First</div></li>
                  </ul>
                </div>
              </th>
              <th>
                <div className="dropup">
                  <div className="d-flex" data-bs-toggle="dropdown">
                    Tutor
                    {filterIcon('tutor')}
                  </div>
                  <ul className="dropdown-menu dropdown-menu-lg-end">
                    <li><input className="dropdown-item form-control" placeholder="Search" onChange={(e) => setTableFilter(e.target.value)}></input></li>
                  </ul>
                </div>
              </th>
              <th className="w-50">Subject</th>
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