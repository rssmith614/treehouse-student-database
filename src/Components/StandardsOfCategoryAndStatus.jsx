import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Nav,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../Services/firebase";

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
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [standardAverages, setStandardAverages] = useState({});

  const [show, setShow] = useState(false);

  const [grade, setGrade] = useState(localStorage.getItem("grade") || "K");
  const [category, setCategory] = useState(
    localStorage.getItem("category") || "Math",
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
        where("student_id", "==", student.id),
      ),
      (res) => {
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

  useEffect(() => {
    if (selectedStandard) {
      setShow(true);
    }
  }, [selectedStandard]);

  function color(standard) {
    let temp = standardAverages[standard.id];
    if (temp === undefined) {
      return "text-body";
    }
    if (temp >= 3) {
      return "text-success";
    }
    if (temp >= 2) {
      return "text-primary";
    }
    if (temp >= 1) {
      return "text-warning";
    }
    if (temp >= 0) {
      return "text-danger";
    }
    return "text-secondary";
  }

  const listedStandards = Object.entries(subcategories)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((subCat, i) => {
      return (
        <Card className='p-3 my-3' key={i}>
          {true ? (
            <Button
              variant='link'
              className='me-auto link-underline link-underline-opacity-0'
              style={{ cursor: "default" }}
            >
              <h5>{subCat[0]}</h5>
            </Button>
          ) : (
            <Button
              variant='link'
              className='me-auto link-underline link-underline-opacity-0'
              style={{ cursor: "default" }}
            >
              <h5>{subCat[0]}</h5>
            </Button>
          )}
          <Container>
            <Row xs={{ cols: "auto" }}>
              {subCat[1]
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
                      <OverlayTrigger
                        placement='right'
                        flip={true}
                        overlay={
                          <Popover className=''>
                            <Popover.Header>{standard.key}</Popover.Header>
                            <Popover.Body>
                              <div className='text-decoration-underline'>
                                Description
                              </div>
                              {standard.description}
                              {standardAverages[standard.id] !== undefined ? (
                                <>
                                  <hr />
                                  <div className='text-decoration-underline'>
                                    Average Progression
                                  </div>
                                  {standardAverages[standard.id]}
                                </>
                              ) : (
                                <></>
                              )}
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          className={`btn btn-link ${color(standard)}
                        link-underline link-underline-opacity-0 link-underline-opacity-0-hover`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStandard(standard)}
                        >
                          {standard.key}
                        </button>
                      </OverlayTrigger>
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
            <Spinner className='align-self-center' />
          ) : (
            listedStandards
          )}
        </Card.Body>
      </Card>
      <Offcanvas show={show} onHide={() => setShow(false)} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Standard {selectedStandard?.key}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card>
            <Card.Body>
              <div className='text-decoration-underline'>Description</div>
              {selectedStandard?.description}
              <hr />
              <div className='text-decoration-underline'>
                Average Progression
              </div>
              {standardAverages[selectedStandard?.id]}
            </Card.Body>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default StandardsOfCategoryAndStatus;
