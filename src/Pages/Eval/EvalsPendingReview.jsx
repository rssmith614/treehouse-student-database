import dayjs from "dayjs";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Card, Dropdown, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DropdownTableHeaderToggle from "../../Components/DropdownTableHeaderToggle";
import FilterTableHeader from "../../Components/FilterTableHeader";
import { db } from "../../Services/firebase";

const EvalsPendingReview = () => {
  const [evals, setEvals] = useState([]);

  const [tableSort, setTableSort] = useState("date_desc");
  const [tutorFilter, setTutorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeEvals = onSnapshot(
      query(collection(db, "evaluations"), where("flagged", "==", true)),
      (snapshot) => {
        setEvals(snapshot.docs);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeEvals();
    };
  }, []);

  const pendingEvals = () => {
    const tableData = evals.filter((evaluation) => {
      return (
        evaluation
          .data()
          .student_name.toLowerCase()
          .includes(studentFilter.toLowerCase()) &&
        evaluation
          .data()
          .tutor_name.toLowerCase()
          .includes(tutorFilter.toLowerCase())
      );
    });

    switch (tableSort) {
      case "date_asc":
        tableData.sort((a, b) => {
          return dayjs(a.date).diff(dayjs(b.date));
        });
        break;
      case "date_desc":
        tableData.sort((a, b) => {
          return dayjs(b.date).diff(dayjs(a.date));
        });
        break;
      default:
        break;
    }

    return tableData.map((evaluation) => {
      const evalData = evaluation.data();
      return (
        <tr
          key={evaluation.id}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/eval/${evaluation.id}`)}
        >
          <td>{evalData.date}</td>
          <td>{evalData.student_name}</td>
          <td>{evalData.tutor_name}</td>
        </tr>
      );
    });
  };

  function filterIcon(column) {
    switch (column) {
      case "date":
        if (tableSort === "date_asc")
          return <i className='bi bi-sort-up ms-auto' />;
        else if (tableSort === "date_desc")
          return <i className='bi bi-sort-down ms-auto' />;
        else return <i className='bi bi-filter ms-auto' />;

      case "student":
        if (studentFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;
      case "tutor":
        if (tutorFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      default:
        return <i className='bi bi-filter ms-auto' />;
    }
  }

  return (
    <div className='d-flex flex-column p-3'>
      <div className='display-1'>Review Evals</div>
      <Card className='bg-light-subtle p-3'>
        {loading ? (
          <div className='spinner-border align-self-center' />
        ) : evals.length === 0 ? (
          <div className='text-center'>
            No Evaluations pending review at this time.
          </div>
        ) : (
          <Table striped hover>
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }}>
                  <Dropdown autoClose='outside' drop='up'>
                    <Dropdown.Toggle as={DropdownTableHeaderToggle} id='date'>
                      Date {filterIcon("date")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setTableSort("date_desc")}>
                        Newer First
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setTableSort("date_asc")}>
                        Older First
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </th>
                <th style={{ cursor: "pointer" }}>
                  <Dropdown autoClose='outside' drop='up'>
                    <Dropdown.Toggle
                      as={DropdownTableHeaderToggle}
                      id='student'
                    >
                      Student {filterIcon("student")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      as={FilterTableHeader}
                      value={studentFilter}
                      valueSetter={setStudentFilter}
                    />
                  </Dropdown>
                </th>
                <th style={{ cursor: "pointer" }}>
                  <Dropdown autoClose='outside' drop='up'>
                    <Dropdown.Toggle as={DropdownTableHeaderToggle} id='tutor'>
                      Tutor {filterIcon("tutor")}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      as={FilterTableHeader}
                      value={tutorFilter}
                      valueSetter={setTutorFilter}
                    />
                  </Dropdown>
                </th>
              </tr>
            </thead>
            <tbody>{pendingEvals()}</tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default EvalsPendingReview;
