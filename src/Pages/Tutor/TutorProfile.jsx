import { useParams } from "react-router-dom";

import About from "./Components/About";
import RecentEvals from "./Components/RecentEvals";
import RecentStudents from "./Components/RecentStudents";
import RecentStudentsNewEval from "./Components/RecentStudentsNewEval";
import { Col, Row } from "react-bootstrap";

const TutorProfile = () => {
  const params = useParams();

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>Tutor Profile</h1>
      <Row className=''>
        <Col className='col-md-8 d-flex'>
          <About tutorid={params.tutorid} />
        </Col>
        <Col className='col-md-4 d-flex'>
          <RecentStudentsNewEval tutorid={params.tutorid} />
        </Col>
      </Row>
      <Row>
        {/* <Col className='col-md-4 d-flex'>
          <RecentStudents tutorid={params.tutorid} />
        </Col> */}
        <Col className=' d-flex'>
          <RecentEvals tutorid={params.tutorid} />
        </Col>
      </Row>
    </div>
  );
};

export default TutorProfile;
