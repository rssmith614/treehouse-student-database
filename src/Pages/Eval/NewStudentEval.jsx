import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";
import { ref, uploadBytes } from "firebase/storage";
import {
  Button,
  Card,
  Collapse,
  Modal,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { auth, db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import EvalFooter from "./Components/EvalFooter";
import EvalHeader from "./Components/EvalHeader";
import Tasks from "./Components/Tasks";

const NewStudentEval = () => {
  const [standards, setStandards] = useState([]);

  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);
  const [notesIndex, setNotesIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const [gradesReminderMessage, setGradesReminderMessage] = useState("");
  const [studentOverElementary, setStudentOverElementary] = useState(false);
  const [showGradesReminder, setShowGradesReminder] = useState(false);

  const [gradesTooltip, setGradesTooltip] = useState("");
  const [showGradesTooltip, setShowGradesTooltip] = useState(false);

  const addToast = useContext(ToastContext);

  const params = useParams();

  const [evaluation, setEvaluation] = useState({});

  const [tasks, setTasks] = useState([]);

  const studentRef = useRef(doc(db, "students", params.studentid));

  const hasCache = useRef(false);

  const navigate = useNavigate();

  // used to reset the form and ensure clean data is always submitted
  // in the event of unexpected behavior
  const blankEval = {
    student_id: params.studentid,
    student_name: "",
    tutor_id: auth.currentUser?.uid || "",
    tutor_name: "",
    date: dayjs().format("YYYY-MM-DD"),
    worksheet: "",
    worksheet_completion: "",
    next_session: "",
    owner: auth.currentUser?.uid || "",
  };

  const blankTask = {
    subject: "",
    standards: [],
    progression: "",
    engagement: "",
    comments: "",
  };

  // scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      doc(db, "students", params.studentid),
      (doc) => {
        setEvaluation((prev) => {
          return {
            ...prev,
            student_name: doc.data().student_name,
            student_id: doc.id,
          };
        });
        setLoading(false);
      },
    );

    return () => {
      unsubscribeStudents();
    };
  }, [params.studentid]);

  useEffect(() => {
    getDoc(studentRef.current).then((student) => {
      if (parseInt(student.data().student_grade) >= 6) {
        setStudentOverElementary(true);
      } else {
        setStudentOverElementary(false);
      }
    });
  }, [studentRef]);

  useEffect(() => {
    if (!evaluation.student_id || !evaluation.student_name) return;

    const unsubscribeGrades = onSnapshot(
      query(
        collection(db, "grades"),
        where("student_id", "==", evaluation.student_id),
        orderBy("date", "desc"),
        limit(1),
      ),
      (gradesSnapshot) => {
        if (gradesSnapshot.docs.length > 0) {
          const grade = gradesSnapshot.docs[0].data();
          if (dayjs(grade.date).isBefore(dayjs().subtract(2, "week"))) {
            setGradesReminderMessage(
              `${evaluation.student_name} has not had their class grades updated since ${dayjs(
                grade.date,
              ).format("MMMM D, YYYY")}.`,
            );
            setGradesTooltip(
              `We keep track of student progress and performance by recording their class grades every two weeks.`,
            );
            setShowGradesReminder(true);
          }
        } else {
          if (studentOverElementary) {
            setGradesReminderMessage(
              `${evaluation.student_name} has not had their class grades entered yet.`,
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
  }, [evaluation.student_id, evaluation.student_name, studentOverElementary]);

  useEffect(() => {
    if (evaluation.tutor_id) {
      getDoc(doc(db, "tutors", evaluation.tutor_id)).then((tutor) => {
        setEvaluation((prev) => {
          return {
            ...prev,
            tutor_name: tutor.data().displayName,
          };
        });
      });
    }
  }, [evaluation.tutor_id]);

  useEffect(() => {
    if (localStorage.getItem(`${params.studentid}_eval`)) {
      setEvaluation(
        JSON.parse(localStorage.getItem(`${params.studentid}_eval`)),
      );
      hasCache.current = true;
    } else {
      setEvaluation({
        tutor_id: auth.currentUser?.uid || "",
        tutor_name: "",
        date: dayjs().format("YYYY-MM-DD"),
        worksheet: "",
        worksheet_completion: "",
        next_session: "",
      });
    }

    if (localStorage.getItem(`${params.studentid}_tasks`)) {
      setTasks(JSON.parse(localStorage.getItem(`${params.studentid}_tasks`)));
      hasCache.current = true;
    } else {
      setTasks([
        {
          subject: "",
          standards: [],
          progression: "",
          engagement: "",
          comments: "",
        },
      ]);
    }

    if (hasCache.current) {
      addToast({
        header: "Session Restored",
        message: "Your previously started session evaluation has been restored",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.studentid]);

  useEffect(() => {
    const evalsQuery = query(
      collection(db, "evaluations"),
      where("student_id", "==", params.studentid),
      orderBy("date", "desc"),
      limit(5),
    );

    const unsubscribeEvals = onSnapshot(evalsQuery, (evalsSnapshot) => {
      const notesArray = evalsSnapshot.docs.map((e) => {
        return {
          tutor: e.data().tutor_name,
          date: e.data().date,
          notes: e.data().next_session,
          id: e.id,
        };
      });

      setNotes(notesArray);

      const fetchTasksPromises = evalsSnapshot.docs.map(async (evaluation) => {
        return getDocs(collection(evaluation.ref, "tasks")).then(
          (tasksSnapshot) => {
            const tasks = tasksSnapshot.docs.map((doc) => {
              return {
                ...doc.data(),
                id: doc.id,
              };
            });

            const fetchStandardsPromises = tasks.map((task) => {
              const standardsPromises =
                task.standards?.map(async (standard) => {
                  if (standard === "") return Promise.resolve(null);
                  return getDoc(
                    doc(db, "standards", standard?.id || standard),
                  ).then((sdata) => {
                    return {
                      ...sdata.data(),
                      id: sdata.id,
                    };
                  });
                }) || [];
              return Promise.all(standardsPromises);
            });

            return Promise.all(fetchStandardsPromises);
          },
        );
      });

      Promise.all(fetchTasksPromises).then((standardsArray) => {
        const flattenedStandards = standardsArray
          .flat()
          .flat()
          .filter((s) => s !== null);
        const uniqueStandards = flattenedStandards.reduce((acc, standard) => {
          const existingStandard = acc.find((s) => s.key === standard.key);
          if (!existingStandard) {
            acc.push(standard);
          }
          return acc;
        }, []);
        // console.log(uniqueStandards);
        setStandards(uniqueStandards);
      });
    });

    return () => {
      unsubscribeEvals();
    };
  }, [params.studentid]);

  useEffect(() => {
    for (let i = 0; i < tasks.length; i++) {
      if (
        tasks[i].standards.length < 1 &&
        tasks[i].progression !== "" &&
        tasks[i].progression <= 2
      ) {
        document.getElementById("flagForReview").classList.remove("d-none");
        return;
      }
      if (tasks[i].engagement !== "" && tasks[i].engagement <= 2) {
        document.getElementById("flagForReview").classList.remove("d-none");
        return;
      }
      for (let j = 0; j < tasks[i].standards.length; j++) {
        if (
          tasks[i].standards[j].progression &&
          tasks[i].standards[j].progression <= 2
        ) {
          document.getElementById("flagForReview").classList.remove("d-none");
          return;
        }
      }
    }

    document.getElementById("flagForReview").classList.add("d-none");
  }, [tasks]);

  function handleEvalChange(newEval) {
    setEvaluation(newEval);
    localStorage.setItem(`${params.studentid}_eval`, JSON.stringify(newEval));
  }

  function handleTasksChange(newTasks) {
    setTasks(newTasks);
    localStorage.setItem(`${params.studentid}_tasks`, JSON.stringify(newTasks));
  }

  function sumbitEval(e) {
    e.preventDefault();

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }
    let clean = true;

    if (!evaluation.tutor_id) {
      document.getElementById("tutor").classList.add("is-invalid");
      clean = false;
    }

    if (evaluation.date === "") {
      document.getElementById("date").classList.add("is-invalid");
      clean = false;
    }

    tasks.forEach((t, task_i) => {
      if (t.comments === "") {
        document
          .getElementById(`${task_i}_comments`)
          .classList.add(`is-invalid`);
        clean = false;
      }
      t.standards.forEach((s, standard_i) => {
        if (s.key === "") {
          document
            .getElementById(`${task_i}_${standard_i}_standard`)
            .classList.add(`is-invalid`);
          clean = false;
        }
        if (s.progression === "") {
          document
            .getElementById(`${task_i}_${standard_i}_progression`)
            .classList.add(`is-invalid`);
          clean = false;
        }
      });
      if (t.standards.length === 0) {
        if (t.progression === "") {
          document
            .getElementById(`${task_i}_progression`)
            .classList.add("is-invalid");
          clean = false;
        }
      }
      if (t.engagement === "") {
        document
          .getElementById(`${task_i}_engagement`)
          .classList.add("is-invalid");
        clean = false;
      }
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      clean = false;
    }

    if (!clean) return;

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";
    let worksheetUpload = null;
    let worksheetURL = null;

    if (document.getElementById("worksheet").value !== "") {
      if (document.getElementById("worksheet").type === "url") {
        try {
          let input = document.getElementById("worksheet").value;
          if (!/^(ftp|http|https):\/\/[^ "]+$/.test(input)) {
            input = `https://${input}`;
          }
          let worksheetLink = new URL(input);
          worksheetURL = worksheetLink.href;
        } catch (err) {
          document.getElementById("worksheet").classList.add("is-invalid");
          return;
        }
      } else if (document.getElementById("worksheet").files.length > 0) {
        worksheetUpload = document.getElementById("worksheet").files[0];
      }
    }

    if (worksheetUpload) {
      const worksheetRef = ref(
        storage,
        `worksheets/${studentRef.current.id}/${worksheetUpload.name}`,
      );

      uploadBytes(worksheetRef, worksheetUpload).then(() =>
        addDoc(collection(db, "evaluations"), {
          ...evaluation,
          owner: auth.currentUser.uid,
          worksheet: worksheetRef.fullPath,
          flagged:
            document
              .getElementById("flagForReview")
              .classList.contains("btn-outline-danger") &&
            !document
              .getElementById("flagForReview")
              .classList.contains("d-none"),
          ...blankEval,
        })
          .then((doc) => {
            tasks.forEach((t, task_idx) =>
              addDoc(collection(doc, "tasks"), {
                ...t,
                idx: task_idx,
                progression: t.standards.length === 0 ? t.progression : null,
                standards: t.standards.map((s) => {
                  return { id: s.id, progression: s.progression };
                }),
                ...blankTask,
              }),
            );
            addToast({
              header: "Evaluation Submitted",
              message: `Session evaluation for ${evaluation.student_name} was successfully uploaded`,
            });
          })
          .then(() => {
            localStorage.removeItem(`${params.studentid}_eval`);
            localStorage.removeItem(`${params.studentid}_tasks`);
          })
          .then(() => {
            localStorage.setItem("student_tab", "evals");
            navigate(-1);
          }),
      );
    } else {
      addDoc(collection(db, "evaluations"), {
        ...evaluation,
        tutor_id: evaluation.tutor_id || "",
        tutor_name: evaluation.tutor_name || "",
        student_id: evaluation.student_id || "",
        student_name: evaluation.student_name || "",
        owner: auth.currentUser.uid,
        worksheet: worksheetURL,
        flagged: document
          .getElementById("flagForReview")
          .classList.contains("btn-outline-danger"),
      })
        .then((d) => {
          tasks.forEach((t, task_idx) => {
            addDoc(collection(d, "tasks"), {
              ...t,
              idx: task_idx,
              progression: t.standards.length === 0 ? t.progression : null,
              standards: t.standards.map((s) => {
                return { id: s.id, progression: s.progression };
              }),
            });
          });
          addToast({
            header: "Evaluation Submitted",
            message: `Session evaluation for ${evaluation.student_name} was successfully uploaded`,
          });
        })
        .then(() => {
          localStorage.removeItem(`${params.studentid}_eval`);
          localStorage.removeItem(`${params.studentid}_tasks`);
        })
        .then(() => {
          localStorage.setItem("student_tab", "evals");
          navigate(-1);
        });
    }
  }

  return (
    <>
      <div className='p-3 d-flex flex-column'>
        <div className='d-flex'>
          <h1 className='display-1'>New Session Evaluation</h1>
          {notes[0] && (
            <Button
              variant=''
              className='w-25 ms-auto'
              onClick={() => setShowNotes(true)}
            >
              <Card className='shadow' style={{ cursor: "pointer" }}>
                <Card.Header>Last Session's Notes</Card.Header>
                <Card.Body>
                  <div className='text-truncate'>{notes[0].notes}</div>
                </Card.Body>
              </Card>
            </Button>
          )}
        </div>
        <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
          <EvalHeader
            evaluation={evaluation}
            handleEvalChange={handleEvalChange}
            loading={loading}
          />
          <hr />
          <div className='d-flex flex-column'>
            <div className='h4'>Tasks</div>
            <Tasks
              handleTasksChange={handleTasksChange}
              tasks={tasks}
              standards={standards}
              setStandards={setStandards}
            />
          </div>
          <hr />
          <EvalFooter
            evaluation={evaluation}
            handleEvalChange={handleEvalChange}
          />
        </div>
        <div className='d-flex'>
          <button
            type='button'
            className='btn btn-secondary m-3 me-auto'
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </button>

          <button
            className='btn btn-primary m-3'
            id='submit'
            onClick={sumbitEval}
          >
            Submit
          </button>
        </div>
        <div className='d-flex'>
          {hasCache.current && (
            <Button
              variant='secondary'
              className='m-3'
              onClick={() => {
                localStorage.removeItem(`${params.studentid}_eval`);
                localStorage.removeItem(`${params.studentid}_tasks`);
                setEvaluation({
                  ...blankEval,
                  student_name: evaluation.student_name,
                });
                setTasks([blankTask]);
                hasCache.current = false;
                addToast({
                  header: "Session Cleared",
                  message: "Your session evaluation has been cleared",
                });
              }}
            >
              Clear Saved Data
            </Button>
          )}
          <div id='flagForReview' className='mx-3 ms-auto'>
            <OverlayTrigger
              placement='left'
              overlay={
                <Popover>
                  <Popover.Header>Flag for Review</Popover.Header>
                  <Popover.Body>
                    Select this option if you would like an administrator to
                    review this evaluation and discuss the session with you
                    and/or the student's parent
                  </Popover.Body>
                </Popover>
              }
            >
              <i className='bi bi-question-square mx-3'></i>
            </OverlayTrigger>
            <Button
              variant='danger'
              className=''
              onClick={(e) => {
                e.preventDefault();
                if (e.target.classList.contains("btn-danger")) {
                  e.target.classList.remove("btn-danger");
                  e.target.classList.add("btn-outline-danger");
                  e.target.innerHTML = "Flagged for Admin Review";
                } else {
                  e.target.classList.remove("btn-outline-danger");
                  e.target.classList.add("btn-danger");
                  e.target.innerHTML = "Flag for Admin Review?";
                }
              }}
            >
              Flag for Admin Review?
            </Button>
          </div>
        </div>
      </div>
      <div className='d-flex'>
        <Modal show={showNotes} onHide={() => setShowNotes(false)}>
          <Modal.Header>
            <Modal.Title>{evaluation.student_name}</Modal.Title>
            <Button
              variant='secondary'
              onClick={() => setShowNotes(false)}
              style={{ "--bs-bg-opacity": "0" }}
            >
              <i className='bi bi-x-lg' />
            </Button>
          </Modal.Header>
          <Modal.Body>
            <div className='d-flex flex-column'>
              <div className='d-flex'>
                <div className='d-flex flex-column'>
                  <div className='h6'>{notes[notesIndex]?.tutor}</div>
                  <div className='text-secondary'>
                    {dayjs(notes[notesIndex]?.date).format("MMMM D, YYYY")}
                  </div>
                </div>
                <div className='ms-auto align-self-center'>
                  <Button
                    variant='primary'
                    size='sm'
                    onClick={() => navigate(`/eval/${notes[notesIndex]?.id}`)}
                  >
                    View Evaluation{" "}
                    <i className='ms-auto ps-1 bi bi-box-arrow-up-right'></i>
                  </Button>
                </div>
              </div>
              <hr />
              <div className='h5'>Next Session Notes</div>
              <div className=''>{notes[notesIndex]?.notes}</div>
            </div>
          </Modal.Body>
          <Modal.Footer className='d-flex'>
            <Button
              variant='secondary'
              size='sm'
              className='me-auto'
              disabled={notesIndex >= notes.length - 1}
              onClick={() => {
                setNotesIndex(notesIndex + 1);
              }}
            >
              <i className='bi bi-arrow-left' />
            </Button>
            <div className='text-secondary align-self-center'>
              {notes.length - notesIndex} / {notes.length}
            </div>
            <Button
              variant='secondary'
              size='sm'
              className='ms-auto'
              disabled={notesIndex <= 0}
              onClick={() => {
                setNotesIndex(notesIndex - 1);
              }}
            >
              <i className='bi bi-arrow-right' />
            </Button>
          </Modal.Footer>
        </Modal>
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
              <div>
                Please make sure to update their grades before they leave.
              </div>
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
                navigate(`/students/${params.studentid}`);
              }}
            >
              Take me there now
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default NewStudentEval;
