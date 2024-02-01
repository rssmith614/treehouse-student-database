import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import history from "history/browser";

import { db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
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
        // console.log(uniqueStandards);
        setStandards(uniqueStandards);
      });
    });

    return () => {
      unsubscribeEvals();
    };
  }, [student]);

  useEffect(() => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].engagement <= 2) {
        document.getElementById("flagForReview").classList.remove("d-none");
        return;
      }
      for (let j = 0; j < tasks[i].standards.length; j++) {
        if (tasks[i].standards[j].progression <= 2) {
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
      // addToast({
      //   header: "No Tutor Selected",
      //   message: "Please select a tutor before submitting",
      // });
      clean = false;
    }

    tasks.forEach((t, i) => {
      if (t.comments === "") {
        document.getElementById(`${i}_comments`).classList.add(`is-invalid`);
        // addToast({
        //   header: "Missing Summary",
        //   message: "Please enter a summary for all tasks",
        // });
        clean = false;
      }
      t.standards.forEach((s, standard_i) => {
        console.log(i, s, standard_i);
        if (s.key === "") {
          document
            .getElementById(`${i}_${standard_i}_standard`)
            .classList.add(`is-invalid`);
          // addToast({
          //   header: "Missing Standard",
          //   message: "Please select a standard",
          // });
          clean = false;
        }
      });
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      // addToast({
      //   header: "Missing Next Session Plans",
      //   message: "Please enter plans for the next session",
      // });
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
    // setEvaluation({
    //   ...evaluation,
    //   tutor_id: selectedTutor,
    //   tutor_name: tutorName,
    // });

    if (
      document
        .getElementById("flagForReview")
        .classList.contains("btn-outline-danger") &&
      !document.getElementById("flagForReview").classList.contains("d-none")
    ) {
      // setEvaluation({ ...evaluation, flagged: true });
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
          // setEvaluation({ ...evaluation, worksheet: worksheetRef.fullPath });
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
              standards: t.standards.map((s) => {
                return { id: s.id, progression: s.progression };
              }),
            });
          } else {
            setDoc(doc(db, "evaluations", evalRef.current.id, "tasks", t.id), {
              ...rest,
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

  function tutorOptions() {
    return tutors.map((tutor) => {
      let tutorData = tutor.data();
      return (
        <option value={tutor.id} key={tutor.id}>
          {tutorData.displayName}
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
              defaultValue={value}
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
                setShowNewStandardPane(true);
                newStandardSelector.current = valueSetter;
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
      <Col className='d-flex flex-column' key={task_idx}>
        <Card className='mb-3 flex-fill'>
          <Card.Header className='d-flex'>
            <div className='h5 align-self-end'>Task {task_idx + 1}</div>
            <Button
              type='button'
              variant='danger'
              className='ms-auto'
              onClick={() => {
                setTasks(tasks.filter((t, i) => i !== task_idx));
                if (task.id) setTasksToDelete([...tasksToDelete, task.id]);
              }}
              disabled={tasks.length <= 1}
            >
              <i className='bi bi-trash-fill' />
            </Button>
          </Card.Header>
          <Card.Body className='d-flex'>
            <div className='d-flex flex-column mw-0 me-3'>
              <div className='h5 d-flex'>
                Summary
                <OverlayTrigger
                  placement='top'
                  className='ms-auto'
                  overlay={
                    <Popover>
                      <Popover.Header>Comments</Popover.Header>
                      <Popover.Body>
                        What did the student work on? What did they do well?
                        What did they struggle with?
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
                      onMouseOver={(e) => {
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
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
                    <input
                      id='engagement'
                      className='form-control'
                      type='number'
                      min='1'
                      max='4'
                      step='1'
                      value={task.engagement}
                      onChange={(e) =>
                        setTasks(
                          tasks.map((t, i) => {
                            if (i !== task_idx) return t;
                            else return { ...t, engagement: e.target.value };
                          }),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='vr' />
            <div className='d-flex flex-column ps-3'>
              <div className='h5'>Standards</div>
              <Card className='p-3 bg-light-subtle'>
                {task.standards.length === 0 ? null : (
                  <ul className='list-group mb-3'>
                    {task.standards.map((standard, standard_idx) => {
                      return (
                        <li
                          key={standard_idx}
                          className='list-group-item d-flex'
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
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Col className=''>
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
                                  progression: "4",
                                },
                              ],
                            };
                        }),
                      );
                    }}
                  >
                    Add Standard
                  </Button>
                </Col>
              </Card>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  return (
    <>
      <div className='p-3 d-flex flex-column'>
        <h1 className='display-1'>Edit Session Evaluation</h1>
        {/* <form onSubmit={sumbitEval}> */}
        <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
          <div
            className='h3'
            data-toggle='tooltip'
            title='Contact an administrator if this is incorrect'
          >
            {evaluation?.student_name}
          </div>
          <div className='row my-3'>
            <div className='col'>
              <label className='form-label h5'>Tutor</label>
              <select
                id='tutor'
                className='form-control'
                value={selectedTutor || ""}
                onChange={(e) => setSelectedTutor(e.target.value)}
                required
              >
                <option disabled value=''>
                  Select One
                </option>
                {tutorOptions()}
              </select>
            </div>
            <div className='invalid-feedback'>Please select a tutor</div>
            <div className='col'>
              <label className='form-label h5'>Date</label>
              <input
                id='date'
                className='form-control'
                type='date'
                value={evaluation?.date || ""}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, date: e.target.value })
                }
              />
            </div>
          </div>
          <div className='invalid-feedback'>
            Please provide a date for the evaluation
          </div>
          <hr />
          <div className='h5'>Tasks</div>
          <Row className='d-flex flex-column'>
            {loading ? (
              <div className='spinner-border align-self-center' />
            ) : (
              <div className='d-flex flex-column'>
                <Container>
                  <Row xs={{ cols: "auto" }}>{tasksList}</Row>
                </Container>
                <Button
                  type='button'
                  variant='secondary'
                  className='me-auto'
                  onClick={() =>
                    setTasks([
                      ...tasks,
                      {
                        subject: "",
                        standards: [],
                        progression: "",
                        engagement: "4",
                        comments: "",
                      },
                    ])
                  }
                >
                  Add Task
                </Button>
              </div>
            )}
          </Row>
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
              {evaluation?.worksheet !== "" &&
              evaluation?.worksheet !== null ? (
                <div className='p-1 text-secondary fst-italic fs-6'>
                  Uploading a new worksheet will override the old one.
                </div>
              ) : null}
            </div>
            <div className='col'>
              <label className='form-label h5'>Worksheet Completion</label>
              <input
                id='worksheet_completion'
                className='form-control'
                type='text'
                value={evaluation?.worksheet_completion || ""}
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
                value={evaluation?.next_session}
                onMouseOver={(e) => {
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
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
    </>
  );
};

export default StudentEvalEdit;
