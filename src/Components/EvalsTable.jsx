import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";
import {
  Dropdown,
  InputGroup,
  Table,
  Form,
  Button,
  Pagination,
} from "react-bootstrap";

const EvalsTable = ({ filterBy, id, _limit }) => {
  const [evals, setEvals] = useState([]);
  const [cursorIndex, setCursorIndex] = useState(0);
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
      q = query(
        collection(db, "evaluations"),
        where("tutor_id", "==", id),
        orderBy("date", "desc"),
      );
    } else if (filterBy === "student") {
      q = query(
        collection(db, "evaluations"),
        where("student_id", "==", id),
        orderBy("date", "desc"),
      );
    }

    const unsubscribeEvals = onSnapshot(q, (res) => {
      Promise.all(
        res.docs.map(async (evaluation) => {
          return Promise.all(
            (await getDocs(collection(evaluation.ref, "tasks"))).docs.map(
              async (task) => {
                if (task.data().standard) {
                  if (task.data().standard === "") {
                    await updateDoc(task.ref, {
                      standards: [],
                      standard: null,
                    });
                    return task.data().subject;
                  } else {
                    await updateDoc(task.ref, {
                      standards: [],
                      standard: null,
                    });
                    return `${task.data().subject}: ${
                      (
                        await getDoc(doc(db, "standards", task.data().standard))
                      ).data().key
                    }`;
                  }
                } else if (task.data().standards) {
                  if (task.data().standards.length === 0) {
                    return task.data().comments;
                  } else {
                    return `${task.data().comments}: ${
                      (await standardsLabel(task.data().standards)) || ""
                    }`;
                  }
                } else {
                  return task.data().comments;
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
  }, [filterBy, id, cursorIndex, _limit]);

  async function standardsLabel(standards) {
    if (standards.length === 0) return "None";
    else if (standards.length === 1)
      return (
        await getDoc(doc(db, "standards", standards[0]?.id || standards[0]))
      ).data().key;
    else
      return `${
        (
          await getDoc(doc(db, "standards", standards[0]?.id || standards[0]))
        ).data().key
      } +${standards.length - 1} more`;
  }

  const EvalRow = ({ evaluation }) => {
    const [expanded, setExpanded] = useState(false);

    return expanded ? (
      <tr
        key={evaluation.id}
        onClick={() => navigate(`/eval/${evaluation.id}`)}
        style={{ cursor: "pointer" }}
      >
        <td className='align-middle'>
          {dayjs(evaluation.date).format("MMMM DD, YYYY")}
        </td>
        <td className='align-middle'>
          {filterBy === "tutor"
            ? evaluation.student_name
            : evaluation.tutor_name}
        </td>
        <td className='align-middle'>
          <ul className='list-group'>
            {evaluation.tasks.map((t, i) => {
              return (
                <li key={i} className='text-break list-group-item'>
                  {t}
                </li>
              );
            })}
          </ul>
        </td>
        <td className='text-center'>
          <Button
            className='ms-auto btn-sm mt-1'
            variant='secondary'
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
          >
            Show Less
          </Button>
        </td>
      </tr>
    ) : (
      <tr
        key={evaluation.id}
        onClick={() => navigate(`/eval/${evaluation.id}`)}
        style={{ cursor: "pointer" }}
      >
        <td className='align-middle'>
          {dayjs(evaluation.date).format("MMMM DD, YYYY")}
        </td>
        <td className='align-middle'>
          {filterBy === "tutor"
            ? evaluation.student_name
            : evaluation.tutor_name}
        </td>
        <td className='align-middle'>
          <ul className='list-group'>
            <li className='d-flex justify-content-between align-items-center'>
              <span className='text-truncate pe-3'>{evaluation.tasks[0]}</span>
              <span className='badge text-bg-primary'>
                {evaluation.tasks.length} Task
                {evaluation.tasks.length > 1 ? "s" : ""}
              </span>
            </li>
          </ul>
        </td>
        <td className='text-center'>
          <Button
            className='ms-auto btn-sm mt-1'
            variant='secondary'
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
          >
            Show More
            <br />
          </Button>
        </td>
      </tr>
    );
  };

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

    if (_limit) {
      return tableData.map((evaluation) => {
        if (
          tableData.indexOf(evaluation) >= cursorIndex &&
          tableData.indexOf(evaluation) < cursorIndex + _limit
        )
          return <EvalRow key={evaluation.id} evaluation={evaluation} />;
        else return null;
      });
    } else {
      return tableData.map((evaluation) => {
        return <EvalRow key={evaluation.id} evaluation={evaluation} />;
      });
    }
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

  const PageNavigation = () => {
    return (
      <Pagination>
        <Pagination.First onClick={() => setCursorIndex(0)} />
        <Pagination.Prev
          onClick={() => setCursorIndex(Math.max(cursorIndex - _limit, 0))}
        />
        {Array.from({ length: Math.ceil(evals.length / _limit) }, (_, i) => (
          <Pagination.Item
            key={i}
            active={i * _limit === cursorIndex}
            onClick={() => setCursorIndex(i * _limit)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCursorIndex(
              Math.min(
                cursorIndex + _limit,
                Math.max(0, Math.floor((evals.length - 1) / _limit) * _limit),
              ),
            )
          }
        />
        <Pagination.Last
          onClick={() =>
            setCursorIndex(
              Math.max(0, Math.floor((evals.length - 1) / _limit) * _limit),
            )
          }
        />
      </Pagination>
    );
  };

  return (
    <div>
      {_limit ? (
        <div className='text-secondary'>
          Showing {cursorIndex + 1} -{" "}
          {Math.min(cursorIndex + _limit, evals.length)} of {evals.length}{" "}
        </div>
      ) : null}
      <Table striped hover style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className='' style={{ cursor: "pointer" }}>
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
              <th className='' style={{ cursor: "pointer" }}>
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
              <th className='' style={{ cursor: "pointer" }}>
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
            <th></th>
          </tr>
        </thead>
        <tbody>{evalList()}</tbody>
      </Table>
      {/* <Container>
        <Row xs={{ cols: 'auto' }}>
          {evalList()}
        </Row>
      </Container> */}
      {_limit ? <PageNavigation /> : null}
    </div>
  );
};

export default EvalsTable;
