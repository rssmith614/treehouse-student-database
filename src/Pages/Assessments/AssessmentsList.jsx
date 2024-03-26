import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const grades = {
  K: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

const AssessmentsList = () => {
  const [assessments, setAssessments] = useState({});

  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAssessments = onSnapshot(
      collection(db, "assessments"),
      (res) => {
        let assessmentGroups = {};
        res.docs.forEach((amt) => {
          if (assessmentGroups[amt.data().grade]) {
            assessmentGroups[amt.data().grade].push({
              ...amt.data(),
              id: amt.id,
            });
          } else {
            assessmentGroups[amt.data().grade] = [
              { ...amt.data(), id: amt.id },
            ];
          }
        });
        setAssessments(assessmentGroups);
      },
    );

    return () => unsubscribeAssessments();
  }, []);

  return (
    <>
      <div className='d-flex flex-column p-3'>
        <div className='display-1'>All Assessments</div>
        <h5>Select an assessment to edit, or add a new one</h5>
        <Card className='bg-light-subtle py-3'>
          <Container>
            <Row className='justify-content-around' xs={{ cols: "auto" }}>
              {Object.entries(assessments)
                .sort(
                  (a, b) =>
                    ({
                      numbernumber: a - b,
                      stringnumber: -1,
                      numberstring: 1,
                      stringstring: a > b ? 1 : -1,
                    })[typeof a + typeof b],
                )
                .map((amtGroup, i) => {
                  return (
                    <Col key={i} xs={12}>
                      <Card className='p-3 my-3' key={i}>
                        <h3 className='text-primary'>{grades[amtGroup[0]]}</h3>
                        <Container>
                          <Row xs={{ cols: "auto" }}>
                            {amtGroup[1]
                              .sort((a, b) =>
                                a.category.localeCompare(b.category),
                              )
                              .map((amt, i) => {
                                return (
                                  <Col key={i}>
                                    <Button
                                      variant='link'
                                      className='link-body-emphasis link-underline link-underline-opacity-0 link-underline-opacity-75-hover'
                                      onClick={() =>
                                        navigate(`/assessments/edit/${amt.id}`)
                                      }
                                    >
                                      {amt.category}
                                    </Button>
                                  </Col>
                                );
                              })}
                          </Row>
                        </Container>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          </Container>
        </Card>
        <Button
          variant='primary'
          className='mt-3 ms-auto'
          onClick={() => {
            setShow(true);
          }}
        >
          Add New Assessment
        </Button>
      </div>
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Assessment Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Grade</Form.Label>
          <Form.Select id='new_grade' defaultValue=''>
            <option disabled value=''>
              Select One
            </option>
            {Object.keys(grades).map((grade, i) => {
              return (
                <option key={i} value={grade}>
                  {grades[grade]}
                </option>
              );
            })}
          </Form.Select>
          <div className='invalid-feedback'>Please select a grade</div>
          <Form.Label className='pt-3'>Category</Form.Label>
          <Form.Control type='text' id='new_cat' />
          <div className='invalid-feedback'>Please enter a category</div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            className='me-auto'
            onClick={() => setShow(false)}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={(e) => {
              e.preventDefault();

              const newGradeEl = document.getElementById("new_grade");
              const newCatEl = document.getElementById("new_cat");

              if (newGradeEl.value === "" || newCatEl.value === "") {
                if (newGradeEl.value === "") {
                  newGradeEl.classList.add("is-invalid");
                } else {
                  newGradeEl.classList.remove("is-invalid");
                }

                if (newCatEl.value === "") {
                  newCatEl.classList.add("is-invalid");
                } else {
                  newCatEl.classList.remove("is-invalid");
                }

                return;
              }

              e.target.setAttribute("disabled", "true");
              e.target.innerHTML =
                "Add <span class='spinner-border spinner-border-sm'></span>";

              // Add assessment to database
              addDoc(collection(db, "assessments"), {
                grade: newGradeEl.value,
                category: newCatEl.value,
                questions: [],
              }).then((res) => {
                navigate(`/assessments/edit/${res.id}`);
              });
            }}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AssessmentsList;
