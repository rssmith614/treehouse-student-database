import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../Services/firebase";
import { Button, Collapse, Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GradesReminder = ({ studentid }) => {
  const [studentName, setStudentName] = useState("");

  const [gradesReminderMessage, setGradesReminderMessage] = useState("");
  const [reminderEligibility, setReminderEligibility] = useState(false);
  const [showGradesReminder, setShowGradesReminder] = useState(false);

  const [gradesTooltip, setGradesTooltip] = useState("");
  const [showGradesTooltip, setShowGradesTooltip] = useState(false);

  const navigate = useNavigate();

  // check if student is eligible for grades reminder
  useEffect(() => {
    getDoc(doc(db, "students", studentid)).then((student) => {
      setStudentName(student.data().student_name);

      setReminderEligibility(student.data().reminders || false);
    });
  }, [studentid]);

  // grades reminder check
  useEffect(() => {
    if (!studentid) return;

    const unsubscribeGrades = onSnapshot(
      query(
        collection(db, "grades"),
        where("student_id", "==", studentid),
        orderBy("date", "desc"),
        limit(1),
      ),
      (gradesSnapshot) => {
        if (gradesSnapshot.docs.length > 0) {
          const grade = gradesSnapshot.docs[0].data();
          if (dayjs(grade.date).isBefore(dayjs().subtract(2, "week"))) {
            if (reminderEligibility) {
              setGradesReminderMessage(
                `${studentName} has not had their class grades updated since ${dayjs(
                  grade.date,
                ).format("MMMM D, YYYY")}.`,
              );
              setGradesTooltip(
                `We keep track of student progress and performance by recording their class grades every two weeks.`,
              );
              setShowGradesReminder(true);
            }
          }
        } else {
          if (reminderEligibility) {
            setGradesReminderMessage(
              `${studentName} has not had their class grades entered yet.`,
            );
            setGradesTooltip(
              "Students in 6th grade and above are expected to have their class grades entered regularly to track progress and performance.",
            );
            setShowGradesReminder(true);
          }
        }
      },
    );

    return () => {
      unsubscribeGrades();
    };
  }, [studentid, reminderEligibility, studentName]);

  return (
    <Modal
      show={showGradesReminder}
      onHide={() => setShowGradesReminder(false)}
    >
      <Modal.Header>
        <Modal.Title>Grades Reminder</Modal.Title>
        <Button
          variant='secondary'
          onClick={() => setShowGradesReminder(false)}
          style={{ "--bs-bg-opacity": "0" }}
        >
          <i className='bi bi-x-lg' />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className='d-flex flex-column'>
          <div>{gradesReminderMessage}</div>
          <hr />
          <div>Please make sure to update their grades before they leave.</div>
          <Button
            variant='link'
            size='sm'
            className='me-auto link-secondary fst-italic'
            style={{ "--bs-btn-padding-x": "0rem" }}
            onClick={() => setShowGradesTooltip(!showGradesTooltip)}
          >
            Why am I seeing this?
          </Button>
          <Collapse in={showGradesTooltip}>
            <div>
              {gradesTooltip}
              <br />
              If you believe this is a mistake or need an exception, please
              contact an administrator.
            </div>
          </Collapse>
        </div>
      </Modal.Body>
      <Modal.Footer className='d-flex'>
        <Button
          variant='secondary'
          size='sm'
          className='me-auto'
          onClick={() => setShowGradesReminder(false)}
        >
          I'll do it later
        </Button>
        <Button
          variant='primary'
          size='sm'
          onClick={() => {
            localStorage.setItem("student_tab", "grades");
            navigate(`/students/${studentid}`);
          }}
        >
          Take me there now
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GradesReminder;
