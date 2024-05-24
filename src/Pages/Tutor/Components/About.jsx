import React, { useEffect, useRef, useState } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import Avatar from "boring-avatars";
import { capitalize } from "lodash";
import { Can } from "../../../Services/can";
import { Tutor } from "../../../Services/defineAbility";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../Services/firebase";

const About = ({ tutorid }) => {
  const [tutor, setTutor] = useState({});

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const tutorDocRef = useRef();

  useEffect(() => {
    tutorDocRef.current = doc(db, "tutors", tutorid);

    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) => {
      setTutor({ id: doc.id, ...doc.data() });
      setLoading(false);
      document
        .getElementById("about-cardbody")
        .classList.remove("placeholder-wave");
    });

    return () => unsubscribeTutor();
  }, [tutorid]);

  async function denyAccess() {
    if (
      !window.confirm(
        `You are about to DENY access to ${tutor.displayName}. Are you sure you want to do this?`,
      )
    ) {
      return;
    }

    await deleteDoc(tutorDocRef.current).then(() => navigate("/tutors"));
  }

  let tutorInstance = new Tutor(tutor);

  return (
    <Card className='d-flex flex-fill bg-light-subtle justify-content-center my-3'>
      <Card.Header>
        <div className='h3 pt-1'>
          <i className='bi bi-info-circle-fill pe-2' />
          About
        </div>
      </Card.Header>
      <Card.Body
        className='d-flex flex-column justify-content-between placeholder-wave'
        id='about-cardbody'
      >
        <div className='d-flex flex-column p-3'>
          <Row>
            <Col className='d-flex'>
              <Card className='bg-dark p-1 align-self-center'>
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
              {loading ? (
                <div className='placeholder display-4 col-6 mt-4' />
              ) : (
                <div className='display-4 pt-3 text-end'>
                  {tutor?.displayName}
                </div>
              )}
            </Col>
          </Row>
          <Card className='mt-3'>
            <Card.Body className='row row-cols-auto'>
              <Col>
                <div className='d-flex flex-column p-3'>
                  <div className='h3'>Email</div>
                  {loading ? (
                    <div className='placeholder' />
                  ) : (
                    <div>{tutor?.email}</div>
                  )}
                </div>
              </Col>
              <Col>
                <div className='d-flex flex-column p-3'>
                  <div className='h3'>Role</div>
                  {loading ? (
                    <div className='placeholder' />
                  ) : (
                    <div>{capitalize(tutor?.clearance)}</div>
                  )}
                </div>
              </Col>
              <Col>
                <div className='d-flex flex-column p-3'>
                  <div className='h3 '>Preferred Student Ages</div>
                  {loading ? (
                    <div className='placeholder' />
                  ) : (
                    <div>{tutor?.preferredAges || ""}</div>
                  )}
                </div>
              </Col>
              <Col>
                <div className='d-flex flex-column p-3'>
                  <div className='h3 '>Preferred Subjects</div>
                  {loading ? (
                    <div className='placeholder' />
                  ) : (
                    <div>{tutor?.preferredSubjects || ""}</div>
                  )}
                </div>
              </Col>
            </Card.Body>
          </Card>
        </div>
        <Row>
          <Can I='edit' this={tutorInstance}>
            {tutor?.clearance === "pending" ? (
              <Button
                className='btn btn-danger m-3 col'
                onClick={() => denyAccess(tutor.id)}
              >
                Deny Access Request
              </Button>
            ) : (
              <></>
            )}
            <button
              className='btn btn-info m-3 col'
              onClick={() => navigate(`/tutor/edit/${tutor.id}`)}
            >
              Make Changes
              <i className='bi bi-pencil-fill ps-2' />
            </button>
          </Can>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default About;
