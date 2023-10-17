import { useEffect, useState } from "react";
import { db } from "../Services/firebase";

import { collection, getDocs } from "firebase/firestore";
import { Can } from "../Services/can";
import { useNavigate } from "react-router-dom";

const TutorProfilesList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() =>{
    const tutorCollRef = collection(db, "tutors");
    const queryTutors = async () => {
      await getDocs(tutorCollRef).then((res) => setTutors(res.docs));
    }

    queryTutors()
      .then(setLoading(false));
  }, [])
  
  function selectTutor(tutor) {
    navigate(`/tutor/${tutor}`);
  }

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return '';
    }
  }

  const tutorRows = () => {
    const tableData = tutors.filter((tutor) => {
      return tutor.data().displayName.toLowerCase().includes(search.toLowerCase());
    })
    tableData.sort((a,b) => {return a.displayName > b.displayName});
    return tableData.map((tutor) => {
      let tutorData =  tutor.data();
      return (
        <tr className="p-3" key={tutor.id} onClick={() => selectTutor(tutor.id)}
          style={{ cursor: "pointer" }}>
          <td>{tutorData.displayName || "Not Activated"}</td>
          <td>{tutorData.email}</td>
          <td>{capitalize(tutorData.clearance) || 'None Assigned'}</td>
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
          <th>Name</th>
          <th>Email</th>
          <th>Clearance</th>
        </tr>
      </thead>
      <tbody>
        {tutorRows()}
      </tbody>
    </table>
    </>
  );

  return (
    <div className="d-flex flex-column m-3">
      <div className="d-flex display-1">
        Tutors
      </div>
      <div className="d-flex card p-3 m-3 bg-light-subtle">
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
      <Can do="manage" on="tutors">
        <button className="btn btn-primary m-3 w-25 align-self-end" onClick={() => navigate('/newtutor')}>Register New Tutor</button>
      </Can>
    </div>
  )
}

export default TutorProfilesList;