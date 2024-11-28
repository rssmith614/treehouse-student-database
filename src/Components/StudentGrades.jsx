import { useEffect, useState } from "react";
import { auth, db } from "../Services/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Popover,
  Tooltip,
} from "react-bootstrap";
import dayjs from "dayjs";
import { AbilityContext, Can } from "../Services/can";
import { Grade, Student } from "../Services/defineAbility";
import PaginatedTable from "./PaginatedTable";
import StudentGradesEdit from "./StudentGradesEdit";
import StudentGradesDetail from "./StudentGradesDetail";
import { useMediaQuery } from "react-responsive";
import { useAbility } from "@casl/react";

const StudentGrades = ({ studentid }) => {
  const [student, setStudent] = useState({});

  const [gradesHistory, setGradesHistory] = useState([]);
  const [focusedGradeEntry, setFocusedGradeEntry] = useState({});

  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);

  const ability = useAbility(AbilityContext);

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "grades"), where("student_id", "==", studentid)),
      (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setGradesHistory(data);
      },
    );

    return () => unsubscribe();
  }, [studentid]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "students", studentid), (s) => {
      setStudent({ ...s.data(), id: s.id });
    });

    return () => unsubscribe();
  }, [studentid]);

  function exportCSV(e) {
    e.preventDefault();

    const csv = [
      "Date,Recorded By,Subject,Grade,Comments",
      ...gradesHistory.map((grade) => {
        return grade.grades
          .map((g) => {
            return `"${dayjs(grade.date).format("MMMM D, YYYY")}","${grade.tutor_name}","${g.subject}","${g.grade}","${g.comments}"`;
          })
          .join("\n");
      }),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades_export_${student.student_name}_${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function newGrades(e) {
    e.preventDefault();

    if (gradesHistory.length > 0) {
      setFocusedGradeEntry({
        date: dayjs().format("YYYY-MM-DD"),
        student_id: studentid,
        tutor_id: auth.currentUser.uid,
        tutor_name: (
          await getDoc(doc(db, "tutors", auth.currentUser.uid))
        ).data().displayName,
        grades: gradesHistory[0].grades.map((grade) => {
          return {
            subject: grade.subject,
            grade: "",
            comments: "",
          };
        }),
      });
    } else {
      setFocusedGradeEntry({
        date: dayjs().format("YYYY-MM-DD"),
        student_id: studentid,
        tutor_id: auth.currentUser.uid,
        tutor_name: (
          await getDoc(doc(db, "tutors", auth.currentUser.uid))
        ).data().displayName,
        grades: [
          {
            subject: "",
            grade: "",
            comments: "",
          },
        ],
      });
    }

    setShow(true);
    setEdit(true);
  }

  const gradesList = gradesHistory
    .sort((a, b) => {
      return dayjs(b.date).diff(dayjs(a.date));
    })
    .map((grade, histIndex) => {
      return (
        <tr
          key={grade.id}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            setFocusedGradeEntry(grade);
            setShow(true);
          }}
        >
          <td className=''>{dayjs(grade.date).format("MMMM D, YYYY")}</td>
          {isDesktop && <td className=''>{grade.tutor_name}</td>}
          <td>
            <ul className='list-group'>
              {grade.grades.map((currGrade, index) => {
                let trend = "";
                for (let i = histIndex; i < gradesHistory.length - 1; i++) {
                  let prevGrade = gradesHistory[i + 1].grades.find(
                    (g) => g.subject === currGrade.subject,
                  );
                  if (prevGrade) {
                    if (
                      parseFloat(currGrade.grade) > parseFloat(prevGrade.grade)
                    ) {
                      if (
                        parseFloat(currGrade.grade) -
                          parseFloat(prevGrade.grade) >=
                        10
                      ) {
                        trend = "bi-chevron-double-up text-success";
                      } else {
                        trend = "bi-chevron-up text-success";
                      }
                    } else if (
                      parseFloat(currGrade.grade) < parseFloat(prevGrade.grade)
                    ) {
                      if (
                        parseFloat(prevGrade.grade) -
                          parseFloat(currGrade.grade) >=
                        10
                      ) {
                        trend = "bi-chevron-double-down text-danger";
                      } else {
                        trend = "bi-chevron-down text-danger";
                      }
                    }
                    break;
                  }
                }
                return (
                  <li key={index} className='list-group-item'>
                    <div className='d-flex'>
                      <div>
                        <strong>{currGrade.subject}</strong> - {currGrade.grade}
                        %{" "}
                      </div>
                      <i className={`bi ${trend} ms-2`} />
                    </div>

                    {currGrade.comments}
                  </li>
                );
              })}
            </ul>
          </td>
        </tr>
      );
    });

  return (
    <div className='d-flex flex-column'>
      {ability.cannot("update", new Student(student)) ? (
        <OverlayTrigger
          placement='top'
          trigger={["hover", "focus"]}
          overlay={
            <Tooltip>
              Remiders for this student are currently{" "}
              {student.reminders ? "enabled" : "disabled"}. Contact an
              administrator to change this setting.
            </Tooltip>
          }
        >
          <div className='ms-auto'>
            <Form.Switch
              label='Allow Grade Entry Reminders'
              reverse
              className='mb-3'
              checked={student?.reminders || false}
              disabled
              readOnly
            />
          </div>
        </OverlayTrigger>
      ) : (
        <Form.Switch
          label='Allow Grade Entry Reminders'
          reverse
          className='mb-3'
          checked={student?.reminders || false}
          onChange={(e) => {
            setDoc(
              doc(db, "students", studentid),
              {
                reminders: e.target.checked,
              },
              { merge: true },
            );
          }}
        />
      )}
      <PaginatedTable
        records={gradesList}
        pageLimit={5}
        header={
          <>
            <col style={{ width: "20%" }} />
            {isDesktop && <col style={{ width: "20%" }} />}
            <col style={{ width: "60%" }} />
            <thead>
              <tr>
                <th>Date</th>
                {isDesktop && <th>Recorded By</th>}
                <th>Grades</th>
              </tr>
            </thead>
          </>
        }
      />

      <div className='d-flex'>
        <Can I='export' on={Grade}>
          <Button variant='secondary' onClick={exportCSV}>
            Export Grades as CSV
          </Button>
        </Can>
        <Can I='create' a={Grade}>
          <Button variant='primary' className='ms-auto' onClick={newGrades}>
            Record Grades
          </Button>
        </Can>
      </div>

      <Modal
        show={show}
        onHide={() => setShow(false)}
        onExited={() => {
          setFocusedGradeEntry({});
          setEdit(false);
        }}
        size='lg'
        centered
      >
        {edit ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Record Grades</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <StudentGradesEdit
                gradeEntry={focusedGradeEntry}
                setGradeEntry={setFocusedGradeEntry}
                setEdit={setEdit}
                setShow={setShow}
              />
            </Modal.Body>
          </>
        ) : (
          <>
            <Modal.Header closeButton>
              <Modal.Title>View Grades</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <StudentGradesDetail
                gradeEntry={focusedGradeEntry}
                setEdit={setEdit}
              />
            </Modal.Body>
          </>
        )}
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StudentGrades;
