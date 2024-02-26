import { Card, Table, Dropdown } from "react-bootstrap";
import DropdownTableHeaderToggle from "../../../../Components/DropdownTableHeaderToggle";
import FilterTableHeader from "../../../../Components/FilterTableHeader";
import { useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const QueryResults = ({ results }) => {
  const [tableSort, setTableSort] = useState("date_desc");

  const [studentFilter, setStudentFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");

  const navigate = useNavigate();

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

  function tableData() {
    let res = results.filter((evaluation) => {
      return (
        evaluation.student_name
          .toLowerCase()
          .includes(studentFilter.toLowerCase()) &&
        evaluation.tutor_name.toLowerCase().includes(tutorFilter.toLowerCase())
      );
    });

    switch (tableSort) {
      case "date_desc":
        res.sort((a, b) => {
          return dayjs(b.date).diff(dayjs(a.date));
        });
        break;
      case "date_asc":
        res.sort((a, b) => {
          return dayjs(a.date).diff(dayjs(b.date));
        });
        break;
      default:
        break;
    }

    return res.map((evaluation, i) => {
      return (
        <tr
          key={i}
          onClick={() => navigate(`/eval/${evaluation.id}`)}
          style={{ cursor: "pointer" }}
        >
          <td>{dayjs(evaluation.date).format("MMMM DD, YYYY")}</td>
          <td>{evaluation.student_name}</td>
          <td>{evaluation.tutor_name}</td>
          <td>{evaluation.tasksCount}</td>
        </tr>
      );
    });
  }

  return (
    <Card className='px-3 pt-3 bg-light-subtle'>
      <div className='h4'>
        {results.length} result{results.length !== 1 ? "s" : ""}
        {localStorage.getItem("queryTimestamp") ? (
          <div className='text-secondary fs-6'>
            Last fetched{" "}
            {dayjs
              .duration(
                dayjs(localStorage.getItem("queryTimestamp")).diff(dayjs()),
              )
              .humanize()}{" "}
            ago
          </div>
        ) : null}
      </div>
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
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>{tableData()}</tbody>
      </Table>
    </Card>
  );
};

export default QueryResults;
