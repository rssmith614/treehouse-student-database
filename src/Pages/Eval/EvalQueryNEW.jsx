import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import { db } from "../../Services/firebase";
import { useNavigate } from "react-router-dom";

const EvalQuery = () => {
  const [evalConditions, setEvalConditions] = useState(
    localStorage.getItem("evalConditions")
      ? JSON.parse(localStorage.getItem("evalConditions"))
      : [],
  );
  const [studentConditions, setStudentConditions] = useState(
    localStorage.getItem("studentConditions")
      ? JSON.parse(localStorage.getItem("studentConditions"))
      : [],
  );
  // const [tutorConditions, setTutorConditions] = useState(
  //   localStorage.getItem("tutorConditions")
  //     ? JSON.parse(localStorage.getItem("tutorConditions"))
  //     : [],
  // );
  const [tutorList, setTutorList] = useState(
    localStorage.getItem("tutorList")
      ? JSON.parse(localStorage.getItem("tutorList"))
      : [],
  );

  const [tutors, setTutors] = useState([]);

  const [evals, setEvals] = useState(
    localStorage.getItem("evalQueryResults")
      ? JSON.parse(localStorage.getItem("evalQueryResults"))
      : [],
  );

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeTutors = onSnapshot(
      collection(db, "tutors"),
      (snapshot) => {
        setTutors(snapshot.docs.map((doc) => doc.data()));
      },
    );

    return () => {
      unsubscribeTutors();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("evalConditions", JSON.stringify(evalConditions));
  }, [evalConditions]);

  useEffect(() => {
    localStorage.setItem(
      "studentConditions",
      JSON.stringify(studentConditions),
    );
  }, [studentConditions]);

  useEffect(() => {
    localStorage.setItem("tutorList", JSON.stringify(tutorList));
  }, [tutorList]);

  async function sendit(e) {
    // Validate non-empty conditions
    if (
      evalConditions.length === 0 &&
      studentConditions.length === 0 &&
      (tutorList.length === 0 || tutorList.length === tutors.length)
    ) {
      window.alert("Please specify at least one condition");
      return;
    }

    e.target.setAttribute("disabled", true);
    e.target.innerHTML =
      "Loading... <Spinner className='ms-2' animation='border' size='sm' />";

    // Get students

    let studentQueryConditions = studentConditions.map((condition) => {
      return where(condition.name, condition.condition, condition.value);
    });

    let studentCandidates = (
      await getDocs(
        query.apply(null, [
          collection(db, "students"),
          ...studentQueryConditions,
        ]),
      )
    ).docs.map((doc) => doc.id);

    // Get evals

    let evalQueryConditions = evalConditions.map((condition) => {
      return where(condition.name, condition.condition, condition.value);
    });

    if (tutorList.length > 0) {
      evalQueryConditions.push(
        where(
          "tutor_id",
          "in",
          tutorList.map((t) => t.uid),
        ),
      );
    }
    if (studentCandidates.length > 0) {
      evalQueryConditions.push(where("student_id", "in", studentCandidates));
    }

    getDocs(
      query.apply(null, [
        collection(db, "evaluations"),
        ...evalQueryConditions,
      ]),
    ).then(async (snapshot) => {
      let tempEvals = snapshot.docs.map(async (evaluation) => {
        let evalData = { ...evaluation.data(), id: evaluation.id };
        let tasksSnapshot = await getDocs(collection(evaluation.ref, "tasks"));
        let tasksCount = tasksSnapshot.size;
        return { ...evalData, tasksCount };
      });
      Promise.all(tempEvals).then((evaluations) => {
        setEvals(evaluations);
        e.target.removeAttribute("disabled");
        e.target.innerHTML = "Query!";
        localStorage.setItem("evalQueryResults", JSON.stringify(evaluations));
      });
    });
  }

  function dateConditionLabel(condition) {
    switch (condition) {
      case "==":
        return "On";
      case "<=":
        return "On or Before";
      case ">=":
        return "On or After";
      default:
        return "On";
    }
  }

  // BEGIN EVAL FILTERS STYLING

  const evalConditionFields = (index) => (
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "date";
          newEvalConditions[index].value = "";
          setEvalConditions(newEvalConditions);
        }}
      >
        Date
      </Dropdown.Item>
      {/* <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "subject";
          newEvalConditions[index].value = "Other";
          setEvalConditions(newEvalConditions);
        }}
      >
        Subject
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "standard";
          newEvalConditions[index].value = "";
          setEvalConditions(newEvalConditions);
        }}
      >
        Standard
      </Dropdown.Item> */}
      <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "flagged";
          newEvalConditions[index].value = true;
          setEvalConditions(newEvalConditions);
        }}
      >
        Flagged for Review
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const dateCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Date
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {dateConditionLabel(condition.condition)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = "==";
                setEvalConditions(newEvalConditions);
              }}
            >
              On
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = "<=";
                setEvalConditions(newEvalConditions);
              }}
            >
              On or Before
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = ">=";
                setEvalConditions(newEvalConditions);
              }}
            >
              On or After
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Form.Control
          type='date'
          value={condition.value}
          onChange={(e) => {
            const newEvalConditions = [...evalConditions];
            newEvalConditions[index].value = e.target.value;
            setEvalConditions(newEvalConditions);
          }}
        />
      </InputGroup>
    );
  };

  const subjectCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Has Subject
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {condition.value || "Other"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = "Other";
                setEvalConditions(newEvalConditions);
              }}
            >
              Other
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = "Reading";
                setEvalConditions(newEvalConditions);
              }}
            >
              Reading
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = "Math";
                setEvalConditions(newEvalConditions);
              }}
            >
              Math
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </InputGroup>
    );
  };

  const standardCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Has Standard
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newEvalConditions = [...evalConditions];
            newEvalConditions[index].value = e.target.value;
            setEvalConditions(newEvalConditions);
          }}
        />
      </InputGroup>
    );
  };

  const flaggedCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Is Flagged
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {condition.value ? "Yes" : "No"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = true;
                setEvalConditions(newEvalConditions);
              }}
            >
              Yes
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = false;
                setEvalConditions(newEvalConditions);
              }}
            >
              No
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </InputGroup>
    );
  };

  // BEGIN STUDENT FILTERS STYLING

  const studentConditionFields = (index) => (
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "name";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Name
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_school";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        School
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_source";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Source
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_grade";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Grade
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_dob";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Date of Birth
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const studentNameCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Name
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const schoolCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            School
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const sourceCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Source
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const gradeCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Grade
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const dobCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Date of Birth
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {dateConditionLabel(condition.condition)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = "==";
                setStudentConditions(newStudentConditions);
              }}
            >
              On
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = "<=";
                setStudentConditions(newStudentConditions);
              }}
            >
              On or Before
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = ">=";
                setStudentConditions(newStudentConditions);
              }}
            >
              On or After
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Form.Control
          type='date'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  // CONDITION LIST STYLING

  function evalConditionType(condition) {
    switch (condition.name) {
      case "date":
        return dateCondition;
      case "standard":
        return standardCondition;
      case "subject":
        return subjectCondition;
      case "flagged":
        return flaggedCondition;
      default:
        return dateCondition;
    }
  }

  const evalConditionsList = evalConditions.map((condition, index) => {
    return (
      <div className='d-flex' key={index}>
        {index === 0 ? null : (
          <Button variant='secondary' className='me-3 my-3' disabled>
            AND
          </Button>
        )}
        {evalConditionType(condition)(condition, index)}
        <Button
          variant='danger'
          className='ms-3 my-3'
          onClick={() => {
            const newEvalConditions = [...evalConditions];
            newEvalConditions.splice(index, 1);
            setEvalConditions(newEvalConditions);
          }}
        >
          Remove
        </Button>
      </div>
    );
  });

  function studentConditionType(condition) {
    switch (condition.name) {
      case "student_name":
        return studentNameCondition;
      case "student_school":
        return schoolCondition;
      case "student_source":
        return sourceCondition;
      case "student_grade":
        return gradeCondition;
      case "student_dob":
        return dobCondition;
      default:
        return studentNameCondition;
    }
  }

  const studentConditionsList = studentConditions.map((condition, index) => {
    return (
      <div className='d-flex' key={index}>
        {index === 0 ? null : (
          <Button variant='secondary' className='me-3 my-3' disabled>
            AND
          </Button>
        )}
        {studentConditionType(condition)(condition, index)}
        <Button
          variant='danger'
          className='ms-3 my-3'
          onClick={() => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions.splice(index, 1);
            setStudentConditions(newStudentConditions);
          }}
        >
          Remove
        </Button>
      </div>
    );
  });

  const tutorDropdownLabel = (list) => {
    if (list.length === tutors.length || list.length === 0) {
      return "Any";
    } else {
      return list.map((t, i) => {
        return i > 0 ? " " + t.displayName : t.displayName;
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
          {tutors
            .filter((t) =>
              t.displayName.toLowerCase().includes(search.toLowerCase()),
            )
            .map((tutor, i) => {
              return (
                <Form.Check
                  key={i}
                  checked={value.some((t) => t.uid === tutor.uid)}
                  label={tutor.displayName}
                  className='mx-3 my-2 w-auto'
                  onChange={(e) => {
                    if (e.target.checked) {
                      valueSetter([...value, tutor]);
                    } else {
                      valueSetter(value.filter((t) => t.uid !== tutor.uid));
                    }
                  }}
                />
              );
            })}
        </div>
      );
    },
  );

  return (
    <div className='p-3'>
      <div className='display-1'>Evaluation Query Tool</div>
      <Card className='bg-light-subtle'>
        <Card.Body>
          <Row>
            <div className='h4'>Evaluation</div>
            {evalConditionsList}
            <div className='d-flex py-3'>
              <Button
                variant='secondary'
                className=''
                onClick={() => {
                  const newEvalConditions = [...evalConditions];
                  newEvalConditions.push({
                    name: "date",
                    condition: "==",
                    value: "",
                  });
                  setEvalConditions(newEvalConditions);
                }}
              >
                Add Condition
              </Button>
            </div>
          </Row>
          <hr />
          <Row>
            <div className='h4'>Student</div>
            {studentConditionsList}
            <div className='d-flex py-3'>
              <Button
                variant='secondary'
                className=''
                onClick={() => {
                  const newStudentConditions = [...studentConditions];
                  newStudentConditions.push({
                    name: "name",
                    condition: "==",
                    value: "",
                  });
                  setStudentConditions(newStudentConditions);
                }}
              >
                Add Condition
              </Button>
            </div>
          </Row>
          <hr />
          <Row>
            <div className='h4'>Tutor</div>
            <Dropdown>
              <Dropdown.Toggle as={TutorDropdownToggle} value={tutorList} />
              <Dropdown.Menu
                as={TutorDropdown}
                value={tutorList}
                valueSetter={setTutorList}
              />
            </Dropdown>
          </Row>
        </Card.Body>
      </Card>
      <div className='d-flex py-3'>
        <Button
          id='query'
          variant='primary'
          className='me-auto'
          onClick={sendit}
        >
          Query!
        </Button>
        <Button
          variant='secondary'
          className='ms-auto'
          onClick={() => {
            setEvalConditions([]);
            setStudentConditions([]);
            setTutorList([]);
          }}
        >
          Reset
        </Button>
      </div>
      <Card className='bg-light-subtle'>
        <Card.Body>
          <Row>
            <div className='h4'>{evals.length} Results</div>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Tasks</th>
                </tr>
              </thead>
              <tbody>
                {evals.map((evaluation, i) => {
                  return (
                    <tr
                      key={i}
                      onClick={() => navigate(`/eval/${evaluation.id}`)}
                    >
                      <td>{evaluation.date}</td>
                      <td>{evaluation.student_name}</td>
                      <td>{evaluation.tutor_name}</td>
                      <td>{evaluation.tasksCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Row>
          <Button
            variant='secondary'
            onClick={() => {
              setEvals([]);
              localStorage.removeItem("evalQueryResults");
            }}
          >
            Clear
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EvalQuery;
