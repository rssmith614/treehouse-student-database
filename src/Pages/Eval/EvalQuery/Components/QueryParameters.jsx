import React from "react";
import { Card, Row } from "react-bootstrap";
import EvalParameters from "./EvalParameters";
import StudentParameters from "./StudentParameters";
import TutorParameters from "./TutorParameters";

const QueryParameters = ({
  evalConditions,
  setEvalConditions,
  studentConditions,
  setStudentConditions,
  tutors,
  tutorList,
  setTutorList,
}) => {
  return (
    <Card className='bg-light-subtle'>
      <Card.Body>
        <Row>
          <div className='h4'>Evaluation</div>
          <EvalParameters
            evalConditions={evalConditions}
            setEvalConditions={setEvalConditions}
          />
        </Row>
        <hr />
        <Row>
          <div className='h4'>Student</div>
          <StudentParameters
            studentConditions={studentConditions}
            setStudentConditions={setStudentConditions}
          />
        </Row>
        <hr />
        <Row>
          <div className='h4'>Tutor</div>
          <TutorParameters
            tutors={tutors}
            tutorList={tutorList}
            setTutorList={setTutorList}
          />
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QueryParameters;
