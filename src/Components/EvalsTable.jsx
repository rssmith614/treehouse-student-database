import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";
import { Dropdown, InputGroup, Table, Form } from "react-bootstrap";

const EvalsTable = ({ filterBy, id }) => {
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tableSort, setTableSort] = useState("date_desc");

  const [tutorFilter, setTutorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  const docRef = useRef(doc(db, filterBy, id));

  const navigate = useNavigate();

  useEffect(() => {
    docRef.current = doc(db, filterBy, id);

    let q;

    if (filterBy === "tutor") {
      q = query(collection(db, "evaluations"), where("tutor_id", "==", id));
    } else if (filterBy === "student") {
      q = query(collection(db, "evaluations"), where("student_id", "==", id));
    }

    const unsubscribeEvals = onSnapshot(q, (res) => {
      Promise.all(
        res.docs.map(async (evaluation) => {
          return Promise.all(
            (await getDocs(collection(evaluation.ref, "tasks"))).docs.map(
              async (task) => {
                if (task.data().standard === "") return task.data().subject;
                else {
                  return `${task.data().subject}: ${
                    (
                      await getDoc(doc(db, "standards", task.data().standard))
                    ).data().key
                  }`;
                }
              },
            ),
          ).then((compiledTasks) => {
            return {
              ...evaluation.data(),
              id: evaluation.id,
              tasks: compiledTasks.sort((a, b) => {
                let a_standard = a.split(":").at(1) || "0.0.0";
                let b_standard = b.split(":").at(1) || "0.0.0";
                return (
                  a_standard
                    .split(".")[1]
                    .localeCompare(b_standard.split(".")[1]) ||
                  a_standard.split(".")[2] - b_standard.split(".")[2] ||
                  a_standard
                    .split(".")[2]
                    .localeCompare(b_standard.split(".")[2]) ||
                  a_standard.localeCompare(b_standard)
                );
              }),
            };
          });
        }),
      )
        .then((compiledEvals) => setEvals(compiledEvals))
        .then(() => setLoading(false));
    });

    return () => unsubscribeEvals();
  }, [filterBy, id]);

  function evalList() {
    const tableData = evals.filter((evaluation) => {
      return (
        evaluation.student_name
          .toLowerCase()
          .includes(studentFilter.toLowerCase()) &&
        evaluation.tutor_name.toLowerCase().includes(tutorFilter.toLowerCase())
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
      return (
        <tr
          key={evaluation.id}
          onClick={() => navigate(`/eval/${evaluation.id}`)}
          style={{ cursor: "pointer" }}
        >
          <td>{dayjs(evaluation.date).format("MMMM DD, YYYY")}</td>
          <td>
            {filterBy === "tutor"
              ? evaluation.student_name
              : evaluation.tutor_name}
          </td>
          <td>
            {evaluation.tasks.map((t, i) => {
              return (
                <div key={i}>
                  {t}
                  <br />
                </div>
              );
            })}
          </td>
        </tr>
      );
    });
  }

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

  if (loading) return <div className='spinner-border align-self-center' />;

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

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th className='w-25' style={{ cursor: "pointer" }}>
            <Dropdown variant='' drop='up'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
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
          {filterBy === "tutor" ? (
            <th className='w-25' style={{ cursor: "pointer" }}>
              <Dropdown autoClose='outside' drop='up'>
                <Dropdown.Toggle
                  as={DropdownTableHeaderToggle}
                  id='student-filter'
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
          ) : (
            <th className='w-25' style={{ cursor: "pointer" }}>
              <Dropdown autoClose='outside' drop='up'>
                <Dropdown.Toggle
                  as={DropdownTableHeaderToggle}
                  id='tutor-filter'
                >
                  Tutor {filterIcon("tutor")}
                </Dropdown.Toggle>

                <Dropdown.Menu
                  as={FilterTableHeader}
                  value={tutorFilter}
                  valueSetter={setTutorFilter}
                />
              </Dropdown>
            </th>
          )}
          <th>Tasks</th>
          {/* <th className="w-50">Subject</th>
          <th>Engagement</th>
          <th>Progression</th> */}
        </tr>
      </thead>
      <tbody>{evalList()}</tbody>
    </Table>
  );
};

export default EvalsTable;
