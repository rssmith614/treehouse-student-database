import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import { deleteObject, ref } from "firebase/storage";

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

const StudentAssessmentEdit = () => {
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");
  const [assessment, setAssessment] = useState({});

  // const [fileURL, setFileURL] = useState('');

  const params = useParams();

  const navigate = useNavigate();

  const addToast = useContext(ToastContext);

  useEffect(() => {
    const unsubscribeTutors = onSnapshot(
      collection(db, "tutors"),
      (snapshot) => {
        const newTutors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTutors(newTutors);
      },
    );

    const unsubscribeAssessments = onSnapshot(
      doc(db, "student_assessments", params.assessmentid),
      (doc) => {
        setAssessment({ ...doc.data(), id: doc.id });
        setSelectedTutor(doc.data()?.issued_by || "");
      },
    );

    return () => {
      unsubscribeTutors();
      unsubscribeAssessments();
    };
  }, [params.assessmentid]);

  function handleSubmit(e) {
    e.preventDefault();

    setDoc(
      doc(db, "student_assessments", params.assessmentid),
      {
        ...assessment,
        issued_by: selectedTutor,
        issued_by_name: tutors.find((t) => t.id === selectedTutor).displayName,
        date: e.target.date.value,
      },
      { merge: true },
    ).then(() => {
      addToast({
        header: "Student Assessment Updated",
        message: "The student assessment has been updated successfully",
      });
      navigate(`/assessments/${params.assessmentid}`);
    });
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Are you sure you want to delete the assessment for ${assessment.student_name}?`,
      )
    ) {
      return;
    }

    if (
      assessment.completed_file !== "" &&
      assessment.completed_file !== undefined
    ) {
      await deleteObject(ref(storage, assessment.completed_file));
    }

    await deleteDoc(doc(db, "student_assessments", params.assessmentid));
    addToast({
      header: "Student Assessment Deleted",
      message: "The student assessment has been deleted successfully",
    });
    navigate(-2);
  }

  function tutorOptions() {
    return tutors.map((tutor) => (
      <option key={tutor.id} value={tutor.id}>
        {tutor.displayName}
      </option>
    ));
  }

  function assessmentQuestions() {
    if (!assessment?.questions) return;

    let questionsWithScores = Object.entries(assessment.questions).map((q) => ({
      ...q[1],
      num: q[0],
      score: q[1].score || 0,
    }));

    let questionList = questionsWithScores.map((q) => (
      <tr key={q.num}>
        <td>{q.num}</td>
        <td>{q.question}</td>
        <td>{q.sample_answer}</td>
        <td>
          <Form.Control
            as='textarea'
            rows={3}
            value={q.student_answer || ""}
            onChange={(e) =>
              setAssessment({
                ...assessment,
                questions: questionsWithScores.reduce((newq, a) => {
                  return {
                    ...newq,
                    [a.num]: {
                      ...a,
                      student_answer:
                        a.num === q.num ? e.target.value : a.student_answer,
                    },
                  };
                }, {}),
              })
            }
          />
        </td>
        <td>
          <Form.Control
            type='number'
            value={q.score}
            min={0}
            max={5}
            onChange={(e) =>
              setAssessment({
                ...assessment,
                questions: questionsWithScores.reduce((newq, a) => {
                  return {
                    ...newq,
                    [a.num]: {
                      ...a,
                      score:
                        a.num === q.num ? parseInt(e.target.value) : a.score,
                    },
                  };
                }, {}),
              })
            }
          />
        </td>
      </tr>
    ));

    return questionList;
  }
  return (
    <div className='p-3'>
      <div className='display-1'>Edit Student Assessment</div>
      <Card className='bg-light-subtle m-3'>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className='h3'>{assessment.student_name}</div>
            <div className='row my-3'>
              <div className='col'>
                <label className='form-label h5'>Issuer</label>
                <Form.Select
                  id='tutor'
                  className='form-control'
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.val)}
                >
                  <option disabled value=''>
                    Select One
                  </option>
                  {tutorOptions()}
                </Form.Select>
              </div>
              <div className='col'>
                <label className='form-label h5'>Date</label>
                <input
                  id='date'
                  className='form-control'
                  type='date'
                  defaultValue={assessment.date}
                />
              </div>
            </div>
            <hr />
            <div className='h5'>
              Assessment - {grades[assessment.grade]} {assessment.category}
            </div>
            <hr />
            {assessment.questions ? (
              <>
                {/* {selectedAssessment?.file !== '' && selectedAssessment?.file !== undefined ?
                  <Row>
                    <Col className='d-flex flex-column justify-content-center'>
                      <Button href={fileURL} className='' target='_blank' rel='noreferrer'>Download Blank Assessment</Button>
                    </Col>
                    <Col>
                      <Form.Label className='h5'>Upload Completed Assessment</Form.Label>
                      <input id='completed-amt-file' type='file' className='form-control' accept='application/pdf' />
                    </Col>
                  </Row>
                  :
                  <div className='h6 text-center'>No file for the selected assessment</div>
                } */}
                <div className='h3'>Questions</div>
                <Table striped>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Sample Answer</th>
                      <th>Student's Answer</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>{assessmentQuestions()}</tbody>
                </Table>
              </>
            ) : (
              <div className='h6 text-center'>
                No Questions found for the selected Assessment
              </div>
            )}
            <div className='d-flex justify-content-end'>
              <Button
                variant='danger'
                type='button'
                className='m-3'
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button variant='primary' type='submit' className='m-3'>
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentAssessmentEdit;
