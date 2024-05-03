import dayjs from "dayjs";
import { useContext, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  FormGroup,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import { ToastContext } from "../Services/toast";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Services/firebase";
import { useMediaQuery } from "react-responsive";

const StudentGradesEdit = ({ gradeEntry, setGradeEntry, setEdit, setShow }) => {
  const [grades, setGrades] = useState(
    gradeEntry.grades.map((g) => ({ ...g })),
  );

  const addToast = useContext(ToastContext);

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  function submitEntry(e) {
    e.preventDefault();

    document.getElementById("submit").setAttribute("disabled", "true");
    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm'></span>";

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }

    const date = document.getElementById("date").value;

    let clean = true;

    grades.forEach((grade, index) => {
      if (grade.subject === "") {
        document.getElementById(`subject-${index}`).classList.add("is-invalid");
        clean = false;
      }
      if (grade.grade === "") {
        document.getElementById(`grade-${index}`).classList.add("is-invalid");
        document
          .getElementById(`grade-${index}`)
          .parentElement.classList.add("is-invalid");
        clean = false;
      }
      if (parseFloat(grade.grade) < 80 && grade.comments === "") {
        document
          .getElementById(`comments-${index}`)
          .classList.add("is-invalid");
        clean = false;
      }
    });

    if (!clean) {
      document.getElementById("submit").removeAttribute("disabled");
      document.getElementById("submit").innerText = "Submit";
      return;
    }

    if (gradeEntry.id) {
      updateDoc(doc(db, "grades", gradeEntry.id), {
        date,
        grades,
      }).then(() => {
        setGradeEntry({ ...gradeEntry, date, grades });
        setEdit(false);
        addToast({
          header: "Grades recorded",
          message: "This record has been updated",
        });
      });
    } else {
      addDoc(collection(db, "grades"), {
        ...gradeEntry,
        date,
        grades,
      }).then((docRef) => {
        setGradeEntry({ ...gradeEntry, id: docRef.id, date, grades });
        setEdit(false);
        addToast({
          header: "Grades recorded",
          message: "Grades have been recorded",
        });
      });
    }
  }

  function deleteEntry(e) {
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteDoc(doc(db, "grades", gradeEntry.id)).then(() => {
        setGradeEntry({});
        setShow(false);
        addToast({
          header: "Grades deleted",
          message: "This record has been deleted",
        });
      });
    }
  }

  return (
    <div>
      <div className='mb-3'>
        <label htmlFor='date' className='form-label'>
          Date
        </label>
        <input
          type='date'
          className='form-control'
          id='date'
          defaultValue={dayjs(gradeEntry.date).format("YYYY-MM-DD")}
        />
      </div>
      <div className='mb-3'>
        <Card className='bg-light-subtle'>
          <Card.Body>
            <Card.Title>Grades</Card.Title>
            {grades.map((grade, index) => {
              return (
                <Row key={index}>
                  <Col xs={2} md={1} className='align-self-center'>
                    <Button
                      size={isDesktop ? "" : "sm"}
                      variant='danger'
                      onClick={() =>
                        setGrades((prev) => {
                          prev.splice(index, 1);
                          return [...prev];
                        })
                      }
                    >
                      <i className='bi bi-trash-fill'></i>
                    </Button>
                  </Col>
                  <Col xs={5} md={3} className='align-self-center'>
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      id={`subject-${index}`}
                      type='text'
                      value={grade.subject}
                      onChange={(e) => {
                        setGrades((prev) => {
                          prev[index].subject = e.target.value;
                          return [...prev];
                        });
                      }}
                    />
                  </Col>
                  <Col xs={5} md={2} className='align-self-center'>
                    <Form.Label>Grade</Form.Label>
                    <InputGroup hasValidation>
                      <Form.Control
                        id={`grade-${index}`}
                        type='text'
                        value={grade.grade}
                        onChange={(e) => {
                          setGrades((prev) => {
                            prev[index].grade = e.target.value;
                            return [...prev];
                          });
                        }}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control.Feedback type='invalid'>
                        Required
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Label className='pt-1'>Comments</Form.Label>
                    <textarea
                      id={`comments-${index}`}
                      className='form-control'
                      value={grade.comments}
                      onChange={(e) => {
                        setGrades((prev) => {
                          prev[index].comments = e.target.value;
                          return [...prev];
                        });
                      }}
                    />
                    <div className='invalid-feedback'>
                      Required if grade is less than 80%
                    </div>
                  </Col>
                  <hr className='my-3' />
                </Row>
              );
            })}
            <Button
              variant='secondary'
              onClick={() =>
                setGrades((prev) => [
                  ...prev,
                  { subject: "", grade: "", comments: "" },
                ])
              }
            >
              Add Another
            </Button>
          </Card.Body>
        </Card>
      </div>
      <div className='d-flex'>
        {gradeEntry.id && (
          <Button
            variant='secondary'
            className='me-3'
            onClick={() => setEdit(false)}
          >
            Cancel
          </Button>
        )}
        <Button
          id='submit'
          variant='primary'
          type='submit'
          onClick={submitEntry}
        >
          Submit
        </Button>
        {gradeEntry.id && (
          <Button variant='danger' className='ms-auto' onClick={deleteEntry}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudentGradesEdit;
