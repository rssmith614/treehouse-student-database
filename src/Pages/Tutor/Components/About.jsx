import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import Avatar from "boring-avatars";
import { capitalize } from "lodash";
import { Can } from "../../../Services/can";
import { Tutor } from "../../../Services/defineAbility";
import { useNavigate } from "react-router-dom";

const About = ({ tutor, denyAccess }) => {
  const navigate = useNavigate();

  let tutorInstance = new Tutor(tutor);

  return (
    <Card className='d-flex flex-fill bg-light-subtle justify-content-center m-3'>
      <Card.Header>
        <div className='h3 pt-1'>About</div>
      </Card.Header>
      <Card.Body className='d-flex flex-column justify-content-between'>
        <div className='d-flex flex-column p-3'>
          <Row>
            <Col className='col-md-auto'>
              <Card className='bg-dark p-1'>
                <Avatar
                  size={100}
                  name={tutor.displayName + tutor?.seed || ""}
                  square={true}
                  variant='beam'
                  colors={["#ffcc00", "#253550", "#FFFFFF", "#858786", "#000"]}
                />
              </Card>
            </Col>
            <Col>
              <div className='display-4 pt-3'>{tutor?.displayName}</div>
            </Col>
          </Row>
          <Row xs={{ cols: "auto" }}>
            <Col>
              <div className='d-flex flex-column p-3'>
                <div className='h3'>Email</div>
                <div>{tutor?.email}</div>
              </div>
            </Col>
            <Col>
              <div className='d-flex flex-column p-3'>
                <div className='h3'>Role</div>
                <div>{capitalize(tutor?.clearance)}</div>
              </div>
            </Col>
            <Col>
              <div className='d-flex flex-column p-3'>
                <div className='h3'>Preferred Student Ages</div>
                <div>{tutor?.preferredAges || ""}</div>
              </div>
            </Col>
            <Col>
              <div className='d-flex flex-column p-3'>
                <div className='h3'>Preferred Subjects</div>
                <div>{tutor?.preferredSubjects || ""}</div>
              </div>
            </Col>
          </Row>
        </div>
        <div className='d-flex'>
          <Can I='edit' this={tutorInstance}>
            {tutor?.clearance === "pending" ? (
              <Button
                className='btn btn-danger m-3 ms-auto'
                onClick={() => denyAccess(tutor.id)}
              >
                Deny Access Request
              </Button>
            ) : (
              <></>
            )}
            <button
              className='btn btn-info m-3 ms-auto'
              onClick={() => navigate(`/tutor/edit/${tutor.id}`)}
            >
              Make Changes
            </button>
          </Can>
        </div>
      </Card.Body>
    </Card>
  );
};

export default About;
