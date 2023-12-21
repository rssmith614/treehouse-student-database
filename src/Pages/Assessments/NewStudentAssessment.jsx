import { addDoc, collection, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db, storage } from '../../Services/firebase';
import dayjs from 'dayjs';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';


const grades = {
  'K': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
}


const NewStudentAssessment = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);
  const [assessments, setAssessments] = useState({}); // {grade: [assessments]

  const [selectedTutor, setSelectedTutor] = useState(auth.currentUser?.uid || '');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState({});

  const [fileURL, setFileURL] = useState('');

  const params = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeStudent = onSnapshot(
      doc(db, 'students', params.studentid),
      (doc) => {
        setStudent({ ...doc.data(), id: doc.id });
      })

    const unsubscribeTutors = onSnapshot(
      collection(db, 'tutors'),
      (snapshot) => {
        const newTutors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setTutors(newTutors);
      })

    const unsubscribeAssessments = onSnapshot(
      collection(db, 'assessments'),
      res => {
        let assessmentGroups = {};
        res.docs.forEach(amt => {
          if (assessmentGroups[amt.data().grade]) {
            assessmentGroups[amt.data().grade].push({ ...amt.data(), id: amt.id });
          } else {
            assessmentGroups[amt.data().grade] = [{ ...amt.data(), id: amt.id }];
          }
        })
        setAssessments(assessmentGroups);
      })

    return () => {
      unsubscribeStudent();
      unsubscribeTutors();
      unsubscribeAssessments();
    }

  }, [params.studentid])

  useEffect(() => {
    if (selectedGrade === '' || selectedCategory === '') return;
    let newAssessment = assessments[selectedGrade].find((amt) => amt.category === selectedCategory);

    if (newAssessment.questions !== undefined) {
      newAssessment.questions = Object.entries(newAssessment.questions).reduce((newq, q) => { return {...newq, [q[0]]: {...q[1], score: 0, student_answer: ''}} }, {});
    }

    if (!newAssessment) return setSelectedCategory('');

    if (newAssessment?.file === '' || !newAssessment?.file) return setSelectedAssessment(newAssessment);

    getDownloadURL(ref(storage, newAssessment?.file))
      .then((url) => {
        setSelectedAssessment(newAssessment);
        setFileURL(url);
      })

  }, [selectedGrade, selectedCategory, assessments])

  function handleSubmit(e) {
    e.preventDefault();

    const completedAssessmentFile = document.getElementById('completed-amt-file').files[0];

    if (completedAssessmentFile) {
      const completedAssessmentRef = ref(storage, `student_assessments/${student.id}/${completedAssessmentFile.name}`);
      uploadBytes(completedAssessmentRef, completedAssessmentFile)
        .then(() => {
          addDoc(collection(db, 'student_assessments'),
            {...selectedAssessment,
              student_id: student.id,
              student_name: student.student_name,
              issued_by: selectedTutor,
              issued_by_name: tutors.find((t) => t.id === selectedTutor).displayName,
              date: document.getElementById('date').value,
              completed_file: completedAssessmentRef.fullPath
            })
            .then(() => navigate(`/students/${student.id}`))
        })
    } else {
      addDoc(collection(db, 'student_assessments'),
        {...selectedAssessment,
          student_id: student.id,
          student_name: student.student_name,
          issued_by: selectedTutor,
          issued_by_name: tutors.find((t) => t.id === selectedTutor).displayName,
          date: document.getElementById('date').value,
          completed_file: ''
        })
        .then(() => navigate(`/students/${student.id}`))
    }
    
    // console.log(selectedAssessment);
  }

  function tutorOptions() {
    return tutors.map((tutor) => (
      <option key={tutor.id} value={tutor.id}>{tutor.displayName}</option>
    ));
  }

  function gradeOptions() {
    return Object.entries(assessments).map(([grade, assessments]) => (
      <option key={grade} value={grade}>{grades[grade]}</option>
    ));
  }

  function categoryOptions() {
    if (selectedGrade === '') return;
    return assessments[selectedGrade].map((assessment) => (
      <option key={`${assessment.grade}:${assessment.category}`} value={assessment.category}>{assessment.category}</option>
    ));
  }

  function assessmentQuestions() {
    if (selectedGrade === '' || selectedCategory === '' || !selectedAssessment?.questions) return;

    let questionsWithScores = Object.entries(selectedAssessment.questions).map((q) => ({...q[1], num: q[0], score: q[1].score || 0}));

    let questionList = questionsWithScores.map((q) => (
      <tr key={q.num}>
        <td>{q.num}</td>
        <td>{q.question}</td>
        <td>{q.sample_answer}</td>
        <td>
          <Form.Control as='textarea' rows={3} value={q.student_answer || ''}
            onChange={(e) => setSelectedAssessment({...selectedAssessment, questions: questionsWithScores.reduce((newq, a) => {
              return {...newq, [a.num]: {...a, student_answer: a.num === q.num ? e.target.value : a.student_answer}}
            }, {})})}/>
        </td>
        <td>
          <Form.Control type='number' value={q.score} min={0} max={5}
            onChange={(e) => setSelectedAssessment({...selectedAssessment, questions: questionsWithScores.reduce((newq, a) => {
              return {...newq, [a.num]: {...a, score: a.num === q.num ? parseInt(e.target.value) : a.score}}
            }, {})})}/>
        </td>
      </tr>
    ));

    return questionList;
  }

  return (
    <div className='p-3'>
      <div className='display-1'>New Student Assessment</div>
      <Card className='bg-light-subtle m-3'>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className='h3'>{student.student_name}</div>
            <div className="row my-3">
              <div className="col">
                <label className="form-label h5">Issuer</label>
                <Form.Select id="tutor" className="form-control"
                  value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.val)}>
                  <option disabled value="">Select One</option>
                  {tutorOptions()}
                </Form.Select>
              </div>
              <div className="col">
                <label className="form-label h5">Date</label>
                <input id="date" className="form-control" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} />
              </div>
            </div>
            <Form.Label className='h3'>Assessment</Form.Label>
            <Row className="mb-3">
              <Col>
                <Form.Label className='h5'>Grade</Form.Label>
                <Form.Select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
                  <option disabled value="">Select One</option>
                  {gradeOptions()}
                </Form.Select>
              </Col>
              <Col>
                <Form.Label className='h5'>Category</Form.Label>
                <Form.Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option disabled value="">Select One</option>
                  {categoryOptions()}
                </Form.Select>
              </Col>
            </Row>
            <hr />
            {selectedGrade !== '' && selectedCategory !== '' ?
              <>
                {selectedAssessment?.file !== '' && selectedAssessment?.file !== undefined ?
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
                }
                <div className='h3'>Questions</div>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>Sample Answer</th>
                      <th>Student's Answer</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentQuestions()}
                  </tbody>
                </Table>
              </>
              :
              <div className='h6 text-center'>Select a grade and category to view the assessment</div>}
            <div className='d-flex justify-content-end'>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default NewStudentAssessment;
