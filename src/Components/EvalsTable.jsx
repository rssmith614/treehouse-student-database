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
import { Dropdown, Button, Table, Collapse } from "react-bootstrap";
import DropdownTableHeaderToggle from "./DropdownTableHeaderToggle";
import FilterTableHeader from "./FilterTableHeader";
import PaginatedTable from "./PaginatedTable";
import { useMediaQuery } from "react-responsive";

const EvalsTable = ({ filterBy, id, _limit, draft = false }) => {
  const [evals, setEvals] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [tableSort, setTableSort] = useState("date_desc");

  const [tutorFilter, setTutorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  const docRef = useRef(doc(db, filterBy, id));

  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  useEffect(() => {
    docRef.current = doc(db, filterBy, id);

    let conditions = [
      collection(db, "evaluations"),
      where("draft", "==", draft),
      orderBy("date", "desc"),
    ];

    if (filterBy === "tutor") {
      conditions.push(where("tutor_id", "==", id));
    } else if (filterBy === "student") {
      conditions.push(where("student_id", "==", id));
    }

    let q = query.apply(null, conditions);

    const unsubscribeEvals = onSnapshot(q, (res) => {
      Promise.all(
        res.docs.map(async (evaluation) => {
          return Promise.all(
            (await getDocs(collection(evaluation.ref, "tasks"))).docs
              .sort((a, b) => a.data().idx - b.data().idx || 0)
              .map(async (task) => {
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
              }),
          ).then((compiledTasks) => {
            return {
              ...evaluation.data(),
              id: evaluation.id,
              tasks: compiledTasks,
            };
          });
        }),
      )
        .then((compiledEvals) => {
          setEvals(compiledEvals);
        })
        .then(() => setLoading(false));
    });

    return () => unsubscribeEvals();
  }, [filterBy, id, _limit, draft]);

  useEffect(() => {
    let temp = evals.filter((evaluation) => {
      return (
        evaluation.student_name
          .toLowerCase()
          .includes(studentFilter.toLowerCase()) &&
        evaluation.tutor_name
          .toLowerCase()
          .includes(tutorFilter.toLowerCase()) &&
        !(evaluation.draft ?? false)
      );
    });

    switch (tableSort) {
      case "date_asc":
        temp.sort((a, b) => {
          return dayjs(a.date).diff(dayjs(b.date));
        });
        break;
      case "date_desc":
        temp.sort((a, b) => {
          return dayjs(b.date).diff(dayjs(a.date));
        });
        break;
      default:
        break;
    }

    setTableData(temp);
  }, [evals, studentFilter, tableSort, tutorFilter]);

  useEffect(() => {
    if (cursorIndex > tableData.length - _limit + 1) {
      setCursorIndex(
        Math.max(0, Math.floor((tableData.length - 1) / _limit) * _limit),
      );
    }
  }, [tableData, cursorIndex, _limit]);

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

    useEffect(() => {
      if (typeof window.MathJax !== "undefined") {
        window.MathJax.typesetClear();
        window.MathJax.typesetPromise();
      }
    }, [evaluation]);

    return (
      <tr
        key={evaluation.id}
        onClick={() => navigate(`/eval/${evaluation.id}`)}
        style={{ cursor: "pointer" }}
      >
        <td className='align-middle'>
          {/* {isDesktop
            ? dayjs(evaluation.date).format("MMMM D, YYYY")
            : dayjs(evaluation.date).format("MM/DD/YY")} */}
          {dayjs(evaluation.date).format("MMMM D, YYYY")}
        </td>
        <td className='align-middle'>
          {filterBy === "tutor"
            ? evaluation.student_name
            : evaluation.tutor_name}
        </td>
        {isDesktop && (
          <td className='align-middle'>
            <Collapse in={!expanded}>
              <ul className='list-group'>
                <li className='d-flex list-group-item justify-content-between align-items-center'>
                  <span className='text-truncate pe-3'>
                    {evaluation.tasks[0]}
                  </span>
                  <span className='badge text-bg-primary'>
                    {evaluation.tasks.length} Task
                    {evaluation.tasks.length > 1 ? "s" : ""}
                  </span>
                </li>
              </ul>
            </Collapse>
            <Collapse in={expanded}>
              <ul className='list-group'>
                {evaluation.tasks.map((t, i) => {
                  return (
                    <li
                      key={i}
                      className='text-break list-group-item'
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {t}
                    </li>
                  );
                })}
              </ul>
            </Collapse>
          </td>
        )}
        {isDesktop && (
          <td className='text-center'>
            <Button
              className='ms-auto btn-sm mt-1'
              variant='secondary'
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <div className='d-flex'>
                  <span className='me-1'>Less</span>
                  <i className='bi bi-chevron-up' />
                </div>
              ) : (
                <div className='d-flex'>
                  <span className='me-1'>More</span>
                  <i className='bi bi-chevron-down' />
                </div>
              )}
            </Button>
          </td>
        )}
        {!isDesktop && (
          <td className='text-center'>
            <span className='badge text-bg-primary'>
              {evaluation.tasks.length} Task
              {evaluation.tasks.length > 1 ? "s" : ""}
            </span>
          </td>
        )}
      </tr>
    );
  };

  function evalList() {
    return tableData.map((evaluation) => {
      return <EvalRow key={evaluation.id} evaluation={evaluation} />;
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

  if (loading)
    return (
      <div className='placeholder-wave'>
        <div className='placeholder placeholder-lg mb-2 col-1' />
        <Table striped>
          <thead>
            <tr>
              <th className='placeholder w-100' style={{ height: "3rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(_limit || 10)].map((_, i) => (
              <tr key={i}>
                <td
                  className='placeholder w-100 placeholder-lg'
                  style={{ height: "2.8rem" }}
                />
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );

  return (
    <PaginatedTable
      records={evalList()}
      pageLimit={_limit}
      header={
        <>
          {isDesktop ? (
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "40%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
          ) : (
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "40%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
          )}
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
              {isDesktop && <th></th>}
            </tr>
          </thead>
        </>
      }
      filtered={studentFilter !== "" || tutorFilter !== ""}
      clearFilters={() => {
        setStudentFilter("");
        setTutorFilter("");
      }}
    />
  );
};

export default EvalsTable;
