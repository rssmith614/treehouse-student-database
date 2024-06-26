import { collection, getDocs, onSnapshot } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { db } from "../../Services/firebase";
import React, { useEffect, useState } from "react";
import { Can } from "../../Services/can";
import dayjs from "dayjs";
import {
  Dropdown,
  InputGroup,
  Form,
  Button,
  Table,
  Row,
  Col,
} from "react-bootstrap";
import DropdownTableHeaderToggle from "../../Components/DropdownTableHeaderToggle";
import FilterTableHeader from "../../Components/FilterTableHeader";
import SortTableHeader from "../../Components/SortTableHeader";
import PaginatedTable from "../../Components/PaginatedTable";
import { useMediaQuery } from "react-responsive";

const StudentProfilesList = () => {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nameFilter, setNameFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const [tableSort, setTableSort] = useState("name_asc");

  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        setStudents(snapshot.docs);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeStudents();
    };
  }, []);

  function selectStudent(id) {
    navigate(`/students/${id}`);
  }

  function csvExport() {
    if (!window.confirm("Please confirm you want to export all student data."))
      return;

    let csvString = "data:text/csv;charset=utf-8,";
    csvString +=
      "Student Name,Student School,Student Grade,Student DOB,Student Source,Preferred Tutor,Parent Name,Parent Phone,Medical Conditions,Emergency Contacts,Other Info\n";

    students.forEach((student) => {
      let studentData = student.data();
      csvString += `"${studentData.student_name}",`;
      csvString += `"${studentData.student_school}",`;
      csvString += `"${studentData.student_grade}",`;
      csvString += `"${dayjs(studentData.student_dob).format("MMMM D, YYYY")}",`;
      csvString += `"${studentData.student_source}",`;
      csvString += `"${studentData.preferred_tutor_name}",`;
      csvString += `"${studentData.parent_name}",`;
      csvString += `"${studentData.parent_phone}",`;
      csvString += `"${studentData.medical_conditions}",`;
      csvString += `"${studentData.emergency_contacts.map((e) => {
        return `${e.name} (${e.relation}): ${e.phone}`;
      })}",`;
      csvString += `"${studentData.other}"\n`;
    });

    const encodedUri = encodeURI(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
  }

  function studentList() {
    if (!students) {
      return null;
    }

    const tableData = students.filter((student) => {
      return (
        student
          .data()
          .student_name?.toLowerCase()
          .includes(nameFilter.toLowerCase()) &&
        student
          .data()
          .preferred_tutor_name?.toLowerCase()
          .includes(tutorFilter.toLowerCase()) &&
        student
          .data()
          .student_school?.toLowerCase()
          .includes(schoolFilter.toLowerCase()) &&
        student
          .data()
          .student_source?.toLowerCase()
          .includes(sourceFilter.toLowerCase()) &&
        student
          .data()
          .student_grade?.toLowerCase()
          .includes(gradeFilter.toLowerCase())
      );
    });

    if (tableSort === "name_asc")
      tableData.sort((a, b) => {
        return a.data().student_name.localeCompare(b.data().student_name);
      });
    else if (tableSort.includes("dob_asc"))
      tableData.sort((a, b) => {
        return dayjs(b.data().student_dob).diff(dayjs(a.data().student_dob));
      });
    else if (tableSort === "name_desc")
      tableData.sort((a, b) => {
        return b.data().student_name.localeCompare(a.data().student_name);
      });
    else if (tableSort.includes("dob_desc"))
      tableData.sort((a, b) => {
        return dayjs(a.data().student_dob).diff(dayjs(b.data().student_dob));
      });

    return tableData.map((student) => {
      let studentData = student.data();
      return (
        <tr
          className='p-3'
          key={student.id}
          onClick={() => selectStudent(student.id)}
          style={{ cursor: "pointer" }}
        >
          <td>{studentData.student_name}</td>
          {isDesktop && <td>{studentData.preferred_tutor_name}</td>}
          <td>{studentData.student_school}</td>
          {isDesktop && <td>{studentData.student_source}</td>}
          <td>{studentData.student_grade}</td>
          {isDesktop && (
            <td>{dayjs(studentData.student_dob).format("MMMM D, YYYY")}</td>
          )}
        </tr>
      );
    });
  }

  async function gradesExport() {
    if (
      !window.confirm("Please confirm you want to export all student grades.")
    )
      return;

    getDocs(collection(db, "grades")).then((querySnapshot) => {
      let csvString = "data:text/csv;charset=utf-8,";
      csvString += "Student Name,Reported By,Date,Subject,Grade,Comments\n";
      querySnapshot.docs.forEach((result) => {
        let student_name = students
          .find((student) => student.id === result.data().student_id)
          .data().student_name;
        result.data().grades.forEach((grade) => {
          csvString += `"${student_name}",`;
          csvString += `"${result.data().tutor_name}",`;
          csvString += `"${dayjs(result.data().date).format("MMMM D, YYYY")}",`;
          csvString += `"${grade.subject}",`;
          csvString += `"${grade.grade}",`;
          csvString += `"${grade.comments}",\n`;
        });
      });
      const encodedUri = encodeURI(csvString);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `grades_export_${dayjs().format("YYYY-MM-DD")}.csv`,
      );
      document.body.appendChild(link); // Required for FF
      link.click();
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

      case "dob":
        if (tableSort === "dob_asc")
          return <i className='bi bi-sort-up ms-auto' />;
        else if (tableSort === "dob_desc")
          return <i className='bi bi-sort-down ms-auto' />;
        else return <i className='bi bi-filter ms-auto' />;

      case "tutor":
        if (tutorFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      case "school":
        if (schoolFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      case "source":
        if (sourceFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      case "grade":
        if (gradeFilter !== "")
          return <i className='bi bi-funnel-fill ms-auto' />;
        else return <i className='bi bi-funnel ms-auto' />;

      default:
        return <i className='bi bi-filter ms-auto' />;
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
      <div className='display-1 d-flex flex-row'>Students</div>
      <div className='d-flex pt-3 px-3 card bg-light-subtle'>
        <Row>
          <Col md={3} xs={12}>
            <InputGroup className='mb-3'>
              <Form.Control
                type='text'
                placeholder='Search Student'
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                }}
                autoFocus
              />
              <Button
                variant='secondary'
                className='bi bi-x-lg input-group-text'
                style={{ cursor: "pointer" }}
                onClick={() => setNameFilter("")}
              />
            </InputGroup>
          </Col>
        </Row>
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
                  {isDesktop && (
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
                  )}
                  <th style={{ cursor: "pointer" }}>
                    <Dropdown drop='up' autoClose='outside'>
                      <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                        Student School {filterIcon("school")}
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        as={FilterTableHeader}
                        value={schoolFilter}
                        valueSetter={setSchoolFilter}
                      />
                    </Dropdown>
                  </th>
                  {isDesktop && (
                    <th style={{ cursor: "pointer" }}>
                      <Dropdown drop='up' autoClose='outside'>
                        <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                          Student Source {filterIcon("source")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          as={FilterTableHeader}
                          value={sourceFilter}
                          valueSetter={setSourceFilter}
                        />
                      </Dropdown>
                    </th>
                  )}
                  <th style={{ cursor: "pointer" }}>
                    <Dropdown drop='up' autoClose='outside'>
                      <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                        Grade {filterIcon("grade")}
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        as={FilterTableHeader}
                        value={gradeFilter}
                        valueSetter={setGradeFilter}
                      />
                    </Dropdown>
                  </th>
                  {isDesktop && (
                    <th style={{ cursor: "pointer" }}>
                      <Dropdown drop='up'>
                        <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                          Date of Birth {filterIcon("dob")}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => setTableSort("dob_desc")}
                          >
                            Descending
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => setTableSort("dob_asc")}
                          >
                            Ascending
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </th>
                  )}
                </tr>
              </thead>
            }
            filtered={
              nameFilter !== "" ||
              tutorFilter !== "" ||
              schoolFilter !== "" ||
              sourceFilter !== "" ||
              gradeFilter !== ""
            }
            clearFilters={() => {
              setNameFilter("");
              setTutorFilter("");
              setSchoolFilter("");
              setSourceFilter("");
              setGradeFilter("");
            }}
          />
        )}
      </div>
      <Row className='d-flex justify-content-start'>
        <Can I='export' on='students'>
          <Button
            className='m-3 col text-nowrap'
            variant='secondary'
            onClick={csvExport}
          >
            Export Student Data as CSV
          </Button>
        </Can>
        <Can I='export' on='grades'>
          <Button
            className='m-3 col text-nowrap'
            variant='secondary'
            onClick={gradesExport}
          >
            Export Student Grade Data as CSV
          </Button>
        </Can>
        <Can do='add' on='students'>
          <button
            className='btn btn-primary m-3 col text-nowrap'
            onClick={() => navigate(`/newstudent`)}
          >
            Add New Student
          </button>
        </Can>
      </Row>
    </div>
  );
};

export default StudentProfilesList;
