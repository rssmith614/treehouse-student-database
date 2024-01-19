import {
  collection,
  collectionGroup,
  count,
  getAggregateFromServer,
  getDocs,
  query,
  where,
  documentId,
  getDoc,
  doc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import { db } from "../../Services/firebase";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const EvalQuery = () => {
  const [dateMatching, setDateMatching] = useState("on"); // on, (on or) before, (on or) after, between
  const [subjectMatching, setSubjectMatching] = useState("like");

  const [studentNameMatching, setStudentNameMatching] = useState("like");
  const [schoolMatching, setSchoolMatching] = useState("like");
  const [sourceMatching, setSourceMatching] = useState("like");
  const [gradeMatching, setGradeMatching] = useState("like");

  const [tutorList, setTutorList] = useState([]); // for matching tutor name on eval
  const [preferredTutorList, setPreferredTutorList] = useState([]); // for matching student's preferred tutor

  const [tutors, setTutors] = useState([]);

  const [evals, setEvals] = useState([]);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, "tutors")).then((res) => setTutors(res.docs));
  }, []);

  function filterInPlace(a, condition, thisArg) {
    let j = 0;

    a.forEach((e, i) => {
      if (condition.call(thisArg, e, i, a)) {
        if (i !== j) a[j] = e;
        j++;
      }
    });

    a.length = j;
    return a;
  }

  async function queryEvals(e) {
    e.preventDefault();

    setLoading(true);
    setEvals([]);

    let evalQueryConditions = [];

    // EVAL FILTERS

    if (dateMatching === "between") {
      let evalStartDate = document.getElementById("eval_date").value;
      let evalEndDate = document.getElementById("eval_date_end").value;

      evalQueryConditions.push(
        where("date", ">=", evalStartDate),
        where("date", "<=", evalEndDate),
      );
    } else {
      let evalDate = document.getElementById("eval_date").value;

      if (evalDate !== "") {
        if (dateMatching === "on") {
          evalQueryConditions.push(where("date", "==", evalDate));
        } else if (dateMatching === "before") {
          evalQueryConditions.push(where("date", "<=", evalDate));
        } else if (dateMatching === "after") {
          evalQueryConditions.push(where("date", ">=", evalDate));
        }
      }
    }

    if (subjectMatching === "exact") {
      let evalSubject = document.getElementById("subject").value;
      let evalIds = [];
      (
        await getDocs(
          query(
            collectionGroup(db, "tasks"),
            where("subject", "==", evalSubject),
          ),
        )
      ).forEach((task) => {
        evalIds.push(task.ref.parent.parent.id);
      });
      evalQueryConditions.push(where(documentId(), "in", evalIds));
    }

    // STUDENT FILTERS

    let studentQueryConditions = [];

    if (studentNameMatching === "exact") {
      let studentName = document.getElementById("student_name").value;
      studentQueryConditions.push(where("student_name", "==", studentName));
    }

    if (
      preferredTutorList.length !== 0 &&
      preferredTutorList.length < tutors.length
    ) {
      studentQueryConditions.push(
        where(
          "preferred_tutor",
          "in",
          preferredTutorList.map((t) => t.id),
        ),
      );
    }

    if (schoolMatching === "exact") {
      let studentSchool = document.getElementById("student_school").value;
      studentQueryConditions.push(where("student_school", "==", studentSchool));
    }

    if (sourceMatching === "exact") {
      let studentSource = document.getElementById("student_source").value;
      studentQueryConditions.push(where("student_source", "==", studentSource));
    }

    if (gradeMatching === "exact") {
      let studentGrade = document.getElementById("student_grade").value;
      studentQueryConditions.push(where("student_grade", "==", studentGrade));
    }

    studentQueryConditions.unshift(collection(db, "students"));
    let studentCount = (
      await getAggregateFromServer(collection(db, "students"), {
        count: count(),
      })
    ).data().count;
    let studentCandidates = (
      await getDocs(query.apply(null, studentQueryConditions))
    ).docs;

    if (studentNameMatching === "like") {
      let studentName = document.getElementById("student_name").value;
      filterInPlace(studentCandidates, (s) =>
        s.data().student_name.toLowerCase().includes(studentName.toLowerCase()),
      );
    }

    if (schoolMatching === "like") {
      let studentSchool = document.getElementById("student_school").value;
      filterInPlace(studentCandidates, (s) =>
        s
          .data()
          .student_school.toLowerCase()
          .includes(studentSchool.toLowerCase()),
      );
    }

    if (sourceMatching === "like") {
      let studentSource = document.getElementById("student_source").value;
      filterInPlace(studentCandidates, (s) =>
        s
          .data()
          .student_source.toLowerCase()
          .includes(studentSource.toLowerCase()),
      );
    }

    if (gradeMatching === "like") {
      let studentGrade = document.getElementById("student_grade").value;
      filterInPlace(studentCandidates, (s) =>
        s
          .data()
          .student_grade.toLowerCase()
          .includes(studentGrade.toLowerCase()),
      );
    }

    if (studentCount > studentCandidates.length) {
      if (studentCandidates.length !== 0) {
        evalQueryConditions.push(
          where(
            "student_id",
            "in",
            studentCandidates.map((s) => s.id),
          ),
        );
      }
    }

    // TUTOR FILTER

    if (tutorList.length !== 0 && tutorList.length !== tutors.length) {
      evalQueryConditions.push(
        where(
          "tutor_id",
          "in",
          tutorList.map((t) => t.id),
        ),
      );
    }

    if (evalQueryConditions.length === 0) {
      if (
        !window.confirm(
          "You either specified no filters, or are using filters that can only be applied client-side. This will query every evaluation in the database. Proceed?",
        )
      ) {
        setLoading(false);
        return;
      }
    }

    evalQueryConditions.unshift(collection(db, "evaluations"));
    let evalQuery = query.apply(null, evalQueryConditions);

    getDocs(evalQuery)
      .then((res) => {
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
        ).then((compiledEvals) => {
          // console.log(compiledEvals)
          if (subjectMatching === "like") {
            let evalSubject = document.getElementById("subject").value;
            setEvals(
              compiledEvals.filter((e) => {
                let taskString = e.tasks.join(" ");
                return taskString
                  .toLowerCase()
                  .includes(evalSubject.toLowerCase());
              }),
            );
          } else {
            setEvals(compiledEvals);
          }
        });
      })
      .then(setLoading(false));
  }

  const MatchingType = React.forwardRef(({ children, onClick }, ref) => (
    <Button
      variant='secondary'
      className='d-flex'
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </Button>
  ));

  const tutorDropdownLabel = (list) => {
    if (list.length === tutors.length || list.length === 0) {
      return "Any";
    } else {
      return list.map((t, i) => {
        return i > 0 ? " " + t.data().displayName : t.data().displayName;
      });
    }
  };

  const TutorDropdownToggle = React.forwardRef(
    ({ style, className, onClick, value }, ref) => (
      <Form.Control
        ref={ref}
        style={{ ...style, cursor: "pointer" }}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        value={tutorDropdownLabel(value)}
        readOnly
      ></Form.Control>
    ),
  );

  const TutorDropdown = React.forwardRef(
    ({ style, className, value, valueSetter }, ref) => {
      const [search, setSearch] = useState("");

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Form.Control
            className='mx-3 my-2 w-auto'
            placeholder='Search'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          {/* <Form.Check
          label='Select All'
          className="mx-3 my-2 w-auto"
          checked={value.length === tutors.length}
          onChange={e => e.target.checked ? valueSetter(tutors) : valueSetter([])}
        /> */}
          {tutors
            .filter((t) =>
              t.data().displayName.toLowerCase().includes(search.toLowerCase()),
            )
            .map((tutor, i) => {
              return (
                <Form.Check
                  key={i}
                  checked={value.includes(tutor)}
                  label={tutor.data().displayName}
                  className='mx-3 my-2 w-auto'
                  onChange={(e) => {
                    if (e.target.checked) {
                      valueSetter([...value, tutor]);
                    } else {
                      valueSetter(value.filter((t) => t !== tutor));
                    }
                  }}
                />
              );
            })}
        </div>
      );
    },
  );

  const dateMatchingLabel = () => {
    switch (dateMatching) {
      case "on":
        return "On";
      case "before":
        return "On or Before";
      case "after":
        return "On or After";
      case "between":
        return "Between";
      default:
        return "";
    }
  };

  const [tableSort, setTableSort] = useState("date_desc");

  const [tutorFilter, setTutorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

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
          <td>{evaluation.student_name}</td>
          <td>{evaluation.tutor_name}</td>
          <td>
            {evaluation.tasks.map((t) => {
              return (
                <>
                  {t}
                  <br />
                </>
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
    <div className='d-flex flex-column p-3'>
      <div className='display-1'>Eval Querying Tool</div>
      <div className='h5'>Define filters, then press "Query"</div>
      {/* <Form onSubmit={queryEvals}> */}
      <Card className='p-3 bg-light-subtle'>
        <Row>
          <div className='h4'>Evaluation</div>
        </Row>
        <Row>
          <Col>
            <Form.Label className='h5'>Date</Form.Label>
            <InputGroup>
              <Dropdown>
                <Dropdown.Toggle variant='secondary'>
                  {dateMatchingLabel()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setDateMatching("on")}>
                    On
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateMatching("before")}>
                    On or Before
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateMatching("after")}>
                    On or After
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateMatching("between")}>
                    Between
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {dateMatching === "between" ? (
                <>
                  <Form.Control type='date' id='eval_date' required />
                  <Form.Control type='date' id='eval_date_end' required />
                </>
              ) : (
                <Form.Control type='date' id='eval_date' />
              )}
            </InputGroup>
          </Col>
          <Col>
            <Form.Label className='h5'>Subject</Form.Label>
            <InputGroup>
              <Button
                as={MatchingType}
                onClick={() =>
                  subjectMatching === "like"
                    ? setSubjectMatching("exact")
                    : setSubjectMatching("like")
                }
              >
                {subjectMatching === "like" ? "Contains" : "Exactly"}
              </Button>
              <Form.Control type='text' id='subject' />
            </InputGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <div className='h4'>Student</div>
        </Row>
        <Row>
          <Col>
            <Form.Label className='h5'>Name</Form.Label>
            <InputGroup>
              <Button
                as={MatchingType}
                onClick={() =>
                  studentNameMatching === "like"
                    ? setStudentNameMatching("exact")
                    : setStudentNameMatching("like")
                }
              >
                {studentNameMatching === "like" ? "Contains" : "Exactly"}
              </Button>
              <Form.Control type='text' id='student_name' />
            </InputGroup>
          </Col>
          <Col>
            <Form.Label className='h5'>Preferred Tutor</Form.Label>
            <InputGroup>
              <Dropdown>
                <Dropdown.Toggle
                  as={TutorDropdownToggle}
                  value={preferredTutorList}
                />
                <Dropdown.Menu
                  as={TutorDropdown}
                  value={preferredTutorList}
                  valueSetter={setPreferredTutorList}
                />
              </Dropdown>
            </InputGroup>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Form.Label className='h5'>School</Form.Label>
            <InputGroup>
              <Button
                as={MatchingType}
                onClick={() =>
                  schoolMatching === "like"
                    ? setSchoolMatching("exact")
                    : setSchoolMatching("like")
                }
              >
                {schoolMatching === "like" ? "Contains" : "Exactly"}
              </Button>
              <Form.Control type='text' id='student_school' />
            </InputGroup>
          </Col>
          <Col>
            <Form.Label className='h5'>Source</Form.Label>
            <InputGroup>
              <Button
                as={MatchingType}
                onClick={() =>
                  sourceMatching === "like"
                    ? setSourceMatching("exact")
                    : setSourceMatching("like")
                }
              >
                {sourceMatching === "like" ? "Contains" : "Exactly"}
              </Button>
              <Form.Control type='text' id='student_source' />
            </InputGroup>
          </Col>
          <Col>
            <Form.Label className='h5'>Grade</Form.Label>
            <InputGroup>
              <Button
                as={MatchingType}
                onClick={() =>
                  gradeMatching === "like"
                    ? setGradeMatching("exact")
                    : setGradeMatching("like")
                }
              >
                {gradeMatching === "like" ? "Contains" : "Exactly"}
              </Button>
              <Form.Control type='text' id='student_grade' />
            </InputGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <div className='h4'>Tutor</div>
        </Row>
        <Row>
          <Col>
            <Form.Label className='h5'>Name</Form.Label>
            <InputGroup>
              <Dropdown>
                <Dropdown.Toggle as={TutorDropdownToggle} value={tutorList} />
                <Dropdown.Menu
                  as={TutorDropdown}
                  value={tutorList}
                  valueSetter={setTutorList}
                />
              </Dropdown>
            </InputGroup>
          </Col>
          <Col></Col>
        </Row>
      </Card>
      <div className='d-flex justify-content-center'>
        {loading ? (
          <Button className='m-3 w-25' id='queryButton' disabled>
            Query <span className='spinner-border spinner-border-sm' />
          </Button>
        ) : (
          <Button className='m-3 w-25' onClick={queryEvals} id='queryButton'>
            Query
          </Button>
        )}
      </div>
      {/* </Form> */}
      {loading ? (
        <></>
      ) : (
        <Card className='px-3 pt-3 bg-light-subtle'>
          <div className='h3'>
            {evals.length} result{evals.length !== 1 ? "s" : ""}
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
                {/* <th className="w-50">Subject</th>
              <th className="">Engagement</th>
              <th className="">Progression</th> */}
              </tr>
            </thead>
            <tbody>{evalList()}</tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default EvalQuery;
