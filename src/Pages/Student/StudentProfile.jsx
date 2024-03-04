import { doc, onSnapshot } from "firebase/firestore";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";

import { Button, Nav, Tab } from "react-bootstrap";
import EvalsTable from "../../Components/EvalsTable";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import AssessmentsOfStudent from "../../Components/AssessmentsOfStudent";
import StandardsOfCategoryAndStatus from "../../Components/StandardsOfCategoryAndStatus";
import StudentGrades from "../../Components/StudentGrades";
import About from "./Components/About";
dayjs.extend(duration);
dayjs.extend(relativeTime);

const StudentProfile = () => {
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState(
    localStorage.getItem("student_tab") || "about",
  );

  const studentRef = useRef();

  const navigate = useNavigate();

  const params = useParams();

  studentRef.current = doc(db, "students", params.studentid);

  useEffect(() => {
    const unsubscribe = onSnapshot(studentRef.current, (s) => {
      setStudent({ ...s.data(), id: s.id });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.studentid]);

  useEffect(() => {
    localStorage.setItem("student_tab", tab);
  }, [tab]);

  const innerContent = (
    <Tab.Container defaultActiveKey={tab}>
      <div className='card-header'>
        <Nav variant='underline' activeKey={tab}>
          <Nav.Item>
            <Nav.Link
              data-bs-toggle='tab'
              eventKey='about'
              onClick={() => setTab("about")}
            >
              About
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              data-bs-toggle='tab'
              eventKey='evals'
              onClick={() => setTab("evals")}
            >
              Evaluations
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              data-bs-toggle='tab'
              eventKey='standards'
              onClick={() => setTab("standards")}
            >
              Standards
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              data-bs-toggle='tab'
              eventKey='assessments'
              onClick={() => setTab("assessments")}
            >
              Assessments
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              data-bs-toggle='tab'
              eventKey='grades'
              onClick={() => setTab("grades")}
            >
              Grades
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
      <Tab.Content className='card-body'>
        <Tab.Pane eventKey='about'>
          <About student={student} loading={loading} />
        </Tab.Pane>
        <Tab.Pane eventKey='evals'>
          <div className='d-flex flex-column'>
            <EvalsTable
              filterBy='student'
              id={studentRef.current.id}
              _limit={10}
            />
            <button
              className='btn btn-primary my-3 align-self-end'
              onClick={() => navigate(`/eval/new/${studentRef.current.id}`)}
            >
              New Session Eval
            </button>
          </div>
        </Tab.Pane>
        <Tab.Pane eventKey='standards'>
          <StandardsOfCategoryAndStatus student={studentRef.current} />
        </Tab.Pane>
        <Tab.Pane eventKey='assessments'>
          <AssessmentsOfStudent
            student={studentRef.current}
            setSelectedAssessment={() => {}}
          />
          <div className='d-flex justify-content-end'>
            <button
              className='btn btn-primary m-3'
              onClick={() =>
                navigate(`/assessments/new/${studentRef.current.id}`)
              }
            >
              Issue New Assessment
            </button>
          </div>
        </Tab.Pane>
        <Tab.Pane eventKey='grades'>
          <StudentGrades student={studentRef.current.id} />
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Student Profile - {student.student_name}
      </h1>
      <div className='d-flex '>
        <div className='d-flex m-3 card bg-light-subtle flex-fill'>
          {innerContent}
        </div>
      </div>
      <Button
        variant='secondary'
        className='m-3 align-self-start'
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
    </div>
  );
};

export default StudentProfile;
