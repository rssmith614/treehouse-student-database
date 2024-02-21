import { useContext, useEffect, useState } from "react";
import { auth, db } from "../Services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button, Card, InputGroup, Offcanvas, Table } from "react-bootstrap";
import dayjs from "dayjs";
import { ToastContext } from "../Services/toast";
import { Can } from "../Services/can";
import { Grade } from "../Services/defineAbility";

const StudentGrades = ({ student }) => {
  const [gradesHistory, setGradesHistory] = useState([]);
  const [grades, setGrades] = useState([
    {
      subject: "",
      grade: "",
      comments: "",
    },
  ]);

  const [selectedGrade, setSelectedGrade] = useState({});

  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const addToast = useContext(ToastContext);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "grades"), where("student_id", "==", student)),
      (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setGradesHistory(data);
      },
    );

    return () => unsubscribe();
  }, [student]);

  async function submitNew() {
    document.getElementById("submit").setAttribute("disabled", "true");
    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm'></span>";

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }

    let clean = true;

    grades.forEach((grade, index) => {
      if (grade.subject === "") {
        document.getElementById(`subject-${index}`).classList.add("is-invalid");
        clean = false;
      }
      if (
        grade.grade === "" ||
        parseFloat(grade.grade) < 0 ||
        parseFloat(grade.grade) > 100
      ) {
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

    const date = document.getElementById("date").value;
    const tutor_id = auth.currentUser.uid;
    const tutor_name = (await getDoc(doc(db, "tutors", tutor_id))).data()
      .displayName;

    addDoc(collection(db, "grades"), {
      date,
      tutor_id,
      tutor_name,
      student_id: student,
      grades,
    }).then(() => {
      setShowNew(false);
      setGrades([
        {
          subject: "",
          grade: "",
          comments: "",
        },
      ]);
      addToast({
        header: "Grades recorded",
        message: "Grades have been recorded",
      });
    });
  }

  async function submitEdit() {
    document.getElementById("submit").setAttribute("disabled", "true");
    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }

    let clean = true;

    selectedGrade.grades.forEach((grade, index) => {
      if (grade.subject === "") {
        document.getElementById(`subject-${index}`).classList.add("is-invalid");
        clean = false;
      }
      if (
        grade.grade === "" ||
        parseFloat(grade.grade) < 0 ||
        parseFloat(grade.grade) > 100
      ) {
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

    const date = document.getElementById("date").value;
    const tutor_id = auth.currentUser.uid;
    const tutor_name = (await getDoc(doc(db, "tutors", tutor_id))).data()
      .displayName;

    updateDoc(doc(db, "grades", selectedGrade.id), {
      date,
      tutor_id,
      tutor_name,
      grades: selectedGrade.grades,
    }).then(() => {
      setShowEdit(false);
      addToast({
        header: "Grades recorded",
        message: "Grades have been updated",
      });
      setSelectedGrade({});
    });
  }

  const gradesList = gradesHistory
    .sort((a, b) => {
      return dayjs(b.date).diff(dayjs(a.date));
    })
    .map((grade) => {
      return (
        <tr
          key={grade.id}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            setSelectedGrade(grade);
            setShowEdit(true);
          }}
        >
          <td>{dayjs(grade.date).format("MMMM DD, YYYY")}</td>
          <td>{grade.tutor_name}</td>
          <td>
            <ul className='list-group'>
              {grade.grades.map((grade, index) => {
                return (
                  <li key={index} className='list-group-item'>
                    <strong>{grade.subject}</strong> - {grade.grade}
                    <br />
                    {grade.comments}
                  </li>
                );
              })}
            </ul>
          </td>
        </tr>
      );
    });

  const NewGradeOffcanvas = () => {
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Record Grades</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className='mb-3'>
            <label htmlFor='date' className='form-label'>
              Date
            </label>
            <input
              type='date'
              className='form-control'
              id='date'
              defaultValue={dayjs().format("YYYY-MM-DD")}
            />
          </div>
          <div className='mb-3'>
            <Card className='bg-light-subtle'>
              <Card.Body>
                <Card.Title>Grades</Card.Title>
                <Table>
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
                          <td className='align-middle'>
                            <Button
                              variant='danger'
                              size='sm'
                              onClick={() =>
                                setGrades(grades.filter((_, i) => i !== index))
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
                          <td className='align-middle'>
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
                    setGrades([
                      ...grades,
                      { subject: "", grade: "", comments: "" },
                    ])
                  }
                >
                  Add Another
                </Button>
              </Card.Body>
            </Card>
          </div>
          <Button
            id='submit'
            variant='primary'
            type='submit'
            onClick={submitNew}
          >
            Submit
          </Button>
        </Offcanvas.Body>
      </>
    );
  };

  const EditGradeOffcanvas = () => {
    if (
      Object.keys(selectedGrade).length === 0 &&
      selectedGrade.constructor === Object
    )
      return null;
    return (
      <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Edit Grades</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className='mb-3'>
            <label htmlFor='date' className='form-label'>
              Date
            </label>
            <input
              type='date'
              className='form-control'
              id='date'
              defaultValue={dayjs(selectedGrade.date).format("YYYY-MM-DD")}
            />
          </div>
          <div className='mb-3'>
            <Card className='bg-light-subtle'>
              <Card.Body>
                <Card.Title>Grades</Card.Title>
                <Table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Subject</th>
                      <th>Grade</th>
                      <th>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGrade.grades.map((grade, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            <Button
                              variant='danger'
                              size='sm'
                              onClick={() =>
                                setSelectedGrade({
                                  ...selectedGrade,
                                  grades: selectedGrade.grades.filter(
                                    (_, i) => i !== index,
                                  ),
                                })
                              }
                              disabled={selectedGrade.grades.length === 1}
                            >
                              <i className='bi bi-trash-fill'></i>
                            </Button>
                          </td>
                          <td>
                            <input
                              id={`subject-${index}`}
                              className='form-control'
                              type='text'
                              value={grade.subject}
                              onChange={(e) => {
                                const newGrades = [...selectedGrade.grades];
                                newGrades[index].subject = e.target.value;
                                setSelectedGrade({
                                  ...selectedGrade,
                                  grades: newGrades,
                                });
                              }}
                            />
                            <div className='invalid-feedback'>
                              Please specify a subject
                            </div>
                          </td>
                          <td>
                            <InputGroup>
                              <input
                                id={`grade-${index}`}
                                className='form-control'
                                type='number'
                                min={0}
                                max={100}
                                value={grade.grade}
                                onChange={(e) => {
                                  const newGrades = [...selectedGrade.grades];
                                  newGrades[index].grade = e.target.value;
                                  setSelectedGrade({
                                    ...selectedGrade,
                                    grades: newGrades,
                                  });
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
                                const newGrades = [...selectedGrade.grades];
                                newGrades[index].comments = e.target.value;
                                setSelectedGrade({
                                  ...selectedGrade,
                                  grades: newGrades,
                                });
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
                    setSelectedGrade({
                      ...selectedGrade,
                      grades: [
                        ...selectedGrade.grades,
                        { subject: "", grade: "", comments: "" },
                      ],
                    })
                  }
                >
                  Add Another
                </Button>
              </Card.Body>
            </Card>
          </div>
          <div className='d-flex'>
            <Button
              id='submit'
              variant='primary'
              type='submit'
              onClick={submitEdit}
            >
              Submit
            </Button>
            <Button
              variant='danger'
              className='ms-auto'
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this record?")
                ) {
                  deleteDoc(doc(db, "grades", selectedGrade.id)).then(() => {
                    addToast({
                      header: "Grades deleted",
                      message: "Selected grades have been deleted",
                    });
                    setShowEdit(false);
                  });
                  setSelectedGrade({});
                }
              }}
            >
              Delete
            </Button>
          </div>
        </Offcanvas.Body>
      </>
    );
  };

  return (
    <div className='d-flex flex-column'>
      <Table striped hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Recorded By</th>
            <th className='w-50'>Grades</th>
          </tr>
        </thead>
        <tbody>{gradesList}</tbody>
      </Table>

      <div className='d-flex'>
        <Can I='export' on={Grade}>
          <Button
            variant='secondary'
            onClick={() => {
              const csv = [
                "Date,Recorded By,Subject,Grade,Comments",
                ...gradesHistory.map((grade) => {
                  return grade.grades
                    .map((g) => {
                      return `"${dayjs(grade.date).format("MMMM DD, YYYY")}","${grade.tutor_name}","${g.subject}","${g.grade}","${g.comments}"`;
                    })
                    .join("\n");
                }),
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "grades.csv";
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            Export Grades as CSV
          </Button>
        </Can>
        <Button
          variant='primary'
          className='ms-auto'
          onClick={() => setShowNew(true)}
        >
          Record Grades
        </Button>
      </div>

      <Offcanvas
        show={showNew || showEdit}
        onHide={() => {
          setShowNew(false);
          setShowEdit(false);
        }}
        placement='end'
        className='w-75'
      >
        {showNew ? NewGradeOffcanvas() : EditGradeOffcanvas()}
      </Offcanvas>
    </div>
  );
};

export default StudentGrades;
