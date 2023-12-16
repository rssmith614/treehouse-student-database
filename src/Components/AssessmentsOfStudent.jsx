import React, { useState, useEffect } from 'react';
import { db } from '../Services/firebase';
import { Dropdown, Form, Table } from 'react-bootstrap';
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
  const [tutors, setTutors] = useState([]);

  const [dateSort, setDateSort] = useState('desc');
  const [gradeFilter, setGradeFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [issuedByFilter, setIssuedByFilter] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    let queryPredicates = [
      collection(db, 'student_assessments'),
      where('student_id', '==', student.id)
    ];

    if (gradeFilter.length > 0) {
      queryPredicates.push(where('grade', 'in', gradeFilter));
    }

    if (categoryFilter.length > 0) {
      queryPredicates.push(where('category', 'in', categoryFilter));
    }

    if (issuedByFilter.length > 0) {
      queryPredicates.push(where('issued_by', 'in', issuedByFilter));
    }

    const unsubscribe = onSnapshot(
      query.apply(null, queryPredicates),
      (snapshot) => {
        const newAssessments = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setAssessments(newAssessments);
      });

    const unsubscribeTutors = onSnapshot(
      collection(db, 'tutors'),
      (snapshot) => {
        const newTutors = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setTutors(newTutors);
      });

    return () => {
      unsubscribe();
      unsubscribeTutors();
    }
  }, [student, gradeFilter, categoryFilter, issuedByFilter]);

  function filterIcon(column) {
    switch (column) {
      case 'date':
        if (dateSort === 'asc')
          return <i className="bi bi-sort-up ms-auto" />
        else if (dateSort === 'desc')
          return <i className="bi bi-sort-down ms-auto" />
        else
          return <i className="bi bi-filter ms-auto" />

      case 'gradeAndCat':
        if (gradeFilter.length > 0 || categoryFilter.length > 0)
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />

      case 'issuer':
        if (issuedByFilter.length > 0)
          return <i className="bi bi-funnel-fill ms-auto" />
        else
          return <i className="bi bi-funnel ms-auto" />
     
      default:
        return <i className="bi bi-filter ms-auto" />
    }
  }

  const DropdownTableHeaderToggle = React.forwardRef(({children, onClick}, ref) => (
    <div className="d-flex"
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}>
      {children}
    </div>
  )) 

  const tableData = assessments.sort((a, b) => {
    if (dateSort === 'asc')
      return dayjs(a.date).diff(dayjs(b.date))
    else if (dateSort === 'desc')
      return dayjs(b.date).diff(dayjs(a.date))
    else
      return 0;
  })

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th className='w-25'>
            <Dropdown variant="" drop="up">
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Date {filterIcon('date')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setDateSort('desc')}>Newer First</Dropdown.Item>
                <Dropdown.Item onClick={() => setDateSort('asc')}>Older First</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
          <th>
            <Dropdown variant="" drop="up">
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Assessment {filterIcon('gradeAndCat')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setGradeFilter([])}>All Grades</Dropdown.Item>
                {Object.keys(grades).map((grade) => (
                  <Dropdown.Item key={grade}>
                    <Form.Check
                      type="checkbox"
                      label={grades[grade]}
                      checked={gradeFilter.includes(grade)}
                      onChange={() => {
                        if (gradeFilter.includes(grade)) {
                          setGradeFilter(gradeFilter.filter((g) => g !== grade));
                        } else {
                          setGradeFilter([...gradeFilter, grade]);
                        }
                      }}
                    />
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => setCategoryFilter('')}>All Categories</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategoryFilter('Reading')}>
                  <Form.Check
                    type="checkbox"
                    label="Reading"
                    checked={categoryFilter.includes('Reading')}
                    onChange={() => {
                      if (categoryFilter.includes('Reading')) {
                        setCategoryFilter(categoryFilter.filter((c) => c !== 'Reading'));
                      } else {
                        setCategoryFilter([...categoryFilter, 'Reading']);
                      }
                    }}
                  />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setCategoryFilter('Math')}>
                  <Form.Check
                    type="checkbox"
                    label="Math"
                    checked={categoryFilter.includes('Math')}
                    onChange={() => {
                      if (categoryFilter.includes('Math')) {
                        setCategoryFilter(categoryFilter.filter((c) => c !== 'Math'));
                      } else {
                        setCategoryFilter([...categoryFilter, 'Math']);
                      }
                    }}
                  />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
          <th>
            <Dropdown variant="" drop="up">
              <Dropdown.Toggle as={DropdownTableHeaderToggle}>
                Issued By {filterIcon('issuer')}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setIssuedByFilter([])}>All Tutors</Dropdown.Item>
                {tutors.map((tutor) => (
                  <Dropdown.Item key={tutor.id}>
                    <Form.Check
                      type="checkbox"
                      label={`${tutor.displayName}`}
                      checked={issuedByFilter.includes(tutor.id)}
                      onChange={() => {
                        if (issuedByFilter.includes(tutor.id)) {
                          setIssuedByFilter(issuedByFilter.filter((t) => t !== tutor.id));
                        } else {
                          setIssuedByFilter([...issuedByFilter, tutor.id]);
                        }
                      }}
                    />
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((assessment) => (
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