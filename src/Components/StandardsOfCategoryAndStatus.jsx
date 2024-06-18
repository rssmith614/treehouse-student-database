import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  Nav,
  Row,
} from "react-bootstrap";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import StandardInfo from "../Pages/Standards/Components/StandardInfo";

const grades = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
];
const categories = ["Math", "Reading"];

const StandardsOfCategoryAndStatus = ({ student }) => {
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState({});

  const [showStandardInfo, setShowStandardInfo] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState({});

  const [standardAverages, setStandardAverages] = useState({});

  const [grade, setGrade] = useState(localStorage.getItem("grade") || "K");
  const [category, setCategory] = useState(
    localStorage.getItem("category") || "Math",
  );

  const [standardFilter, setStandardFilter] = useState("");
  const [show, setShow] = useState(
    localStorage.getItem("showStandards") || "all",
  );

  useEffect(() => {
    const unsubscribeStandards = onSnapshot(
      query(
        collection(db, "standards"),
        where("grade", "==", grade),
        where("category", "==", category),
      ),
      (res) => {
        let newSubcategories = {};
        res.docs.forEach((standard) => {
          if (newSubcategories[standard.data().sub_category]) {
            newSubcategories[standard.data().sub_category].push({
              ...standard.data(),
              id: standard.id,
            });
          } else {
            newSubcategories[standard.data().sub_category] = [
              { ...standard.data(), id: standard.id },
            ];
          }
        });
        setSubcategories(newSubcategories);
        setLoading(false);
      },
    );

    localStorage.setItem("grade", grade);
    localStorage.setItem("category", category);

    return () => {
      unsubscribeStandards();
    };
  }, [grade, category]);

  useEffect(() => {
    const unsubscribeEvaluations = onSnapshot(
      query(
        collection(db, "evaluations"),
        where("draft", "==", false),
        where("student_id", "==", student.id),
      ),
      async (res) => {
        const evaluations = res.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        const standardProgression = {};

        const evaluationPromises = evaluations.map(async (evaluation) => {
          const evaluationRef = collection(
            db,
            "evaluations",
            evaluation.id,
            "tasks",
          );
          return getDocs(evaluationRef).then((tasksSnapshot) => {
            tasksSnapshot.forEach((taskDoc) => {
              const standards = taskDoc.data().standards;
              if (!standards) return;
              standards.forEach((standard) => {
                if (!standardProgression[standard?.id || standard]) {
                  standardProgression[standard?.id || standard] = [];
                }
                standardProgression[standard?.id || standard].push(
                  standard?.progression || taskDoc.data().progression,
                );
              });
            });
          });
        });

        await getDocs(
          query(
            collection(db, "student_assessments"),
            where("student_id", "==", student.id),
          ),
        ).then((res) => {
          res.docs.forEach((doc) => {
            const assessment = doc.data();
            Object.values(assessment.questions).forEach((question) => {
              if (!question.standard) return;
              if (!standardProgression[question.standard]) {
                standardProgression[question.standard] = [];
              }
              standardProgression[question.standard].push(question.score);
            });
          });
        });

        Promise.all(evaluationPromises).then(() => {
          const averageProgression = {};
          Object.keys(standardProgression).forEach((standard) => {
            const progressions = standardProgression[standard];
            const sum = progressions.reduce(
              (total, progression) => total + parseInt(progression),
              0,
            );
            const average = sum / progressions.length;
            averageProgression[standard] = average.toFixed(2);
          });

          // console.log(averageProgression);
          setStandardAverages(averageProgression);
        });
      },
    );

    return () => {
      unsubscribeEvaluations();
    };
  }, [student.id]);

  const gradeTabs = grades.map((g, i) => {
    return (
      <Nav.Item key={i}>
        <Nav.Link
          data-bs-toggle='tab'
          aria-current='true'
          eventKey={g.at(0)}
          onClick={() => setGrade(g.at(0))}
        >
          {g}
        </Nav.Link>
      </Nav.Item>
    );
  });

  const categoryTabs = categories.map((c, i) => {
    return (
      <Nav.Item key={i}>
        <Nav.Link
          data-bs-toggle='tab'
          aria-current='true'
          eventKey={c}
          onClick={() => setCategory(c)}
        >
          {c}
        </Nav.Link>
      </Nav.Item>
    );
  });

  function color(standard) {
    let temp = standardAverages[standard.id];
    if (temp === undefined) {
      return "body";
    } else if (temp >= 3.5) {
      return "success";
    } else if (temp >= 2.5) {
      return "primary";
    } else if (temp >= 1.5) {
      return "warning";
    } else if (temp >= 0) {
      return "danger";
    }
    return "secondary";
  }

  const listedStandards = Object.entries(subcategories)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((subCat, i) => {
      return (
        <Card className='p-3 my-3' key={i}>
          <Button
            variant='link'
            className='me-auto link-underline link-underline-opacity-0'
            style={{ cursor: "default" }}
          >
            <h4>{subCat[0]}</h4>
          </Button>
          <Container>
            <Row xs={{ cols: "auto" }}>
              {subCat[1]
                .filter((s) => {
                  return -(
                    s.key
                      .toLowerCase()
                      .includes(standardFilter.toLowerCase()) ||
                    s.category
                      .toLowerCase()
                      .includes(standardFilter.toLowerCase()) ||
                    s.sub_category
                      .toLowerCase()
                      .includes(standardFilter.toLowerCase()) ||
                    s.description
                      .toLowerCase()
                      .includes(standardFilter.toLowerCase())
                  );
                })
                .filter((s) => {
                  return show === "all" || standardAverages[s.id] !== undefined;
                })
                .sort((a, b) => {
                  return (
                    a.key.split(".")[1].localeCompare(b.key.split(".")[1]) ||
                    a.key.split(".")[2] - b.key.split(".")[2] ||
                    a.key.split(".")[2].localeCompare(b.key.split(".")[2]) ||
                    a.key.localeCompare(b.key)
                  );
                })
                .map((standard, i) => {
                  return (
                    <Col key={i}>
                      <button
                        className={`btn btn-link text-${color(standard)}
                        link-${color(standard)} link-offset-2 link-underline-opacity-50 link-underline-opacity-100-hover`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          let standardToShow = standard;
                          if (standardAverages[standard.id] !== undefined) {
                            standardToShow = {
                              ...standard,
                              progression: standardAverages[standard.id],
                            };
                          }
                          setSelectedStandard(standardToShow);
                          setShowStandardInfo(true);
                        }}
                      >
                        {standard.key}
                      </button>
                    </Col>
                  );
                })}
            </Row>
          </Container>
        </Card>
      );
    });

  return (
    <div>
      <Row className=''>
        <Col xs={12} md={3}>
          <InputGroup className='mb-3'>
            <Form.Control
              type='text'
              placeholder={`Search ${grades.find((g) => g[0] === grade[0])} ${category}`}
              value={standardFilter}
              onChange={(e) => {
                setStandardFilter(e.target.value);
              }}
            />
            <Button
              variant='secondary'
              className='bi bi-x-lg input-group-text'
              style={{ cursor: "pointer" }}
              onClick={() => setStandardFilter("")}
            />
          </InputGroup>
        </Col>
        <Col xs={12} md={6}>
          <div className='d-flex'>
            <Dropdown className='mb-3'>
              <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
                Showing{" "}
                {show === "all"
                  ? "All Standards"
                  : "Only This Student's Standards"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    setShow("all");
                    localStorage.setItem("showStandards", "all");
                  }}
                >
                  All
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setShow("this student");
                    localStorage.setItem("showStandards", "this student");
                  }}
                >
                  This Student
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {(show !== "all" || standardFilter !== "") && (
              <Button
                variant='link'
                className='mb-3'
                onClick={() => {
                  setStandardFilter("");
                  setShow("all");
                  localStorage.setItem("showStandards", "all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Col>
        <Col xs={12} md={3}></Col>
      </Row>
      <Card className='bg-light-subtle'>
        <Card.Header>
          <Nav variant='underline' activeKey={grade}>
            {gradeTabs}
          </Nav>
        </Card.Header>
        <Card.Header>
          <Nav fill variant='underline' activeKey={category}>
            {categoryTabs}
          </Nav>
        </Card.Header>
        <Card.Body className='d-flex flex-column'>
          {loading ? (
            <>
              <Card className='p-3 my-3 mw-0 placeholder-wave'>
                <div className='h4 placeholder m-3 col-2 bg-primary' />
                <Container>
                  <Row xs={{ cols: "auto" }}>
                    {[
                      ...Array(Math.floor(Math.random() * (12 - 4) + 4)).fill(
                        0,
                      ),
                    ].map((_, index) => (
                      <div className='placeholder m-3 col-1' key={index} />
                    ))}
                  </Row>
                </Container>
              </Card>
              <Card className='p-3 my-3 mw-0 placeholder-wave'>
                <div className='h4 placeholder m-3 col-2 bg-primary' />
                <Container>
                  <Row xs={{ cols: "auto" }}>
                    {[
                      ...Array(Math.floor(Math.random() * (12 - 4) + 4)).fill(
                        0,
                      ),
                    ].map((_, index) => (
                      <div className='placeholder m-3 col-1' key={index} />
                    ))}
                  </Row>
                </Container>
              </Card>
            </>
          ) : (
            listedStandards
          )}
        </Card.Body>
      </Card>
      <StandardInfo
        show={showStandardInfo}
        setShow={setShowStandardInfo}
        close={() => setShowStandardInfo(false)}
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
      />
    </div>
  );
};

export default StandardsOfCategoryAndStatus;
