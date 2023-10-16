import { useEffect, useState } from "react";
import { db } from "../Services/firebase";

import { collection, getDocs } from "firebase/firestore";

const TutorProfilesList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    const tutorCollRef = collection(db, "tutors");
    const queryTutors = async () => {
      await getDocs(tutorCollRef).then((res) => setTutors(res.docs));
    }

    queryTutors()
      .then(setLoading(false));
  }, [])
  
  function selectTutor(tutor) {
    console.log(tutor);
  }

  const tutorRows = () => {
    return tutors.map((tutor) => {
      let tutorData =  tutor.data();
      return (
        <tr className="p-3" key={tutor.id} onClick={() => selectTutor(tutor.id)}
          style={{ cursor: "pointer" }}>
          <td>{tutorData.displayName}</td>
          <td>{tutorData.email}</td>
          <td>{tutorData.clearance || 'None Assigned'}</td>
        </tr>
      )
    })
  }

  const listTable = (
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
  );

  return (
    <div className="d-flex flex-column m-3">
      <div className="d-flex display-1">
        Tutors
      </div>
      <div className="d-flex card p-3 m-3 bg-light-subtle">
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
    </div>
  )
}

export default TutorProfilesList;