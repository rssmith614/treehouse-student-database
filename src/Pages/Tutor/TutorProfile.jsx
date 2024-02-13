import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Can } from "../../Services/can";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../Services/firebase";
import EvalsTable from "../../Components/EvalsTable";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Tutor } from "../../Services/defineAbility";
import Avatar from "boring-avatars";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});

  const [recentStudents, setRecentStudents] = useState([]);

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, "tutors", params.tutorid));

  useEffect(() => {
    tutorDocRef.current = doc(db, "tutors", params.tutorid);

    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) => {
      setTutor(doc.data());
      getDocs(
        query(
          collection(db, "evaluations"),
          where("tutor_id", "==", doc.id),
          orderBy("date", "desc"),
        ),
      ).then((querySnapshot) => {
        let students = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          if (
            students.length < 5 &&
            !students.find((student) => student.id === data.student_id)
          ) {
            students.push({ id: data.student_id, name: data.student_name });
          }
        });
        setRecentStudents(students);
      });
    });

    return () => unsubscribeTutor();
  }, [params.tutorid]);

  async function deny(id) {
    if (
      !window.confirm(
        `You are about to DENY access to ${tutor.displayName}. Are you sure you want to do this?`,
      )
    ) {
      return;
    }

    await deleteDoc(tutorDocRef.current).then(() => navigate("/tutors"));
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
      <h1 className='d-flex display-1'>Tutor Profile</h1>
      <div className='d-flex flex-row justify-content-center'>
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
                      colors={[
                        "#ffcc00",
                        "#253550",
                        "#FFFFFF",
                        "#858786",
                        "#000",
                      ]}
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
                    onClick={() => deny(tutorDocRef.current.id)}
                  >
                    Deny Access Request
                  </Button>
                ) : (
                  <></>
                )}
                <button
                  className='btn btn-info m-3 ms-auto'
                  onClick={() =>
                    navigate(`/tutor/edit/${tutorDocRef.current.id}`)
                  }
                >
                  Make Changes
                </button>
              </Can>
            </div>
          </Card.Body>
        </Card>

        <Card className='bg-light-subtle m-3 mw-0'>
          <Card.Header>
            <div className='h3 pt-1'>New Evaluation - Recent Students</div>
          </Card.Header>
          <Card.Body>
            <Container className='d-flex justify-content-center'>
              {recentStudents.length === 0 ? (
                <div className='d-flex flex-column'>
                  <p className='h5'>No recent students</p>
                  <Button onClick={() => navigate("/eval/new")}>
                    Find a Student
                  </Button>
                </div>
              ) : (
                <div className='d-flex flex-column flex-fill'>
                  <ul className='list-group flex-fill mb-3'>
                    {recentStudents.map((student, index) => (
                      <li key={index} className='list-group-item d-flex'>
                        <Button
                          className='flex-fill'
                          onClick={() => navigate(`/eval/new/${student.id}`)}
                          size='lg'
                          variant=''
                        >
                          {student.name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate("/eval/new")}>
                    Find another Student
                  </Button>
                </div>
              )}
            </Container>
          </Card.Body>
        </Card>
      </div>
      <Card className='bg-light-subtle m-3'>
        <Card.Header>
          <div className='h3 pt-1'>Evaluations</div>
        </Card.Header>
        <Card.Body>
          <div className='d-flex flex-column'>
            <EvalsTable
              filterBy='tutor'
              id={tutorDocRef.current.id}
              _limit={10}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TutorProfile;
