import { collection, onSnapshot } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

import { db } from "../../Services/firebase";
import React, { useEffect, useState } from "react";
import { Can } from "../../Services/can";
import dayjs from "dayjs";
import { Dropdown, InputGroup, Table, Form, Button } from "react-bootstrap";
import { ArrayToCSV } from "../../Services/csv";

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
    let csvString = ArrayToCSV(
      students.map((student) => {
        let { preferred_tutor, ..._ } = student.data();
        return {
          ..._,
          emergency_contacts: student
            .data()
            .emergency_contacts.map((contact) => {
              return (
                contact["relation"] +
                ": " +
                contact["name"] +
                " " +
                contact["phone"]
              );
            })
            .join("; "),
        };
      }),
    );
    let csvBlob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    let csvUrl = URL.createObjectURL(csvBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = csvUrl;
    downloadLink.setAttribute("download", "students.csv");
    downloadLink.click();
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
          <td>{studentData.preferred_tutor_name}</td>
          <td>{studentData.student_school}</td>
          <td>{studentData.student_source}</td>
          <td>{studentData.student_grade}</td>
          <td>{dayjs(studentData.student_dob).format("MMMM DD, YYYY")}</td>
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
        {/* <Dropdown.Item>
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
        </Dropdown.Item> */}
        <Dropdown.Item onClick={() => setTableSort("name_asc")}>
          A - Z
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setTableSort("name_desc")}>
          Z - A
        </Dropdown.Item>
      </div>
    ),
  );

  const listTable = (
    <Table striped hover>
      <thead>
        <tr>
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop='up' autoClose='outside'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Student Name {filterIcon("name")}
              </Dropdown.Toggle>
              <Dropdown.Menu as={ComboTableHeader} />
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
          <th style={{ cursor: "pointer" }}>
            <Dropdown drop='up'>
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Date of Birth {filterIcon("dob")}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTableSort("dob_desc")}>
                  Descending
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setTableSort("dob_asc")}>
                  Ascending
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
        </tr>
      </thead>
      <tbody>{studentList()}</tbody>
    </Table>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='display-1 d-flex flex-row'>Students</div>
      <div className='d-flex pt-3 px-3 card bg-light-subtle'>
        <InputGroup className='w-25 mb-3'>
          <Form.Control
            type='text'
            placeholder='Search Student'
            className='me-auto align-self-end w-25'
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
          <div className='spinner-border d-flex align-self-center' />
        ) : (
          listTable
        )}
      </div>
      <div className='d-flex'>
        <Can I='export' on='students'>
          <Button
            className='my-3 me-auto'
            variant='secondary'
            onClick={csvExport}
          >
            Export Student Data as CSV
          </Button>
        </Can>
        <Can do='add' on='students'>
          <button
            className='btn btn-primary my-3 ms-auto'
            onClick={() => navigate(`/newstudent`)}
          >
            Add New Student
          </button>
        </Can>
      </div>
    </div>
  );
};

export default StudentProfilesList;
