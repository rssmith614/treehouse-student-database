import { useEffect, useState } from "react";
import { db } from "../../Services/firebase";

import { collection, getDocs } from "firebase/firestore";
import { Can } from "../../Services/can";
import { useNavigate } from "react-router-dom";

const TutorProfilesList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState('');
  const [tableSort, setTableSort] = useState('name_asc');

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

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return '';
    }
  }

  const tutorRows = () => {
    const tableData = tutors.filter((tutor) => {
      return tutor.data().displayName.toLowerCase().includes(nameFilter.toLowerCase());
    })

    if (tableSort === 'name_asc')
      tableData.sort((a,b) => { return a.data().displayName.localeCompare(b.data().displayName) });
    else if (tableSort === 'name_desc')
      tableData.sort((a,b) => { return b.data().displayName.localeCompare(a.data().displayName) });

    return tableData.map((tutor) => {
      let tutorData = tutor.data();
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

  function filterIcon(column) {
    switch (column) {
      case 'name':
        if (!tableSort.includes('name') && nameFilter === '') { // neither
          return <i className="bi bi-filter ms-auto" />
        } else if (tableSort.includes('name') && nameFilter !== '') { // both
          if (tableSort === 'name_asc')
            return <><i className="bi bi-sort-alpha-up" /><i className="bi bi-funnel-fill" /></>
          else if (tableSort === 'name_desc')
            return <><i className="bi bi-sort-alpha-down-alt" /><i className="bi bi-funnel-fill" /></>
        } else if (nameFilter !== '') { // filter only
          return <i className="bi bi-funnel-fill ms-auto" />
        } else { // sort only
          if (tableSort === 'name_asc')
            return <i className="bi bi-sort-alpha-up ms-auto" />
          else if (tableSort === 'name_desc')
            return <i className="bi bi-sort-alpha-down-alt ms-auto" />
        }

        break;

      default:
        return <i className="bi bi-filter ms-auto" />
    }
  }

  let temp = <div>Search <i className="bi bi-x ms-auto" /></div>

  const listTable = (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>
            <div className="dropup">
              <div className="d-flex" data-bs-toggle="dropdown">
                <div className="me-auto">Name</div> {filterIcon('name')}
              </div>
              <ul className="dropdown-menu dropdown-menu-lg-end">
                <li className="px-2">
                  <div className="input-group">
                    <input className="form-control" type="text" placeholder="Search" value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)} />
                    <i className="bi bi-x-lg input-group-text" style={{ cursor: "pointer" }} onClick={() => setNameFilter('')} />
                  </div>
                </li>
                <li><div className="dropdown-item" onClick={() => setTableSort('name_asc')}>A - Z</div></li>
                <li><div className="dropdown-item" onClick={() => setTableSort('name_desc')}>Z - A</div></li>
              </ul>
            </div>
          </th>
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
      <div className="d-flex card pt-3 px-3 m-3 bg-light-subtle">
        {loading ? <div className="spinner-border d-flex align-self-center" /> : listTable}
      </div>
      <Can do="manage" on="tutors">
        <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate('/newtutor')}>Register New Tutor</button>
      </Can>
    </div>
  )
}

export default TutorProfilesList;