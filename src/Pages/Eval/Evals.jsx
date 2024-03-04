import { collection, onSnapshot } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { db } from "../../Services/firebase";
import React, { useEffect, useState } from "react";
import { Dropdown, InputGroup, Form, Button, Table } from "react-bootstrap";
import FilterTableHeader from "../../Components/FilterTableHeader";
import DropdownTableHeaderToggle from "../../Components/DropdownTableHeaderToggle";
import SortTableHeader from "../../Components/SortTableHeader";
import PaginatedTable from "../../Components/PaginatedTable";

const Evals = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");

  const [tableSort, setTableSort] = useState("name_asc");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const newStudents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(newStudents);
        setLoading(false);
      },
    );

    return () => unsubscribeStudents();
  }, []);

  function selectStudent(id) {
    navigate(`/evals/${id}`);
  }

  function studentList() {
    if (!students) {
      return null;
    }

    const tableData = students.filter((student) => {
      return (
        student.student_name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        student.preferred_tutor_name
          .toLowerCase()
          .includes(tutorFilter.toLowerCase())
      );
    });

    if (tableSort === "name_asc")
      tableData.sort((a, b) => {
        return a.student_name.localeCompare(b.student_name);
      });
    else if (tableSort === "name_desc")
      tableData.sort((a, b) => {
        return b.student_name.localeCompare(a.student_name);
      });

    return tableData.map((student) => {
      return (
        <tr
          className='p-3'
          key={student.id}
          onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}
        >
          <td>{student.student_name}</td>
          <td>{student.preferred_tutor_name}</td>
        </tr>
      );
    });
  }

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
                <i className='bi bi-sort-alpha-up ms-auto' />
                <i className='bi bi-funnel-fill' />
              </>
            );
          else if (tableSort === "name_desc")
            return (
              <>
                <i className='bi bi-sort-alpha-down-alt ms-auto' />
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

      case "tutor":
        if (tutorFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      default:
        return <></>;
    }
  }

  const loadingTable = (
    <div className='placeholder-wave'>
      <div className='placeholder placeholder-lg mb-2 col-1' />
      <Table striped>
        <thead>
          <tr>
            <th className='placeholder w-100' style={{ height: "3rem" }}></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
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
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex'>View All Session Evaluations</div>
      <div className='h5'>Select a Student</div>
      <div className='d-flex pt-3 px-3 card bg-light-subtle'>
        <InputGroup className='w-25 mb-3'>
          <Form.Control
            type='text'
            placeholder='Search Student'
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
            }}
          />
          <Button
            variant='secondary'
            className='bi bi-x-lg input-group-text'
            style={{ cursor: "pointer" }}
            onClick={() => setNameFilter("")}
          />
        </InputGroup>
        {loading ? (
          loadingTable
        ) : (
          // listTable
          <PaginatedTable
            records={studentList()}
            pageLimit={10}
            header={
              <thead>
                <tr>
                  <th style={{ cursor: "pointer" }}>
                    <Dropdown drop='up' autoClose='outside'>
                      <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                        Student Name {filterIcon("name")}
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        as={SortTableHeader}
                        sortSetter={setTableSort}
                      />
                    </Dropdown>
                  </th>
                  <th style={{ cursor: "pointer" }}>
                    <Dropdown drop='up' autoClose='outside'>
                      <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                        Preferred Tutor {filterIcon("tutor")}
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
            }
            filtered={nameFilter !== "" || tutorFilter !== ""}
            clearFilters={() => {
              setNameFilter("");
              setTutorFilter("");
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Evals;
