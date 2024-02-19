import { useContext, useEffect, useState } from "react";
import { auth, db } from "../Services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button, Card, Offcanvas, Table } from "react-bootstrap";
import dayjs from "dayjs";
import { ToastContext } from "../Services/toast";

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
      addToast({
        header: "Grades recorded",
        message: "Grades have been recorded",
      });
    });
  }

  async function submitEdit() {
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

  const gradesList = gradesHistory.map((grade) => {
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
                          <td>
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
                          <td>
                            <input
                              className='form-control'
                              type='text'
                              value={grade.subject}
                              onChange={(e) => {
                                const newGrades = [...grades];
                                newGrades[index].subject = e.target.value;
                                setGrades(newGrades);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              className='form-control'
                              type='text'
                              value={grade.grade}
                              onChange={(e) => {
                                const newGrades = [...grades];
                                newGrades[index].grade = e.target.value;
                                setGrades(newGrades);
                              }}
                            />
                          </td>
                          <td>
                            <input
                              className='form-control'
                              type='text'
                              value={grade.comments}
                              onChange={(e) => {
                                const newGrades = [...grades];
                                newGrades[index].comments = e.target.value;
                                setGrades(newGrades);
                              }}
                            />
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
          <Button variant='primary' type='submit' onClick={submitNew}>
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
                          </td>
                          <td>
                            <input
                              className='form-control'
                              type='text'
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
                          </td>
                          <td>
                            <input
                              className='form-control'
                              type='text'
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
            <Button variant='primary' type='submit' onClick={submitEdit}>
              Submit
            </Button>
            <Button
              variant='danger'
              className='ms-auto'
              onClick={() => {
                window.confirm(
                  "Are you sure you want to delete this record?",
                ) &&
                  deleteDoc(doc(db, "grades", selectedGrade.id)).then(() => {
                    addToast({
                      header: "Grades deleted",
                      message: "Grades have been deleted",
                    });
                    setShowEdit(false);
                  });
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
            <th>Tutor</th>
            <th className='w-50'>Grades</th>
          </tr>
        </thead>
        <tbody>{gradesList}</tbody>
      </Table>
      <Button
        variant='primary'
        className='ms-auto'
        onClick={() => setShowNew(true)}
      >
        Record Grades
      </Button>

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
