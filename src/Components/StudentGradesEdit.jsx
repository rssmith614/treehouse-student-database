import dayjs from "dayjs";
import { useContext, useState } from "react";
import { Button, Card, InputGroup, Table } from "react-bootstrap";
import { ToastContext } from "../Services/toast";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../Services/firebase";

const StudentGradesEdit = ({ gradeEntry, setGradeEntry, setEdit, setShow }) => {
  const [grades, setGrades] = useState(gradeEntry.grades);

  const addToast = useContext(ToastContext);

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
          message: "This record have been updated",
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
            <Table striped>
              <thead>
                <tr>
                  <th></th>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, index) => {
                  return (
                    <tr key={index}>
                      <td className='align-middle text-center'>
                        <Button
                          variant='danger'
                          size='sm'
                          onClick={() =>
                            setGrades((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          disabled={grades.length === 1}
                        >
                          <i className='bi bi-trash-fill'></i>
                        </Button>
                      </td>
                      <td className='align-middle'>
                        <input
                          id={`subject-${index}`}
                          className='form-control'
                          type='text'
                          value={grade.subject}
                          onChange={(e) => {
                            const newGrades = [...grades];
                            newGrades[index].subject = e.target.value;
                            setGrades(newGrades);
                          }}
                        />
                        <div className='invalid-feedback'>
                          Please specify a subject
                        </div>
                      </td>
                      <td className='align-middle'>
                        <InputGroup>
                          <input
                            id={`grade-${index}`}
                            className='form-control'
                            type='number'
                            min={0}
                            max={100}
                            value={grade.grade}
                            onChange={(e) => {
                              const newGrades = [...grades];
                              newGrades[index].grade = e.target.value;
                              setGrades(newGrades);
                            }}
                          />
                          <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                        <div className='invalid-feedback'>
                          Please specify a valid grade
                        </div>
                      </td>
                      <td>
                        <textarea
                          id={`comments-${index}`}
                          className='form-control'
                          value={grade.comments}
                          onChange={(e) => {
                            const newGrades = [...grades];
                            newGrades[index].comments = e.target.value;
                            setGrades(newGrades);
                          }}
                        />
                        <div className='invalid-feedback'>
                          Please comment on this grade
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
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
