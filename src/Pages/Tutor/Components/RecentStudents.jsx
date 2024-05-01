import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../../Services/firebase";

const RecentStudents = ({ tutorid }) => {
  const [recentStudents, setRecentStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const tutorDocRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    tutorDocRef.current = doc(db, "tutors", tutorid);

    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) => {
      getDocs(
        query(
          collection(db, "evaluations"),
          where("tutor_id", "==", doc.id),
          where("draft", "==", false),
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
        setLoading(false);
      });
    });

    return () => unsubscribeTutor();
  }, [tutorid]);

  if (loading) {
    return (
      <Card className='bg-light-subtle m-3 flex-fill'>
        <Card.Header>
          <div className='h3 pt-1'>
            <i className='bi bi-journal-plus pe-2' />
            New Evaluation
          </div>
          <div className='h5'>Recent Students</div>
        </Card.Header>
        <Card.Body>
          <Container className='d-flex justify-content-center'>
            <div className='d-flex flex-column flex-fill'>
              <ul className='list-group flex-fill mb-3 placeholder-wave'>
                {[...Array(5).fill(0)].map((_, index) => (
                  <li
                    key={index}
                    className='list-group-item list-group-item-action d-flex placeholder bg-secondary'
                    style={{
                      height: "4rem",
                    }}
                  ></li>
                ))}
              </ul>
              <Button onClick={() => navigate("/eval/new")}>
                Find another Student
              </Button>
            </div>
          </Container>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className='bg-light-subtle m-3 flex-fill'>
      <Card.Header>
        <div className='h3 pt-1'>
          <i className='bi bi-journal-plus pe-2' />
          New Evaluation
        </div>
        <div className='h5'>Recent Students</div>
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
                  <li
                    key={index}
                    className='list-group-item list-group-item-action d-flex'
                  >
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
                <i className='bi bi-arrow-right ms-2' />
              </Button>
            </div>
          )}
        </Container>
      </Card.Body>
    </Card>
  );
};

export default RecentStudents;
