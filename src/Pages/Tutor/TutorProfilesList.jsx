import React, { useEffect, useState } from "react";
import { db } from "../../Services/firebase";

import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Card, Dropdown, Form, InputGroup } from "react-bootstrap";
import Avatar from "boring-avatars";

const TutorProfilesList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState("");
  const [tableSort, setTableSort] = useState("name_asc");
  const [subjectFilter, setSubjectFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const tutorCollRef = collection(db, "tutors");

    const unsubscribeTutors = onSnapshot(tutorCollRef, (snapshot) => {
      setTutors(snapshot.docs);
      setLoading(false);
    });

    return () => {
      unsubscribeTutors();
    };
  }, []);

  function selectTutor(tutor) {
    navigate(`/tutor/${tutor}`);
  }

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (e) {
      return "";
    }
  }

  const tutorRows = () => {
    const tableData = tutors.filter((tutor) => {
      return (
        tutor.data().clearance !== "pending" &&
        (tutor.data().displayName || "")
          .toLowerCase()
          .includes(nameFilter.toLowerCase()) &&
        (tutor.data().preferredSubjects || "")
          .toLowerCase()
          .includes(subjectFilter.toLowerCase())
      );
    });

    if (tableSort === "name_asc")
      tableData.sort((a, b) => {
        return a.data().displayName.localeCompare(b.data().displayName);
      });
    else if (tableSort === "name_desc")
      tableData.sort((a, b) => {
        return b.data().displayName.localeCompare(a.data().displayName);
      });

    return tableData.map((tutor) => {
      let tutorData = tutor.data();
      return (
        <tr
          className='p-3'
          key={tutor.id}
          onClick={() => selectTutor(tutor.id)}
          style={{ cursor: "pointer" }}
        >
          <td>
            <Avatar
              size={100}
              name={tutorData.displayName}
              square={true}
              variant='bauhaus'
              colors={["#ffcc00", "#253550", "#FFFFFF", "#858786", "#000"]}
            />
          </td>
          <td>{tutorData.displayName || "Not Activated"}</td>
          <td>{tutorData.email}</td>
          <td>{capitalize(tutorData.clearance) || "None Assigned"}</td>
          <td>{tutorData.preferredAges || ""}</td>
          <td>{tutorData.preferredSubjects || ""}</td>
        </tr>
      );
    });
  };

  const pendingTutorRows = () => {
    const tableData = tutors.filter((tutor) => {
      return tutor.data().clearance === "pending";
    });

    return tableData.map((tutor) => {
      let tutorData = tutor.data();
      return (
        <tr
          className='p-3'
          key={tutor.id}
          onClick={() => selectTutor(tutor.id)}
          style={{ cursor: "pointer" }}
        >
          <td>{tutorData.displayName || "Not Activated"}</td>
          <td>{tutorData.email}</td>
        </tr>
      );
    });
  };

  function filterIcon(column) {
    switch (column) {
      case "name":
        if (!tableSort.includes("name") && nameFilter === "") {
          // neither
          return <i className='bi bi-filter ms-auto' />;
        } else if (tableSort.includes("name") && nameFilter !== "") {
          // both
          if (tableSort === "name_asc")
            return (
              <>
                <i className='bi bi-sort-alpha-up' />
                <i className='bi bi-funnel-fill' />
              </>
            );
          else if (tableSort === "name_desc")
            return (
              <>
                <i className='bi bi-sort-alpha-down-alt' />
                <i className='bi bi-funnel-fill' />
              </>
            );
        } else if (nameFilter !== "") {
          // filter only
          return <i className='bi bi-funnel-fill ms-auto' />;
        } else {
          // sort only
          if (tableSort === "name_asc")
            return <i className='bi bi-sort-alpha-up ms-auto' />;
          else if (tableSort === "name_desc")
            return <i className='bi bi-sort-alpha-down-alt ms-auto' />;
        }

        break;

      default:
        return <i className='bi bi-filter ms-auto' />;
    }
  }

  const DropdownTableHeaderToggle = React.forwardRef(
    ({ children, onClick }, ref) => (
      <div
        className='d-flex'
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
      >
        {children}
      </div>
    ),
  );

  const ComboTableHeader = React.forwardRef(
    (
      {
        children,
        style,
        className,
        "aria-labelledby": labeledBy,
        value,
        valueSetter,
      },
      ref,
    ) => (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Dropdown.Item>
          <InputGroup>
            <Form.Control
              autoFocus
              type='text'
              placeholder='Search'
              value={value}
              onChange={(e) => valueSetter(e.target.value)}
            />
            <i
              className='bi bi-x-lg input-group-text'
              style={{ cursor: "pointer" }}
              onClick={() => valueSetter("")}
            />
          </InputGroup>
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setTableSort("name_asc")}>
          A - Z
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setTableSort("name_desc")}>
          Z - A
        </Dropdown.Item>
      </div>
    ),
  );

  const FilterTableHeader = React.forwardRef(
    (
      {
        children,
        style,
        className,
        "aria-labelledby": labeledBy,
        value,
        valueSetter,
      },
      ref,
    ) => (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Dropdown.Item>
          <InputGroup>
            <Form.Control
              autoFocus
              type='text'
              placeholder='Search'
              value={value}
              onChange={(e) => valueSetter(e.target.value)}
            />
            <i
              className='bi bi-x-lg input-group-text'
              style={{ cursor: "pointer" }}
              onClick={() => valueSetter("")}
            />
          </InputGroup>
        </Dropdown.Item>
      </div>
    ),
  );

  const listTable = (
    <table className='table table-striped table-hover'>
      <thead>
        <tr>
          <td></td>
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop='up' autoClose='outside'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Tutor Name {filterIcon("name")}
              </Dropdown.Toggle>
              <Dropdown.Menu
                as={ComboTableHeader}
                value={nameFilter}
                valueSetter={setNameFilter}
              />
            </Dropdown>
          </th>
          <th>Email</th>
          <th>Role</th>
          <th>Preferred Students</th>
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop='up' autoClose='outside'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Preferred Subjects {filterIcon("subjects")}
              </Dropdown.Toggle>
              <Dropdown.Menu
                as={FilterTableHeader}
                value={subjectFilter}
                valueSetter={setSubjectFilter}
              />
            </Dropdown>
          </th>
        </tr>
      </thead>
      <tbody>{tutorRows()}</tbody>
    </table>
  );

  const pendingTable = (
    <Card className='d-flex pt-3 px-3 m-3 bg-light-subtle'>
      <table className='table table-striped table-hover'>
        <thead>
          <tr>
            <th style={{ cursor: "pointer" }}>
              <Dropdown drop='up' autoClose='outside'>
                <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                  Student Name {filterIcon("name")}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  as={ComboTableHeader}
                  value={nameFilter}
                  valueSetter={setNameFilter}
                />
              </Dropdown>
            </th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>{pendingTutorRows()}</tbody>
      </table>
    </Card>
  );

  return (
    <div className='d-flex flex-column m-3'>
      <div className='d-flex display-1'>Tutors</div>
      <div className='d-flex card pt-3 px-3 m-3 bg-light-subtle'>
        {loading ? (
          <div className='spinner-border d-flex align-self-center' />
        ) : (
          listTable
        )}
      </div>
      {/* <Can do="manage" on="tutors">
        <button className="btn btn-primary m-3 ms-auto" onClick={() => navigate('/newtutor')}>Register New Tutor</button>
      </Can> */}
      {tutors.filter((tutor) => {
        return tutor.data().clearance === "pending";
      }).length === 0 ? (
        <></>
      ) : (
        <>
          <hr />
          <div>
            <div className='d-flex display-1'>Pending Tutors</div>
            {pendingTable}
          </div>
        </>
      )}
    </div>
  );
};

export default TutorProfilesList;
