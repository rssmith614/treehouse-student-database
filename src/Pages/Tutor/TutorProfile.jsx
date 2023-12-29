import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../../Services/can";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../Services/firebase";
import EvalsTable from "../../Components/EvalsTable";
import { Button, Card, Col, Nav, Row, Tab } from "react-bootstrap";
import { Tutor } from "../../Services/defineAbility";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});

  const [tab, setTab] = useState(
    localStorage.getItem("tutorProfileTab") || "about",
  );

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, "tutors", params.tutorid));

  useEffect(() => {
    tutorDocRef.current = doc(db, "tutors", params.tutorid);

    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) =>
      setTutor(doc.data()),
    );

    return () => unsubscribeTutor();
  }, [params.tutorid]);

  useEffect(() => {
    localStorage.setItem("tutorProfileTab", tab);
  }, [tab]);

  function deny(id) {
    if (
      !window.confirm(
        `You are about to DENY access to ${tutor.displayName}. Are you sure you want to do this?`,
      )
    ) {
      return;
    }

    deleteDoc(tutorDocRef.current).then(() => navigate("/tutors"));
  }

  function capitalize(str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (e) {
      return "";
    }
  }

  let tutorInstance = new Tutor(tutor);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>Tutor Profile - {tutor?.displayName}</h1>
      <div className='d-flex flex-row justify-content-center'>
        <Card className='d-flex flex-fill bg-light-subtle justify-content-center'>
          <Tab.Container activeKey={tab}>
            <Nav variant='underline' className='card-header'>
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
            </Nav>
            <Tab.Content className='card-body'>
              <Tab.Pane eventKey='about'>
                <div className='d-flex p-3'>
                  <Row xs={{ cols: "auto" }}>
                    {tutor?.photoURL === "" || !tutor?.photoURL ? null : (
                      <Col>
                        <img src={tutor?.photoURL} alt='Tutor' />
                      </Col>
                    )}
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
              </Tab.Pane>
              <Tab.Pane eventKey='evals'>
                <div className='d-flex flex-column'>
                  <EvalsTable filterBy='tutor' id={tutorDocRef.current.id} />
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card>
      </div>
      <div className='d-flex'>
        <Can I='edit' this={tutorInstance}>
          {tutor.clearance === "pending" ? (
            <Button
              className='btn btn-danger m-3'
              onClick={() => deny(tutorDocRef.current.id)}
            >
              Deny Access Request
            </Button>
          ) : (
            <></>
          )}
          <button
            className='btn btn-info m-3 ms-auto'
            onClick={() => navigate(`/tutor/edit/${tutorDocRef.current.id}`)}
          >
            Make Changes
          </button>
        </Can>
      </div>
    </div>
  );
};

export default TutorProfile;
