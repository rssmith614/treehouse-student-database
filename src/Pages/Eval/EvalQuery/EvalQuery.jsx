import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { db, storage } from "../../../Services/firebase";

import dayjs from "dayjs";
import { getDownloadURL, ref } from "firebase/storage";
import { ToastContext } from "../../../Services/toast";
import QueryParameters from "./Components/QueryParameters";
import QueryResults from "./Components/QueryResults";

const EvalQuery = () => {
  const [evalConditions, setEvalConditions] = useState(
    localStorage.getItem("evalConditions")
      ? JSON.parse(localStorage.getItem("evalConditions"))
      : [],
  );
  const [studentConditions, setStudentConditions] = useState(
    localStorage.getItem("studentConditions")
      ? JSON.parse(localStorage.getItem("studentConditions"))
      : [],
  );
  const [tutorList, setTutorList] = useState(
    localStorage.getItem("tutorList")
      ? JSON.parse(localStorage.getItem("tutorList"))
      : [],
  );

  const [tutors, setTutors] = useState([]);

  const [evals, setEvals] = useState(
    localStorage.getItem("evalQueryResults")
      ? JSON.parse(localStorage.getItem("evalQueryResults"))
      : [],
  );

  const addToast = useContext(ToastContext);

  useEffect(() => {
    const unsubscribeTutors = onSnapshot(
      collection(db, "tutors"),
      (snapshot) => {
        setTutors(snapshot.docs.map((doc) => doc.data()));
      },
    );

    return () => {
      unsubscribeTutors();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("evalConditions", JSON.stringify(evalConditions));
  }, [evalConditions]);

  useEffect(() => {
    localStorage.setItem(
      "studentConditions",
      JSON.stringify(studentConditions),
    );
  }, [studentConditions]);

  useEffect(() => {
    localStorage.setItem("tutorList", JSON.stringify(tutorList));
  }, [tutorList]);

  async function sendit(e) {
    localStorage.setItem("queryTimestamp", dayjs());
    // Validate non-empty conditions
    if (
      evalConditions.length === 0 &&
      studentConditions.length === 0 &&
      (tutorList.length === 0 || tutorList.length === tutors.length)
    ) {
      if (!window.confirm("Query ALL evaluations from the database?")) {
        return;
      }
    }

    e.target.setAttribute("disabled", true);
    e.target.innerHTML =
      "Loading... <Spinner className='ms-2' animation='border' size='sm' />";

    // Get evals

    let evalQueryConditions = evalConditions.map((condition) => {
      return where(condition.name, condition.condition, condition.value);
    });

    // Get students

    if (studentConditions.length !== 0) {
      let studentQueryConditions = studentConditions.map((condition) => {
        return where(condition.name, condition.condition, condition.value);
      });

      let studentCandidates = (
        await getDocs(
          query.apply(null, [
            collection(db, "students"),
            ...studentQueryConditions,
          ]),
        )
      ).docs.map((doc) => doc.id);

      if (studentCandidates.length > 0) {
        evalQueryConditions.push(where("student_id", "in", studentCandidates));
      } else {
        setEvals([]);
        addToast({
          header: "Query Complete",
          message: (
            <>
              0 Results
              <br />
              No students match the given conditions
            </>
          ),
        });
        e.target.removeAttribute("disabled");
        e.target.innerHTML = "Query!";
        localStorage.setItem("evalQueryResults", JSON.stringify([]));
        return;
      }
    }

    if (tutorList.length > 0) {
      evalQueryConditions.push(
        where(
          "tutor_id",
          "in",
          tutorList.map((t) => t.uid),
        ),
      );
    }

    try {
      getDocs(
        query.apply(null, [
          collection(db, "evaluations"),
          where("draft", "==", false),
          ...evalQueryConditions,
        ]),
      ).then(async (snapshot) => {
        let tempEvals = snapshot.docs.map(async (evaluation) => {
          let evalData = { ...evaluation.data(), id: evaluation.id };
          let tasksSnapshot = await getDocs(
            collection(evaluation.ref, "tasks"),
          );
          let tasksCount = tasksSnapshot.size;
          let tasks = tasksSnapshot.docs.map((task) => {
            return { ...task.data(), id: task.id };
          });
          return { ...evalData, tasks: tasks, tasksCount };
        });
        Promise.all(tempEvals).then((evaluations) => {
          addToast({
            header: "Query Complete",
            message: `${evaluations.length} result${
              evaluations.length === 1 ? "" : "s"
            }`,
          });
          setEvals(evaluations);
          e.target.removeAttribute("disabled");
          e.target.innerHTML = "Query!";
          localStorage.setItem("evalQueryResults", JSON.stringify(evaluations));
        });
      });
    } catch (err) {
      addToast({
        header: "Query Error",
        message: err.message,
      });
      e.target.removeAttribute("disabled");
      e.target.innerHTML = "Query!";
    }
  }

  async function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += `Date,Student,Tutor,Worksheet Link,Worksheet Completion, Next Session Plans,Standards,Progression,Engagement,Comments\n`;

    let exportData = Promise.all(
      evals.map(async (evaluation) => {
        let worksheetDownloadUrl = "";
        if (evaluation.worksheet !== "") {
          try {
            worksheetDownloadUrl = await getDownloadURL(
              ref(storage, evaluation.worksheet),
            );
          } catch (err) {
            worksheetDownloadUrl = evaluation.worksheet;
          }
        }

        return Promise.all(
          evaluation.tasks.map(async (task) => {
            if (task.standards) {
              return {
                ...task,
                standards: await Promise.all(
                  task.standards.map(async (standard) => {
                    return (
                      (
                        await getDoc(
                          doc(db, "standards", standard?.id || standard),
                        )
                      ).data().key || ""
                    );
                  }),
                ).then((standards) => {
                  return `"${standards.join(", ")}"`;
                }),
                progression: `"${task.standards
                  .map((standard) => {
                    return standard.progression;
                  })
                  .join(", ")}"`,
              };
            } else {
              return { ...task, standards: "" };
            }
          }),
        ).then((tasks) => {
          return {
            ...evaluation,
            tasks: tasks.map((task) => {
              return {
                date: evaluation.date,
                student: evaluation.student_name,
                tutor: evaluation.tutor_name,
                worksheet: `"${worksheetDownloadUrl}"`,
                worksheet_completion: `"${evaluation.worksheet_completion}"`,
                next_session: `"${evaluation.next_session}"`,
                // subject: task.subject,
                standards: task.standards,
                progression: task?.progression,
                engagement: task.engagement,
                comments: `"${task.comments}"`,
              };
            }),
          };
        });
      }),
    );

    (await exportData).forEach((evaluation) => {
      evaluation.tasks.forEach((task) => {
        csvContent += `${task.date},${task.student},${task.tutor},${task.worksheet},${task.worksheet_completion},${task.next_session},${task.standards},${task.progression},${task.engagement},${task.comments}\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `eval-task-export-${dayjs().format("YYYY-MM-DD-HH-mm-ss")}.csv`,
    );
    document.body.appendChild(link); // Required for FF

    link.click();
  }

  return (
    <div className='p-3'>
      <div className='display-1'>Evaluation Query Tool</div>

      <QueryParameters
        evalConditions={evalConditions}
        setEvalConditions={setEvalConditions}
        studentConditions={studentConditions}
        setStudentConditions={setStudentConditions}
        tutors={tutors}
        tutorList={tutorList}
        setTutorList={setTutorList}
      />

      <div className='d-flex py-3'>
        <Button
          id='query'
          variant='primary'
          className='me-auto'
          onClick={sendit}
        >
          Query!
        </Button>
        <Button
          variant='secondary'
          className='ms-auto'
          onClick={() => {
            setEvalConditions([]);
            setStudentConditions([]);
            setTutorList([]);
          }}
        >
          Reset Conditions
        </Button>
      </div>

      <QueryResults results={evals} />
      <div className='d-flex pt-3'>
        <Button
          variant='secondary'
          onClick={() => {
            setEvals([]);
            localStorage.removeItem("evalQueryResults");
            localStorage.removeItem("queryTimestamp");
          }}
        >
          Clear
        </Button>
        <Button variant='primary' className='ms-auto' onClick={exportCSV}>
          Export Query Results
        </Button>
      </div>
    </div>
  );
};

export default EvalQuery;
