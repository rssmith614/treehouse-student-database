import React, { useState, useEffect } from 'react';
import { db } from '../Services/firebase';
import { Table } from 'react-bootstrap';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';


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

function AssessmentsOfStudent({ student, setSelectedAssessment }) {
  const [assessments, setAssessments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'student_assessments'),
        where('student_id', '==', student.id)
      ),
      (snapshot) => {
        const newAssessments = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setAssessments(newAssessments);
      });

    return () => unsubscribe();
  }, [student]);

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th>Date</th>
          <th>Assessment</th>
          <th>Issued By</th>
        </tr>
      </thead>
      <tbody>
        {assessments.map((assessment) => (
          <tr key={assessment.id} style={{ cursor: "pointer" }} onClick={() => {navigate(`/assessments/${assessment.id}`)}}>
            <td>{dayjs(assessment.date).format('MMMM DD, YYYY')}</td>
            <td>{grades[assessment.grade]} {assessment.category}</td>
            <td>{assessment.issued_by_name}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default AssessmentsOfStudent;