import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
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

import { auth, db, storage } from "../../Services/firebase";
import dayjs from "dayjs";
import { ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "../../Services/toast";
import {
  Button,
  Dropdown,
  Form,
  OverlayTrigger,
  Popover,
  Offcanvas,
  Card,
  Container,
  Modal,
} from "react-bootstrap";
import TrackStandard from "../Standards/TrackStandard";

const grades = {
  K: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

const NewStudentEval = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);
  const [standards, setStandards] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState(
    auth.currentUser?.uid || "",
  );

  // const [loading, setLoading] = useState(true);

  const [showNewStandardPane, setShowNewStandardPane] = useState(false);

  const [notes, setNotes] = useState({});
  const [showNotes, setShowNotes] = useState(false);

  const addToast = useContext(ToastContext);

  const params = useParams();

  const newStandardSelector = useRef(null);

  const [evaluation, setEvaluation] = useState(
    localStorage.getItem(`${params.studentid}_eval`)
      ? JSON.parse(localStorage.getItem(`${params.studentid}_eval`))
      : {
          date: dayjs().format("YYYY-MM-DD"),
          worksheet: "",
          worksheet_completion: "",
          next_session: "",
        },
  );

  const [tasks, setTasks] = useState(
    localStorage.getItem(`${params.studentid}_tasks`)
      ? JSON.parse(localStorage.getItem(`${params.studentid}_tasks`))
      : [
          {
            subject: "",
            standards: [],
            progression: "",
            engagement: "",
            comments: "",
          },
        ],
  );

  const studentRef = useRef(doc(db, "students", params.studentid));

  const navigate = useNavigate();

  // scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      doc(db, "students", params.studentid),
      (doc) => {
        setStudent({ ...doc.data(), id: doc.id });
      },
    );

    const evalsQuery = query(
      collection(db, "evaluations"),
      where("student_id", "==", params.studentid),
      orderBy("date", "desc"),
      limit(5),
    );

    const unsubscribeEvals = onSnapshot(evalsQuery, (evalsSnapshot) => {
      setNotes({
        tutor: evalsSnapshot.docs[0]?.data()?.tutor_name,
        date: evalsSnapshot.docs[0]?.data()?.date,
        notes: evalsSnapshot.docs[0]?.data()?.next_session,
        id: evalsSnapshot.docs[0]?.id,
      });

      const fetchTasksPromises = evalsSnapshot.docs.map((evaluation) => {
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
                task.standards?.map((standard) => {
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

    const unsubscribeTutors = onSnapshot(
      collection(db, "tutors"),
      (snapshot) => {
        const newTutors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTutors(newTutors);
      },
    );

    return () => {
      unsubscribeStudents();
      unsubscribeEvals();
      unsubscribeTutors();
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

  useEffect(() => {
    localStorage.setItem(
      `${params.studentid}_eval`,
      JSON.stringify(evaluation),
    );
  }, [evaluation, params.studentid]);

  useEffect(() => {
    localStorage.setItem(`${params.studentid}_tasks`, JSON.stringify(tasks));
  }, [tasks, params.studentid]);

  function addTask() {
    setTasks([
      ...tasks,
      {
        subject: "",
        standards: [],
        progression: "",
        engagement: "",
        comments: "",
      },
    ]);
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

    if (!selectedTutor) {
      document.getElementById("tutor").classList.add("is-invalid");
      // addToast({
      //   header: "No Tutor Selected",
      //   message: "Please select a tutor before submitting",
      // });
      clean = false;
    }

    if (evaluation.date === "") {
      document.getElementById("date").classList.add("is-invalid");
      // addToast({
      //   header: "Missing Date",
      //   message: "Please enter a date before submitting",
      // });
      clean = false;
    }

    tasks.forEach((t, task_i) => {
      if (t.comments === "") {
        document
          .getElementById(`${task_i}_comments`)
          .classList.add(`is-invalid`);
        // addToast({
        //   header: "Missing Summary",
        //   message: "Please enter a summary for all tasks",
        // });
        clean = false;
      }
      t.standards.forEach((s, standard_i) => {
        if (s.key === "") {
          document
            .getElementById(`${task_i}_${standard_i}_standard`)
            .classList.add(`is-invalid`);
          // addToast({
          //   header: "Missing Standard",
          //   message: "Please select a standard",
          // });
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
        document.getElementById("engagement").classList.add("is-invalid");
        clean = false;
      }
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      // addToast({
      //   header: "Missing Next Session Plans",
      //   message: "Please enter plans for the next session",
      // });
      clean = false;
    }

    if (!clean) return;

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    let tutorName;
    tutors.forEach((tutor) => {
      if (tutor.id === document.getElementById("tutor").value)
        tutorName = tutor.displayName;
    });

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
          student_id: studentRef.current.id,
          student_name: student.student_name,
          tutor_id: selectedTutor,
          tutor_name: tutorName,
          owner: auth.currentUser.uid,
          worksheet: worksheetRef.fullPath,
          flagged:
            document
              .getElementById("flagForReview")
              .classList.contains("btn-outline-danger") &&
            !document
              .getElementById("flagForReview")
              .classList.contains("d-none"),
        })
          .then((doc) => {
            tasks.forEach((t) =>
              addDoc(collection(doc, "tasks"), {
                ...t,
                progression: t.standards.length === 0 ? t.progression : null,
                standards: t.standards.map((s) => {
                  return { id: s.id, progression: s.progression };
                }),
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
        student_id: studentRef.current.id,
        student_name: student.student_name,
        tutor_id: selectedTutor,
        tutor_name: tutorName,
        owner: auth.currentUser.uid,
        worksheet: worksheetURL,
        flagged: document
          .getElementById("flagForReview")
          .classList.contains("btn-outline-danger"),
      })
        .then((d) => {
          tasks.forEach((t) => {
            addDoc(collection(d, "tasks"), {
              ...t,
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

  function tutorOptions() {
    return tutors.map((tutor) => {
      return (
        <option value={tutor.id} key={tutor.id}>
          {tutor.displayName}
        </option>
      );
    });
  }

  const StandardDropdownToggle = React.forwardRef(
    ({ style, className, onClick, value, id_, selected }, ref) => (
      <>
        {selected.key !== "" ? (
          <OverlayTrigger
            placement='right'
            flip={true}
            key={id_}
            overlay={
              <Popover className=''>
                <Popover.Header>
                  {selected.key} <br />
                  {`${grades[selected.grade]} ${selected.category}: ${
                    selected.sub_category
                  }`}
                </Popover.Header>
                <Popover.Body>
                  <div className='text-decoration-underline'>Description</div>
                  {selected.description}
                </Popover.Body>
              </Popover>
            }
          >
            <Form.Control
              id={id_}
              ref={ref}
              style={{ ...style, cursor: "pointer" }}
              className={className}
              onClick={(e) => {
                e.preventDefault();
                onClick(e);
              }}
              value={value}
              onChange={() => {}}
              readOnly
            ></Form.Control>
          </OverlayTrigger>
        ) : (
          <Form.Control
            id={id_}
            ref={ref}
            style={{ ...style, cursor: "pointer" }}
            className={className}
            onClick={(e) => {
              e.preventDefault();
              onClick(e);
            }}
            defaultValue={value}
            readOnly
          ></Form.Control>
        )}
        <div className='invalid-feedback'>Please select a standard</div>
      </>
    ),
  );

  const StandardDropdown = React.forwardRef(
    ({ style, className, value, valueSetter }, ref) => {
      const [search, setSearch] = useState("");

      return (
        <div
          ref={ref}
          style={style}
          className={className}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Form.Control
            className='mx-3 my-2 w-auto'
            placeholder='Search'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
          {standards
            .filter((s) => {
              return -(
                s.key.toLowerCase().includes(search.toLowerCase()) ||
                s.category.toLowerCase().includes(search.toLowerCase()) ||
                s.sub_category.toLowerCase().includes(search.toLowerCase()) ||
                s.description.toLowerCase().includes(search.toLowerCase())
              );
            })
            .sort((a, b) => {
              return (
                a.key.split(".")[1].localeCompare(b.key.split(".")[1]) ||
                a.key.split(".")[2] - b.key.split(".")[2] ||
                a.key.split(".")[2].localeCompare(b.key.split(".")[2]) ||
                a.key.localeCompare(b.key)
              );
            })
            .map((standard, i) => {
              return (
                <OverlayTrigger
                  placement='right'
                  flip={true}
                  key={standard.id}
                  overlay={
                    <Popover className=''>
                      <Popover.Header>
                        {standard.key} <br />
                        {`${grades[standard.grade]} ${standard.category}: ${
                          standard.sub_category
                        }`}
                      </Popover.Header>
                      <Popover.Body>
                        <div className='text-decoration-underline'>
                          Description
                        </div>
                        {standard.description}
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div key={standard.id}>
                    <Form.Check
                      type={"radio"}
                      checked={
                        value === undefined ? false : value.id === standard.id
                      }
                      label={standard.key}
                      className='mx-3 my-2 w-auto'
                      onChange={(e) => {
                        valueSetter(standard);
                      }}
                    />
                  </div>
                </OverlayTrigger>
              );
            })}
          <div className='d-flex flex-column'>
            <div className='px-3 fs-6 fst-italic text-end'>
              Can't find what you're looking for?
            </div>
            <Button
              className='align-self-end'
              variant='link'
              onClick={() => {
                newStandardSelector.current = valueSetter;
                setShowNewStandardPane(true);
              }}
            >
              Find another Standard
            </Button>
          </div>
        </div>
      );
    },
  );

  const tasksList = tasks.map((task, task_idx) => {
    return (
      <Card className='mb-3' key={task_idx}>
        <Card.Header className='d-flex'>
          <div className='h5 align-self-end'>Task {task_idx + 1}</div>
          <Button
            type='button'
            variant='danger'
            className='ms-auto'
            onClick={() => {
              setTasks(tasks.filter((t, i) => i !== task_idx));
            }}
            disabled={tasks.length <= 1}
          >
            <i className='bi bi-trash-fill' />
          </Button>
        </Card.Header>
        <Card.Body className='d-flex'>
          <div className='d-flex flex-column flex-fill'>
            <div className='h5 d-flex'>
              Summary
              <OverlayTrigger
                placement='top'
                className='ms-auto'
                flip={true}
                overlay={
                  <Popover>
                    <Popover.Header>Comments</Popover.Header>
                    <Popover.Body>
                      What did the student work on? What did they do well? What
                      did they struggle with?
                      <hr />
                      <div className='text-decoration-underline'>Example</div>
                      "Worked on adding fractions with unlike denominators.
                      Struggled with finding the least common denominator."
                    </Popover.Body>
                  </Popover>
                }
              >
                <i className='bi bi-info-square ms-auto'></i>
              </OverlayTrigger>
            </div>
            <div className='d-flex card bg-light-subtle'>
              <div className='card-body'>
                <div className='d-flex flex-column'>
                  <textarea
                    id={`${task_idx}_comments`}
                    className='form-control'
                    value={task.comments}
                    onChange={(e) => {
                      setTasks(
                        tasks.map((t, i) => {
                          if (i !== task_idx) return t;
                          else return { ...t, comments: e.target.value };
                        }),
                      );
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    required
                  />
                  <div className='invalid-feedback'>
                    Please provide a brief summary for this task
                  </div>
                </div>
                {task.standards.length === 0 ? (
                  <>
                    <hr />
                    <div className='d-flex flex-column'>
                      <div className='h5 d-flex'>
                        Progression
                        <OverlayTrigger
                          placement='top'
                          overlay={
                            <Popover>
                              <Popover.Header>Progression</Popover.Header>
                              <Popover.Body>
                                How well did the student understand the
                                material?
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <i className='bi bi-info-square ms-auto ps-2'></i>
                        </OverlayTrigger>
                      </div>
                      <Form.Select
                        id={`${task_idx}_progression`}
                        style={{ width: "auto" }}
                        value={task.progression}
                        onChange={(e) => {
                          setTasks(
                            tasks.map((t, i) => {
                              if (i !== task_idx) return t;
                              else return { ...t, progression: e.target.value };
                            }),
                          );
                        }}
                      >
                        <option disabled value=''>
                          Select One
                        </option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                        <option value='3'>3</option>
                        <option value='4'>4</option>
                      </Form.Select>
                      <div className='invalid-feedback'>
                        Please set a progression for this task
                      </div>
                    </div>
                  </>
                ) : null}
                <hr />
                <div className='d-flex flex-column'>
                  <div className='h5 d-flex'>
                    Engagement
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Popover>
                          <Popover.Header>Engagement</Popover.Header>
                          <Popover.Body>
                            How well did the student work with the tutor?
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <i className='bi bi-info-square ms-auto ps-2'></i>
                    </OverlayTrigger>
                  </div>
                  <Form.Select
                    id='engagement'
                    style={{ width: "auto" }}
                    value={task.engagement}
                    onChange={(e) => {
                      setTasks(
                        tasks.map((t, i) => {
                          if (i !== task_idx) return t;
                          else return { ...t, engagement: e.target.value };
                        }),
                      );
                    }}
                  >
                    <option disabled value=''>
                      Select One
                    </option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                  </Form.Select>
                  <div className='invalid-feedback'>
                    Please set an engagement level for this task
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='vr mx-3' />
          <div className='d-flex flex-column'>
            <div className='h5'>Standards</div>
            <div className='d-flex'>
              <Card className='p-3 bg-light-subtle flex-fill justify-content-center'>
                {task.standards.length === 0 ? null : (
                  <ul className='list-group mb-3'>
                    {task.standards.map((standard, standard_idx) => {
                      return (
                        <li
                          className='list-group-item d-flex'
                          key={standard_idx}
                        >
                          <div className='d-flex flex-column justify-content-center pe-3'>
                            <Button
                              variant='danger'
                              className='ms-auto'
                              onClick={() => {
                                setTasks(
                                  tasks.map((t, i) => {
                                    if (i !== task_idx) return t;
                                    else
                                      return {
                                        ...t,
                                        standards: t.standards.filter(
                                          (s, j) => j !== standard_idx,
                                        ),
                                      };
                                  }),
                                );
                              }}
                            >
                              <i className='bi bi-trash-fill' />
                            </Button>
                          </div>
                          <div className='d-flex flex-column'>
                            <Dropdown className='pb-1'>
                              <Dropdown.Toggle
                                id_={`${task_idx}_${standard_idx}_standard`}
                                as={StandardDropdownToggle}
                                value={standard.key || "Standard"}
                                className=''
                                selected={standard}
                              />
                              <Dropdown.Menu
                                as={StandardDropdown}
                                value={standard}
                                valueSetter={(s) =>
                                  setTasks(
                                    tasks.map((t, i) => {
                                      if (i !== task_idx) return t;
                                      else {
                                        return {
                                          ...t,
                                          standards: t.standards.map(
                                            (s1, j) => {
                                              if (j !== standard_idx) return s1;
                                              else
                                                return {
                                                  ...s,
                                                  progression: s1.progression,
                                                };
                                            },
                                          ),
                                        };
                                      }
                                    }),
                                  )
                                }
                                style={{
                                  maxHeight: 350,
                                  overflow: "scroll",
                                }}
                              />
                            </Dropdown>
                            <Form.Select
                              id={`${task_idx}_${standard_idx}_progression`}
                              style={{ width: "auto" }}
                              value={standard?.progression}
                              onChange={(e) => {
                                setTasks(
                                  tasks.map((t, i) => {
                                    if (i !== task_idx) return t;
                                    else
                                      return {
                                        ...t,
                                        standards: t.standards.map((s, j) => {
                                          if (j !== standard_idx) return s;
                                          else
                                            return {
                                              ...s,
                                              progression: e.target.value,
                                            };
                                        }),
                                      };
                                  }),
                                );
                              }}
                            >
                              <option disabled value=''>
                                Progression
                              </option>
                              <option value='1'>
                                1 - Far Below Expectations
                              </option>
                              <option value='2'>2 - Below Expectations</option>
                              <option value='3'>3 - Meets Expectations</option>
                              <option value='4'>
                                4 - Exceeds Expectations
                              </option>
                            </Form.Select>
                            <div className='invalid-feedback'>
                              Please select a progression for this standard
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Button
                  variant='secondary'
                  onClick={() => {
                    setTasks(
                      tasks.map((t, i) => {
                        if (i !== task_idx) return t;
                        else
                          return {
                            ...t,
                            standards: [
                              ...t.standards,
                              {
                                key: "",
                                progression: "",
                              },
                            ],
                          };
                      }),
                    );
                  }}
                >
                  Add Standard
                </Button>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  });

  return (
    <>
      <div className='p-3 d-flex flex-column'>
        <div className='d-flex'>
          <h1 className='display-1'>New Session Evaluation</h1>
          {notes.notes && (
            <OverlayTrigger
              placment='bottom'
              trigger={"hover"}
              flip={true}
              overlay={
                <Popover>
                  <Popover.Body>
                    Click to see the "Next Session" notes from the last session
                    with {student.student_name}
                  </Popover.Body>
                </Popover>
              }
            >
              <Card
                className='w-25 ms-auto'
                style={{ cursor: "pointer" }}
                onClick={() => setShowNotes(true)}
              >
                <Card.Header>Last Session's Notes</Card.Header>
                <Card.Body>
                  <div className='text-truncate'>{notes.notes}</div>
                </Card.Body>
              </Card>
            </OverlayTrigger>
          )}
        </div>
        {/* <form onSubmit={sumbitEval}> */}
        <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
          <OverlayTrigger
            placement='right'
            trigger={"hover"}
            overlay={
              <Popover>
                <Popover.Body>
                  Click to go to {student.student_name}'s profile
                </Popover.Body>
              </Popover>
            }
          >
            <Button
              variant=''
              className='me-auto'
              size='lg'
              style={{
                "--bs-btn-padding-x": "0rem",
                "--bs-btn-padding-y": "0rem",
              }}
              onClick={() => navigate(`/students/${studentRef.current.id}`)}
            >
              <div className='text-decoration-underline h3'>
                {student.student_name}
              </div>
            </Button>
          </OverlayTrigger>
          <div className='row my-3'>
            <div className='col'>
              <label className='form-label h5'>Tutor</label>
              <Form.Select
                id='tutor'
                className='form-control'
                value={selectedTutor}
                onChange={(e) => setSelectedTutor(e.target.value)}
              >
                <option disabled value=''>
                  Select One
                </option>
                {tutorOptions()}
              </Form.Select>
              <div className='invalid-feedback'>Please select a tutor</div>
            </div>
            <div className='col'>
              <label className='form-label h5'>Date</label>
              <input
                id='date'
                className='form-control'
                type='date'
                value={evaluation.date}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, date: e.target.value })
                }
              />
              <div className='invalid-feedback'>
                Please provide a date for the evaluation
              </div>
            </div>
          </div>
          <hr />
          <div className='d-flex flex-column'>
            <div className='h4'>Tasks</div>
            <Container>{tasksList}</Container>
            <Button
              type='button'
              variant='secondary'
              className='me-auto'
              onClick={addTask}
            >
              Add Task
            </Button>
          </div>
          <hr />
          <div className='row my-3'>
            <div className='col'>
              <label className='form-label h5'>Worksheet</label>
              <Form.Select
                className='mb-2'
                defaultValue='file'
                onChange={(e) => {
                  if (e.target.value === "file") {
                    document.getElementById("worksheet").type = "file";
                    document.getElementById("worksheet").placeholder = "";
                  } else {
                    document.getElementById("worksheet").type = "url";
                    document.getElementById("worksheet").placeholder =
                      "Link to Worksheet";
                  }
                }}
              >
                <option value='file'>File Upload</option>
                <option value='url'>URL</option>
              </Form.Select>

              <input id='worksheet' className='form-control' type='file' />
              <div className='invalid-feedback'>Please provide a valid URL</div>
            </div>
            <div className='col'>
              <label className='form-label h5'>Worksheet Completion</label>
              <input
                id='worksheet_completion'
                className='form-control'
                type='text'
                value={evaluation.worksheet_completion}
                onChange={(e) =>
                  setEvaluation({
                    ...evaluation,
                    worksheet_completion: e.target.value,
                  })
                }
              />
            </div>
            <div className='col'>
              <div className='d-flex'>
                <label className='form-label h5'>Next Session Plans</label>
                <OverlayTrigger
                  placement='top'
                  overlay={
                    <Popover>
                      <Popover.Header>Next Session Plans</Popover.Header>
                      <Popover.Body>
                        List any standards or concepts that you would like the
                        student to work on during their next session
                        <hr />
                        <div className='text-decoration-underline'>Example</div>
                        "Continue working on 1.G.2 and move on to 1.G.3, working
                        on subdividing shapes"
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <i className='bi bi-info-square ms-auto'></i>
                </OverlayTrigger>
              </div>
              <textarea
                id='next_session'
                className='form-control'
                value={evaluation.next_session}
                onChange={(e) => {
                  setEvaluation({
                    ...evaluation,
                    next_session: e.target.value,
                  });
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
              />
              <div className='invalid-feedback'>
                Please enter plans for the next session
              </div>
            </div>
          </div>
        </div>
        <div className='d-flex'>
          <button
            type='button'
            className='btn btn-secondary m-3 me-auto'
            onClick={() => {
              localStorage.removeItem(`${params.studentid}_eval`);
              localStorage.removeItem(`${params.studentid}_tasks`);
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
        {/* </form> */}
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
      <Modal show={showNotes} onHide={() => setShowNotes(false)}>
        <Modal.Header>
          <Modal.Title>For {student.student_name}'s Next Session</Modal.Title>
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
                <div className='h6'>{notes.tutor}</div>
                <div className='text-secondary'>
                  {dayjs(notes.date).format("MMMM DD, YYYY")}
                </div>
              </div>
              <div className='ms-auto align-self-center'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => navigate(`/eval/${notes.id}`)}
                >
                  Previous Evaluation{" "}
                  <i className='ms-auto ps-1 bi bi-box-arrow-up-right'></i>
                </Button>
              </div>
            </div>
            <hr />
            <div className='h5'>Notes</div>
            <div className=''>{notes.notes}</div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewStudentEval;
