import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import history from "history/browser";

import { deleteObject, ref, uploadBytes } from "firebase/storage";
import {
  Button,
  Form,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Spinner,
} from "react-bootstrap";
import { Can } from "../../Services/can";
import { Eval } from "../../Services/defineAbility";
import { db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import TrackStandard from "../Standards/TrackStandard";
import EvalFooter from "./Components/EvalFooter";
import EvalHeader from "./Components/EvalHeader";
import Tasks from "./Components/Tasks";

const StudentEvalEdit = () => {
  const [evaluation, setEvaluation] = useState({});
  const [tasks, setTasks] = useState([]);
  const [tasksToDelete, setTasksToDelete] = useState([]); // [task_id, ...

  const [standards, setStandards] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");

  const [loading, setLoading] = useState(true);

  const [showNewStandardPane, setShowNewStandardPane] = useState(false);

  const addToast = useContext(ToastContext);

  const params = useParams();

  const newStandardSelector = useRef(null);

  const evalRef = useRef(doc(db, "evaluations", params.evalid));
  const [student, setStudent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeEval = onSnapshot(evalRef.current, (res) => {
      if (!res.exists()) return;
      if (localStorage.getItem(`${evalRef.current.id}`)) {
        setEvaluation(
          JSON.parse(localStorage.getItem(`${evalRef.current.id}`)),
        );
      } else {
        setEvaluation(res.data());
      }
      setSelectedTutor(res.data().tutor_id);
      setStudent(res.data().student_id);
    });

    const unsubscribeTutors = onSnapshot(collection(db, "tutors"), (res) =>
      setTutors(res.docs),
    );

    const unsubscribeTasks = onSnapshot(
      collection(evalRef.current, "tasks"),
      (res) => {
        if (localStorage.getItem(`${evalRef.current.id}_tasks`)) {
          setTasks(
            JSON.parse(localStorage.getItem(`${evalRef.current.id}_tasks`)),
          );
          setLoading(false);
        } else {
          let compiledTasks = new Array(res.docs.length);
          Promise.all(
            res.docs.map(async (t, i) => {
              if (t.data().standards?.length === 0) {
                compiledTasks[i] = { ...t.data(), id: t.id };
              } else {
                const standardPromises =
                  t.data().standards?.map(async (standard) => {
                    return {
                      ...(
                        await getDoc(
                          doc(db, "standards", standard?.id || standard),
                        )
                      ).data(),
                      id: (
                        await getDoc(
                          doc(db, "standards", standard?.id || standard),
                        )
                      ).id,
                      progression:
                        standard?.progression || t.data().progression,
                    };
                  }) || [];
                const standardsData = await Promise.all(standardPromises);
                compiledTasks[i] = {
                  ...t.data(),
                  id: t.id,
                  standards: standardsData,
                };
              }
            }),
          )
            .then(() => {
              compiledTasks.sort((a, b) => {
                let a_standard = a.standards[0]?.key || "0.0.0";
                let b_standard = b.standards[0]?.key || "0.0.0";
                return (
                  a_standard
                    .split(".")[1]
                    .localeCompare(b_standard.split(".")[1]) ||
                  a_standard.split(".")[2] - b_standard.split(".")[2] ||
                  a_standard
                    .split(".")[2]
                    .localeCompare(b_standard.split(".")[2]) ||
                  a_standard.localeCompare(b_standard)
                );
              });
              setTasks(compiledTasks);
            })
            .then(() => setLoading(false));
        }
      },
    );

    return () => {
      unsubscribeEval();
      unsubscribeTasks();
      unsubscribeTutors();
    };
  }, []);

  useEffect(() => {
    if (student === "") return;
    const evalsQuery = query(
      collection(db, "evaluations"),
      where("student_id", "==", student),
      orderBy("date", "desc"),
      limit(5),
    );

    const unsubscribeEvals = onSnapshot(evalsQuery, (evalsSnapshot) => {
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
                  ).then((standard) => {
                    return {
                      ...standard.data(),
                      id: standard.id,
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
        setStandards(uniqueStandards);
      });
    });

    return () => {
      unsubscribeEvals();
    };
  }, [student]);

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

  useEffect(() => {
    if (evaluation.length !== 0 && tasks.length !== 0) {
      localStorage.setItem(`${params.evalid}`, JSON.stringify(evaluation));
      localStorage.setItem(`${params.evalid}_tasks`, JSON.stringify(tasks));
    }
  }, [evaluation, tasks, params.evalid]);

  async function sumbitEval(e) {
    e.preventDefault();
    document.getElementById("submit").innerHtml =
      "Submit <span class='spinner-border spinner-border-sm' />";
    document.getElementById("submit").disabled = true;

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }
    let clean = true;

    if (!selectedTutor) {
      document.getElementById("tutor").classList.add("is-invalid");
      clean = false;
    }

    tasks.forEach((t, i) => {
      if (t.comments === "") {
        document.getElementById(`${i}_comments`).classList.add(`is-invalid`);
        clean = false;
      }
      t.standards.forEach((s, standard_i) => {
        if (s.key === "") {
          document
            .getElementById(`${i}_${standard_i}_standard`)
            .classList.add(`is-invalid`);
          clean = false;
        }
        if (s.progression === "") {
          document
            .getElementById(`${i}_${standard_i}_progression`)
            .classList.add(`is-invalid`);
          clean = false;
        }
      });
      if (t.standards.length === 0) {
        if (t.progression === "") {
          document
            .getElementById(`${i}_progression`)
            .classList.add(`is-invalid`);
          clean = false;
        }
      }
      if (t.engagement === "") {
        document.getElementById(`${i}_engagement`).classList.add(`is-invalid`);
        clean = false;
      }
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      clean = false;
    }

    if (!clean) {
      document.getElementById("submit").innerHTML = "Submit";
      document.getElementById("submit").disabled = false;
      return;
    }

    localStorage.removeItem(`${params.evalid}`);
    localStorage.removeItem(`${params.evalid}_tasks`);

    let tutorName =
      tutors.find((t) => t.id === selectedTutor)?.data().displayName || "";

    let evalUpload = { ...evaluation };

    evalUpload.tutor_id = selectedTutor;
    evalUpload.tutor_name = tutorName;

    if (
      document
        .getElementById("flagForReview")
        .classList.contains("btn-outline-danger") &&
      !document.getElementById("flagForReview").classList.contains("d-none")
    ) {
      evalUpload.flagged = true;
    }

    let worksheetUpload = null;
    let worksheetReplacement = false;

    if (
      document.getElementById("worksheet").type === "url" &&
      document.getElementById("worksheet").value !== ""
    ) {
      try {
        let input = document.getElementById("worksheet").value;
        if (!/^(ftp|http|https):\/\/[^ "]+$/.test(input)) {
          input = `https://${input}`;
        }
        let worksheetLink = new URL(input);
        evalUpload.worksheet = worksheetLink.href;
        worksheetReplacement = true;
      } catch (err) {
        document.getElementById("worksheet").classList.add("is-invalid");
        document.getElementById("submit").innerHTML = "Submit";
        document.getElementById("submit").disabled = false;
        return;
      }
    } else if (
      document.getElementById("worksheet").type === "file" &&
      document.getElementById("worksheet").files.length > 0
    ) {
      worksheetUpload = document.getElementById("worksheet").files[0];
      worksheetReplacement = true;
    }

    if (worksheetReplacement) {
      if (evaluation?.worksheet !== "" && evaluation?.worksheet !== undefined) {
        try {
          console.log(evaluation?.worksheet);
          let oldRef = ref(storage, evaluation?.worksheet);
          await deleteObject(oldRef);
        } catch (err) {}
      }

      if (worksheetUpload !== null) {
        const worksheetRef = ref(
          storage,
          `worksheets/${evalUpload.student_id}/${worksheetUpload.name}`,
        );

        await uploadBytes(worksheetRef, worksheetUpload).then(() => {
          evalUpload.worksheet = worksheetRef.fullPath;
        });
      }
    } else {
      evalUpload.worksheet = evaluation?.worksheet;
    }

    updateDoc(evalRef.current, evalUpload)
      .then(() => {
        tasks.forEach((t) => {
          let { id: _, standard: __, ...rest } = t;
          if (t.id === undefined) {
            addDoc(collection(evalRef.current, "tasks"), {
              ...rest,
              progression:
                t.standards.length === 0 ? t.progression || "4" : null,
              standards: t.standards.map((s) => {
                return { id: s.id, progression: s.progression };
              }),
            });
          } else {
            setDoc(doc(db, "evaluations", evalRef.current.id, "tasks", t.id), {
              ...rest,
              progression:
                t.standards.length === 0 ? t.progression || "4" : null,
              standards: t.standards.map((s) => {
                return { id: s.id, progression: s.progression };
              }),
            });
          }
        });
      })
      .then(() => {
        tasksToDelete.forEach((t) => {
          deleteDoc(doc(db, "evaluations", evalRef.current.id, "tasks", t));
        });
      })
      .then(() =>
        addToast({
          header: "Changes Saved",
          message: `Session evaluation for ${evaluation?.student_name} was successfully updated`,
        }),
      )
      .then(() => navigate(-1));
  }

  async function handleDelete(e) {
    document.getElementById("delete").innerHTML =
      "Delete <span class='spinner-border spinner-border-sm' />";
    document.getElementById("delete").disabled = false;

    if (
      window.confirm(
        `You are about to DELETE this evaluation for ${evaluation?.student_name}. Are you sure you want to do this?`,
      )
    ) {
      if (evaluation?.worksheet !== "" && evaluation?.worksheet !== undefined) {
        try {
          await deleteObject(ref(storage, evaluation?.worksheet));
        } catch (err) {}
      }

      // cascade delete tasks
      await getDocs(collection(evalRef.current, "tasks")).then((res) => {
        res.docs.forEach((task) => {
          deleteDoc(task.ref);
        });
      });

      // delete evaluation
      await deleteDoc(evalRef.current).then(() => {
        navigate(-2);
        addToast({
          header: "Evaluation Deleted",
          message: `Session evaluation for ${evaluation?.student_name} has been deleted`,
        });
      });
    }

    document.getElementById("delete").innerHTML = "Delete";
    document.getElementById("delete").disabled = false;
  }

  return (
    <>
      <div className='p-3 d-flex flex-column'>
        <h1 className='display-1'>Edit Session Evaluation</h1>
        <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
          {loading ? (
            <div className='d-flex justify-content-center align-items-center'>
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <EvalHeader
                evaluation={evaluation}
                setEvaluation={setEvaluation}
              />
              <hr />
              <div className='h5'>Tasks</div>
              <Tasks
                setTasks={setTasks}
                tasks={tasks}
                standards={standards}
                setStandards={setStandards}
                setTasksToDelete={setTasksToDelete}
              />
              <hr />
              <EvalFooter
                evaluation={evaluation}
                setEvaluation={setEvaluation}
              />
              <Can I='manage' an={Eval}>
                <hr />
                <h5>Owner</h5>
                <Form.Select
                  className='w-25'
                  value={evaluation.owner}
                  onChange={(e) => {
                    setEvaluation({ ...evaluation, owner: e.target.value });
                  }}
                >
                  {tutors.map((tutor) => {
                    let tutorData = tutor.data();
                    return (
                      <option value={tutor.id} key={tutor.id}>
                        {tutorData.displayName}
                      </option>
                    );
                  })}
                </Form.Select>
              </Can>
            </>
          )}
        </div>
        <div className='d-flex'>
          <button
            type='button'
            className='btn btn-secondary m-3 me-auto'
            onClick={() => {
              localStorage.removeItem(`${params.evalid}`);
              localStorage.removeItem(`${params.evalid}_tasks`);
              history.back();
            }}
          >
            Back
          </button>
          <Button
            id='delete'
            variant='danger'
            className='m-3 ms-auto'
            type='button'
            onClick={handleDelete}
          >
            Delete
          </Button>
          <button
            id='submit'
            className='btn btn-primary m-3'
            onClick={sumbitEval}
          >
            Submit
          </button>
        </div>
        <div id='flagForReview' className='mx-3 ms-auto'>
          <OverlayTrigger
            placement='left'
            overlay={
              <Popover>
                <Popover.Header>Flag for Review</Popover.Header>
                <Popover.Body>
                  Select this option if you would like an administrator to
                  review this evaluation and discuss the session with you and/or
                  the student's parent
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
      <Offcanvas
        show={showNewStandardPane}
        onHide={() => setShowNewStandardPane(false)}
        placement='end'
        style={{ width: "75%", overflow: "auto" }}
      >
        <TrackStandard
          standards={standards}
          setStandards={setStandards}
          close={() => {
            setShowNewStandardPane(false);
            newStandardSelector.current = null;
          }}
          standardSelector={newStandardSelector.current}
        />
      </Offcanvas>
    </>
  );
};

export default StudentEvalEdit;
