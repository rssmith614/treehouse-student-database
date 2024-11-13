import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import dayjs from "dayjs";

import { db } from "../Services/firebase";
import { useNavigate } from "react-router-dom";
import { Dropdown, Button, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import PaginatedList from "./PaginatedList";

const EvalsTable = ({ filterBy, id, _limit, draft = false }) => {
  const [evals, setEvals] = useState([]);
  const lastVisible = useRef(null);
  const totalRecords = useRef(0);
  const [loading, setLoading] = useState(true);

  const tableSort = useRef("date_desc");

  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  useEffect(() => {
    let conditions = [
      collection(db, "evaluations"),
      where("draft", "==", draft),
      where(`${filterBy}_id`, "==", id),
    ];

    let q = query.apply(null, conditions);

    getDocs(q).then((res) => {
      totalRecords.current = res.docs.length;
    });
  }, [filterBy, id, draft]);

  useEffect(() => {
    setEvals([]);
    runEvalQuery();
  }, [draft, filterBy, _limit]);

  function handleTableSortChange(sort) {
    setLoading(true);
    setEvals([]);
    tableSort.current = sort;
    lastVisible.current = null;

    runEvalQuery();
  }

  async function runEvalQuery() {
    let conditions = [
      collection(db, "evaluations"),
      where("draft", "==", draft),
      where(`${filterBy}_id`, "==", id),
      orderBy("date", `${tableSort.current === "date_desc" ? "desc" : "asc"}`),
      limit(_limit),
    ];

    if (lastVisible.current) {
      conditions.push(startAfter(lastVisible.current));
    }

    let q = query.apply(null, conditions);

    const res = await getDocs(q);

    await Promise.all(
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
                  return (
                    <div>
                      <div>{task.data().comments}</div>
                      {await standardsLabel(task.data().standards)}
                    </div>
                  );
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
        lastVisible.current = res.docs[res.docs.length - 1];
        setEvals((prev) => [
          ...prev,
          ...compiledEvals.filter((e) => !prev.find((p) => p.id === e.id)),
        ]);
      })
      .then(() => setLoading(false));
  }

  async function standardsLabel(standards) {
    if (standards.length === 0) return "None";
    else {
      return await Promise.all(
        standards.map(async (standard) => {
          return (
            <span className='badge bg-secondary me-1'>
              {
                (
                  await getDoc(doc(db, "standards", standard.id || standard))
                ).data().key
              }
            </span>
          );
        }),
      );
    }
  }

  const EvalRow = ({ evaluation }) => {
    useEffect(() => {
      if (typeof window.MathJax !== "undefined") {
        window.MathJax.typesetClear();
        window.MathJax.typesetPromise();
      }
    }, []);

    return (
      <li
        key={evaluation.id}
        className='list-group-item list-group-item-action'
        onClick={() => navigate(`/eval/${evaluation.id}`)}
        style={{ cursor: "pointer" }}
      >
        <div className='d-flex w-100 align-items-center'>
          <div className={`flex-shrink-0 col-${isDesktop ? "3" : "6"}`}>
            <h5 className='mb-1'>
              {dayjs(evaluation.date).format(
                isDesktop ? "MMMM DD, YYYY" : "MMM DD, YYYY",
              )}
            </h5>
            {filterBy === "tutor" ? (
              <small className='text-muted'>{evaluation.student_name}</small>
            ) : (
              <small className='text-muted'>{evaluation.tutor_name}</small>
            )}
          </div>
          {isDesktop && (
            <div className='text-truncate px-3'>{evaluation.tasks[0]}</div>
          )}
          <small className='badge text-bg-primary ms-auto'>
            {evaluation.tasks.length} Task
            {evaluation.tasks.length > 1 ? "s" : ""}
          </small>
        </div>
      </li>
    );
  };

  function evalList() {
    return evals.map((evaluation) => {
      return <EvalRow key={evaluation.id} evaluation={evaluation} />;
    });
  }

  if (loading)
    return (
      <div className='placeholder-wave'>
        <div className='placeholder placeholder-lg mb-2 col-1' />
        <Row className={`my-1 ${isDesktop && "w-50"}`}>
          <Dropdown>
            <Dropdown.Toggle variant='secondary' disabled>
              Newest First
            </Dropdown.Toggle>
          </Dropdown>
        </Row>
        <ul className='list-group'>
          {[...Array(_limit)].map((_, i) => (
            <li key={i} className='list-group-item'>
              <div className='d-flex w-100 align-items-center'>
                <div className='flex-shrink-0 col-4'>
                  <h5 className='mb-1'>
                    <div className='placeholder placeholder-lg' />
                  </h5>
                  <small className='text-muted'>
                    <div className='placeholder placeholder-sm' />
                  </small>
                </div>
                <div className='text-truncate px-3'>
                  <div className='placeholder placeholder-lg' />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className='d-flex justify-content-between'>
          <Button className='mt-3 placeholder' variant='secondary' disabled>
            Previous
          </Button>
          <Button className='mt-3 placeholder' variant='secondary' disabled>
            Next
          </Button>
        </div>
      </div>
    );

  return (
    <PaginatedList
      loading={loading}
      records={evalList()}
      pageLimit={_limit}
      tableSort={tableSort.current}
      setTableSort={handleTableSortChange}
      totalRecords={totalRecords.current}
      requery={runEvalQuery}
    />
  );
};

export default EvalsTable;
