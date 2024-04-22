import dayjs from "dayjs";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Collapse, Dropdown, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DropdownTableHeaderToggle from "../../Components/DropdownTableHeaderToggle";
import FilterTableHeader from "../../Components/FilterTableHeader";
import { auth, db } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";

const EvalDrafts = () => {
  const [evals, setEvals] = useState([]);

  const [tableSort, setTableSort] = useState("date_desc");
  const [tutorFilter, setTutorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const addToast = useContext(ToastContext);

  useEffect(() => {
    const unsubscribeEvals = onSnapshot(
      query(
        collection(db, "evaluations"),
        where("draft", "==", true),
        where("tutor_id", "==", auth.currentUser.uid),
      ),
      (snapshot) => {
        setEvals(snapshot.docs);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeEvals();
    };
  }, []);

  function handleDelete(id) {
    deleteDoc(doc(db, "evaluations", id)).then(() => {
      addToast({
        header: "Evaluation Deleted",
        message: "The evaluation has been successfully deleted.",
      });
    });
  }

  const TableRow = ({ evaluation }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const evalData = evaluation.data();
    return (
      <tr
        className='align-middle'
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/eval/edit/${evaluation.id}`)}
      >
        <td>
          <div className='d-flex'>
            <Collapse in={showDeleteConfirm} dimension='width'>
              <div>
                <Button
                  className='me-2'
                  variant='outline-secondary'
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                >
                  <i className='bi bi-x-lg' />
                </Button>
              </div>
            </Collapse>
            <Button
              variant='danger'
              onClick={(e) => {
                e.stopPropagation();
                showDeleteConfirm
                  ? handleDelete(evaluation.id)
                  : setShowDeleteConfirm(true);
              }}
            >
              <i className='bi bi-trash-fill' />
            </Button>
          </div>
        </td>
        <td>{dayjs(evalData.date).format("MMMM D, YYYY")}</td>
        <td>{evalData.student_name}</td>
        <td>{evalData.tutor_name}</td>
      </tr>
    );
  };

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
      return <TableRow key={evaluation.id} evaluation={evaluation} />;
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
      <div className='display-1'>Your Draft Evaluations</div>
      <div className='h5'>
        All unfinished evaluations that you have saved as drafts
      </div>
      <Card className='bg-light-subtle p-3'>
        {loading ? (
          <div className='spinner-border align-self-center' />
        ) : evals.length === 0 ? (
          <div className='text-center'>You have no drafts at this time.</div>
        ) : (
          <Table striped hover>
            <thead>
              <tr>
                <th className='col-1'></th>
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

export default EvalDrafts;
