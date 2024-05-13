import { useEffect, useState } from "react";
import { auth, db } from "../Services/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Button, Offcanvas } from "react-bootstrap";
import dayjs from "dayjs";
import { Can } from "../Services/can";
import { Grade } from "../Services/defineAbility";
import PaginatedTable from "./PaginatedTable";
import StudentGradesEdit from "./StudentGradesEdit";
import StudentGradesDetail from "./StudentGradesDetail";

const StudentGrades = ({ student }) => {
  const [gradesHistory, setGradesHistory] = useState([]);
  const [focusedGradeEntry, setFocusedGradeEntry] = useState({});

  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "grades"), where("student_id", "==", student)),
      (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setGradesHistory(data);
      },
    );

    return () => unsubscribe();
  }, [student]);

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
        student_id: student,
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
        student_id: student,
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
          <td className='align-middle'>
            {dayjs(grade.date).format("MMMM D, YYYY")}
          </td>
          <td className='align-middle'>{grade.tutor_name}</td>
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
      <PaginatedTable
        records={gradesList}
        pageLimit={5}
        header={
          <thead>
            <tr>
              <th>Date</th>
              <th>Recorded By</th>
              <th className='w-50'>Grades</th>
            </tr>
          </thead>
        }
      />

      <div className='d-flex'>
        <Can I='export' on={Grade}>
          <Button variant='secondary' onClick={exportCSV}>
            Export Grades as CSV
          </Button>
        </Can>
        <Button variant='primary' className='ms-auto' onClick={newGrades}>
          Record Grades
        </Button>
      </div>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        onExited={() => {
          setFocusedGradeEntry({});
          setEdit(false);
        }}
        placement='end'
        className='w-75'
      >
        {edit ? (
          <>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Record Grades</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <StudentGradesEdit
                gradeEntry={focusedGradeEntry}
                setGradeEntry={setFocusedGradeEntry}
                setEdit={setEdit}
                setShow={setShow}
              />
            </Offcanvas.Body>
          </>
        ) : (
          <>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>View Grades</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <StudentGradesDetail
                gradeEntry={focusedGradeEntry}
                setEdit={setEdit}
              />
            </Offcanvas.Body>
          </>
        )}
      </Offcanvas>
    </div>
  );
};

export default StudentGrades;
