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
import { Button, Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { auth, db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import EvalFooter from "./Components/EvalFooter";
import EvalHeader from "./Components/EvalHeader";
import Tasks from "./Components/Tasks";
import StandardInfo from "../Standards/Components/StandardInfo";
import EvalNotes from "./Components/EvalNotes";
import GradesReminder from "./Components/GradesReminder";

const NewStudentEval = () => {
  const [standardOptions, setStandardOptions] = useState([]);

  const [recentStandards, setRecentStandards] = useState([]);
  const [standardAverages, setStandardAverages] = useState({});
  const [standardSuggestions, setStandardSuggestions] = useState([]);

  const [topics, setTopics] = useState([]);

  const [showStandardInfo, setShowStandardInfo] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [recentEvals, setRecentEvals] = useState([]);
  const [draft, setDraft] = useState();

  const addToast = useContext(ToastContext);

  const params = useParams();

  const [evaluation, setEvaluation] = useState({});

  const [tasks, setTasks] = useState([]);

  const studentRef = useRef(doc(db, "students", params.studentid));

  const hasCache = useRef(false);
  const [showReviewFlag, setShowReviewFlag] = useState(false);

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
    draft: false,
    flagged: false,
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

  // prep eval with student data
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

  // prep eval with tutor data
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
    const unsubscribeDrafts = onSnapshot(
      query(
        collection(db, "evaluations"),
        where("student_id", "==", params.studentid),
        where("draft", "==", true),
        where("tutor_id", "==", auth.currentUser.uid),
        limit(1),
      ),
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          setDraft(snapshot.docs[0].id);
        }
      },
    );

    return () => {
      unsubscribeDrafts();
    };
  }, [params.studentid]);

  // load cached eval data
  useEffect(() => {
    if (localStorage.getItem(`${params.studentid}_eval`)) {
      setEvaluation(
        JSON.parse(localStorage.getItem(`${params.studentid}_eval`)),
      );
      hasCache.current = true;
    } else {
      setEvaluation(blankEval);
    }

    if (localStorage.getItem(`${params.studentid}_tasks`)) {
      setTasks(JSON.parse(localStorage.getItem(`${params.studentid}_tasks`)));
      hasCache.current = true;
    } else {
      setTasks([blankTask]);
    }

    if (hasCache.current) {
      addToast({
        header: "Session Restored",
        message: "Your previously started session evaluation has been restored",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.studentid]);

  // load recent evals for notes
  useEffect(() => {
    const unsubscribeRecentEvals = onSnapshot(
      query(
        collection(db, "evaluations"),
        where("student_id", "==", params.studentid),
        where("draft", "==", false), // only show completed evals
        orderBy("date", "desc"),
        limit(5),
      ),
      (evalsSnapshot) => {
        const taskPromises = evalsSnapshot.docs.map(async (e) => {
          return {
            ...e.data(),
            id: e.id,
            tasks: await getDocs(collection(e.ref, "tasks")).then(
              (taskSnapshot) => {
                return taskSnapshot.docs.map((task) => {
                  return {
                    ...task.data(),
                    id: task.id,
                  };
                });
              },
            ),
          };
        });

        Promise.all(taskPromises).then((evals) => {
          setRecentEvals(evals);
        });
      },
    );

    return () => {
      unsubscribeRecentEvals();
    };
  }, [params.studentid]);

  // get all standards from recent evaluations
  useEffect(() => {
    let standards = [];
    recentEvals.forEach((evaluation) => {
      evaluation.tasks.forEach((task) => {
        task.standards.forEach((standard) => {
          if (!standards.includes(standard.id)) {
            standards.push({
              id: standard.id,
              asof: evaluation.date,
            });
          }
        });
      });
    });

    Promise.all(
      standards.map(async (s) => {
        return getDoc(doc(db, "standards", s.id)).then((standard) => {
          return { ...standard.data(), id: standard.id, asof: s.asof };
        });
      }),
    ).then((standards) => {
      let uniqueStandards = standards.filter((s, i) => {
        return standards.findIndex((s2) => s2.id === s.id) === i;
      });
      setRecentStandards(uniqueStandards);
    });
  }, [recentEvals]);

  // calculate average progression for each standard across ALL evals
  useEffect(() => {
    const unsubscribeEvaluations = onSnapshot(
      query(
        collection(db, "evaluations"),
        where("draft", "==", false),
        where("student_id", "==", params.studentid),
      ),
      (res) => {
        const evaluations = res.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        const standardProgression = {};

        const evaluationPromises = evaluations.map(async (evaluation) => {
          const evaluationRef = collection(
            db,
            "evaluations",
            evaluation.id,
            "tasks",
          );
          return getDocs(evaluationRef).then((tasksSnapshot) => {
            tasksSnapshot.forEach((taskDoc) => {
              const standards = taskDoc.data().standards;
              if (!standards) return;
              standards.forEach((standard) => {
                if (!standardProgression[standard?.id || standard]) {
                  standardProgression[standard?.id || standard] = [];
                }
                standardProgression[standard?.id || standard].push(
                  standard?.progression || taskDoc.data().progression,
                );
              });
            });
          });
        });

        Promise.all(evaluationPromises).then(() => {
          const averageProgression = {};
          Object.keys(standardProgression).forEach((standard) => {
            const progressions = standardProgression[standard];
            const sum = progressions.reduce(
              (total, progression) => total + parseInt(progression),
              0,
            );
            const average = sum / progressions.length;
            averageProgression[standard] = average.toFixed(2);
          });

          // console.log(averageProgression);
          setStandardAverages(averageProgression);
        });
      },
    );

    return () => {
      unsubscribeEvaluations();
    };
  }, [params.studentid]);

  // generate suggestions based on average progression and recent standards
  useEffect(() => {
    let suggestions = [];
    let postreqmap = {};
    let suggestionPromises = [];
    recentStandards.forEach((standard) => {
      if (parseFloat(standardAverages[standard.id]) < 3.5) {
        suggestions.push({
          ...standard,
          progression: standardAverages[standard.id],
        });
      } else {
        standard.postrequisites?.forEach((postreq) => {
          if (!(postreq in standardAverages)) {
            suggestionPromises.push(getDoc(doc(db, "standards", postreq)));
            postreqmap[postreq] = {
              ...standard,
              progression: standardAverages[standard.id],
            };
          }
        });
      }
    });

    Promise.all(suggestionPromises)
      .then((standards) => {
        let postReqSuggestions = standards.map((s) => {
          return {
            ...s.data(),
            id: s.id,
            progression: undefined,
            parent: postreqmap[s.id],
          };
        });
        suggestions = suggestions.concat(postReqSuggestions);
      })
      .then(() => {
        setStandardOptions(suggestions);
        setStandardSuggestions(suggestions);
      });
  }, [standardAverages, recentStandards]);

  // compile topics from student profile
  useEffect(() => {
    const unsubscribeTopics = onSnapshot(
      collection(db, "students", params.studentid, "topics"),
      (topicDocs) => {
        setTopics(
          topicDocs.docs.map((doc) => {
            return { ...doc.data(), id: doc.id };
          }),
        );
      },
    );

    return () => {
      unsubscribeTopics();
    };
  }, [params.studentid]);

  // flag for review button
  useEffect(() => {
    for (let i = 0; i < tasks.length; i++) {
      if (
        tasks[i].standards.length < 1 &&
        tasks[i].progression !== "" &&
        tasks[i].progression <= 2
      ) {
        setShowReviewFlag(true);
        return;
      }
      if (tasks[i].engagement !== "" && tasks[i].engagement <= 2) {
        setShowReviewFlag(true);
        return;
      }
      for (let j = 0; j < tasks[i].standards.length; j++) {
        if (
          tasks[i].standards[j].progression &&
          tasks[i].standards[j].progression <= 2
        ) {
          setShowReviewFlag(true);
          return;
        }
      }
    }

    setShowReviewFlag(false);
    setEvaluation((prev) => {
      return { ...prev, flagged: false };
    });
  }, [tasks]);

  useEffect(() => {
    if (showReviewFlag) {
      document.getElementById("flagForReview").classList.remove("d-none");
    } else {
      document.getElementById("flagForReview").classList.add("d-none");
    }
  }, [showReviewFlag]);

  useEffect(() => {
    if (evaluation.flagged) {
      document
        .getElementById("flagForReviewBtn")
        .classList.remove("btn-danger");
      document
        .getElementById("flagForReviewBtn")
        .classList.add("btn-outline-danger");
      document.getElementById("flagForReviewBtn").innerHTML =
        "Flagged for Admin Review";
    } else {
      document
        .getElementById("flagForReviewBtn")
        .classList.remove("btn-outline-danger");
      document.getElementById("flagForReviewBtn").classList.add("btn-danger");
      document.getElementById("flagForReviewBtn").innerHTML =
        "Flag for Admin Review?";
    }
  }, [evaluation.flagged]);

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
    let draft = false;
    if (e.target.id === "saveDraft") {
      draft = true;
    }

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }
    let clean = true;

    // validity checks

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
          .getElementsByName(`${task_i}_engagement`)
          .forEach((el) => el.classList.add("is-invalid"));
        clean = false;
      }
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      clean = false;
    }

    if (!clean && !draft) return;

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";
    let worksheetUpload = null;
    let worksheetURL = null;

    // if (document.getElementById("worksheet").value !== "") {
    //   if (document.getElementById("worksheet").type === "url") {
    //     try {
    //       let input = document.getElementById("worksheet").value;
    //       if (!/^(ftp|http|https):\/\/[^ "]+$/.test(input)) {
    //         input = `https://${input}`;
    //       }
    //       let worksheetLink = new URL(input);
    //       worksheetURL = worksheetLink.href;
    //     } catch (err) {
    //       document.getElementById("worksheet").classList.add("is-invalid");
    //       return;
    //     }
    //   } else if (document.getElementById("worksheet").files.length > 0) {
    //     worksheetUploads = document.getElementById("worksheet").files;
    //   }
    // }

    // let worksheetPaths = [];

    if (worksheetUpload) {
      uploadBytes(worksheetRef, worksheetUpload).then(() =>
        // addDoc(collection(db, "evaluations"), {
        //   ...evaluation,
        //   owner: auth.currentUser.uid,
        //   worksheet: worksheetRef.fullPath,
        //   draft: draft,
        // })
        //   .then((doc) => {
        //     tasks.forEach((t, task_idx) =>
        //       addDoc(collection(doc, "tasks"), {
        //         ...t,
        //         idx: task_idx,
        //         progression: t.standards.length === 0 ? t.progression : null,
        //         standards: t.standards.map((s) => {
        //           return { id: s.id, progression: s.progression };
        //         }),
        //       }),
        //     );
        //     addToast({
        //       header: "Evaluation Submitted",
        //       message: `Session evaluation for ${evaluation.student_name} was successfully uploaded`,
        //     });
        //   })
        //   .then(() => {
        //     localStorage.removeItem(`${params.studentid}_eval`);
        //     localStorage.removeItem(`${params.studentid}_tasks`);
        //   })
        //   .then(() => {
        //     localStorage.setItem("student_tab", "evals");
        //     navigate(-1);
        //   }),
        worksheetPaths.push(worksheetRef.fullPath),
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
        draft: draft,
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
        <Row className='justify-content-center'>
          <h1 className='display-1 col-md-9'>New Session Evaluation</h1>
          <Col md={3}>
            <EvalNotes
              recentEvals={recentEvals}
              standardSuggestions={standardSuggestions}
              topics={topics}
            />
          </Col>
        </Row>
        <div className='d-flex flex-fill card p-3 bg-light-subtle'>
          <EvalHeader
            evaluation={evaluation}
            handleEvalChange={handleEvalChange}
            loading={loading}
            draft={draft}
          />
          <hr />
          <div className='d-flex flex-column'>
            <div className='h4'>Tasks</div>
            <Tasks
              handleTasksChange={handleTasksChange}
              tasks={tasks}
              standards={standardOptions}
              setStandards={setStandardOptions}
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
            className='btn btn-secondary my-3 me-auto'
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </button>

          <Button
            variant='outline-primary'
            className='my-3'
            id='saveDraft'
            onClick={sumbitEval}
          >
            Save Draft
          </Button>
          <button
            className='btn btn-primary my-3 ms-3'
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
              className='my-3'
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
          <div id='flagForReview' className='ms-auto d-flex'>
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
              <i className='bi bi-question-square align-self-center me-3'></i>
            </OverlayTrigger>
            <Button
              id='flagForReviewBtn'
              variant='danger'
              className='my-3'
              onClick={(e) => {
                e.preventDefault();
                if (evaluation.flagged) {
                  setEvaluation((prev) => {
                    return { ...prev, flagged: false };
                  });
                } else {
                  setEvaluation((prev) => {
                    return { ...prev, flagged: true };
                  });
                }
              }}
            >
              Flag for Admin Review?
            </Button>
          </div>
        </div>
      </div>
      <GradesReminder studentid={params.studentid} />
      <StandardInfo
        show={showStandardInfo}
        setShow={setShowStandardInfo}
        close={() => {
          setShowStandardInfo(false);
          setSelectedStandard(false);
        }}
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
      />
    </>
  );
};

export default NewStudentEval;
