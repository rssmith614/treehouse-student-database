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
} from "firebase/firestore";

import history from "history/browser";

import { db, storage } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import {
  Button,
  Dropdown,
  Form,
  InputGroup,
  OverlayTrigger,
  Popover,
  Row,
  Table,
} from "react-bootstrap";
import { deleteObject, ref } from "firebase/storage";

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

  const addToast = useContext(ToastContext);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeEval = onSnapshot(evalRef.current, (res) => {
      if (!res.exists()) return;
      if (localStorage.getItem(`${params.evalid}`)) {
        setEvaluation(JSON.parse(localStorage.getItem(`${params.evalid}`)));
      } else {
        setEvaluation(res.data());
      }
      setSelectedTutor(res.data().tutor_id);
      getDocs(
        collection(doc(db, "students", res.data().student_id), "standards"),
      ).then((subCollStandards) => {
        let compiledStandards = [];
        Promise.all(
          subCollStandards.docs.map(async (s) => {
            return getDoc(doc(db, "standards", s.id)).then((standard) => {
              compiledStandards.push({
                ...s.data(),
                ...standard.data(),
                id: standard.id,
              });
            });
          }),
        ).then(() => {
          setStandards(compiledStandards);
        });
      });
    });

    const unsubscribeTutors = onSnapshot(collection(db, "tutors"), (res) =>
      setTutors(res.docs),
    );

    const unsubscribeTasks = onSnapshot(
      collection(evalRef.current, "tasks"),
      (res) => {
        if (localStorage.getItem(`${params.evalid}_tasks`)) {
          setTasks(JSON.parse(localStorage.getItem(`${params.evalid}_tasks`)));
          setLoading(false);
        } else {
          let compiledTasks = new Array(res.docs.length);
          Promise.all(
            res.docs.map(async (t, i) => {
              if (t.data().standard === "")
                return (compiledTasks[i] = { ...t.data(), id: t.id });
              else
                return getDoc(doc(db, "standards", t.data().standard)).then(
                  (s) => {
                    compiledTasks[i] = {
                      ...t.data(),
                      id: t.id,
                      standard: { ...s.data(), id: s.id },
                    };
                  },
                );
            }),
          )
            .then(() => {
              compiledTasks.sort((a, b) => {
                let a_standard = a.standard.key || "0.0.0";
                let b_standard = b.standard.key || "0.0.0";
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
  }, [params.evalid]);

  useEffect(() => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].progression <= 2 || tasks[i].engagement <= 2) {
        document.getElementById("flagForReview").classList.remove("d-none");
        return;
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

  function sumbitEval(e) {
    e.preventDefault();

    if (!selectedTutor) {
      addToast({
        header: "No Tutor Selected",
        message: "Please select a tutor before submitting",
      });
      return;
    }

    try {
      tasks.forEach((t) => {
        if (t.subject === "") {
          addToast({
            header: "Missing Subject",
            message: "Please select a subject for all tasks",
          });
          throw new Error();
        }
        if (t.comments === "") {
          addToast({
            header: "Missing Comments",
            message: "Please enter comments for all tasks",
          });
          throw new Error();
        }
      });
    } catch (e) {
      return;
    }

    if (evaluation.next_session === "") {
      addToast({
        header: "Missing Next Session Plans",
        message: "Please enter plans for the next session",
      });
      return;
    }

    localStorage.removeItem(`${params.evalid}`);
    localStorage.removeItem(`${params.evalid}_tasks`);

    let tutorName =
      tutors.find((t) => t.id === selectedTutor)?.data().displayName || "";

    // const newEval = {
    //   student_id: evaluation?.student_id, // not mutable
    //   student_name: evaluation?.student_name, // not mutable
    //   tutor_id: document.getElementById("tutor").value,
    //   tutor_name: tutorName,
    //   date: document.getElementById("date").value,
    //   worksheet_completion: document.getElementById("worksheet_completion")
    //     .value,
    //   next_session: document.getElementById("next_session").value,
    //   owner: evaluation?.owner, // not mutable
    // };

    setEvaluation({
      ...evaluation,
      tutor_id: selectedTutor,
      tutor_name: tutorName,
    });

    if (
      document
        .getElementById("flagForReview")
        .classList.contains("btn-outline-danger")
    ) {
      // newEval.flagged = true;
      setEvaluation({ ...evaluation, flagged: true });
    }

    updateDoc(evalRef.current, evaluation)
      .then(() => {
        tasks.forEach((t) => {
          let { id: _, ...rest } = t;
          if (t.id === undefined) {
            addDoc(collection(evalRef.current, "tasks"), {
              ...rest,
              standard: t.standard?.id || "",
            });
          } else {
            setDoc(doc(db, "evaluations", evalRef.current.id, "tasks", t.id), {
              ...rest,
              standard: t.standard?.id || "",
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
      .then(() => navigate(`/eval/${evalRef.current.id}`));
  }

  async function handleDelete() {
    if (
      window.confirm(
        `You are about to DELETE this evaluation for ${evaluation?.student_name}. Are you sure you want to do this?`,
      )
    ) {
      if (evaluation?.worksheet !== "" && evaluation?.worksheet !== undefined) {
        await deleteObject(ref(storage, evaluation?.worksheet));
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
    ({ style, className, onClick, value }, ref) => (
      <Form.Control
        ref={ref}
        style={{ ...style, cursor: "pointer" }}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        // onChange={(e) => console.log(e)}
        value={value?.key || "None"}
        readOnly
      ></Form.Control>
    ),
  );

  const StandardDropdown = React.forwardRef(
    ({ style, className, value, valueSetter }, ref) => {
      const [search, setSearch] = useState("");

      return (
        <div
          ref={ref}
          style={{ ...style, ...{ maxHeight: "50vh", overflowY: "auto" } }}
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
          <Form.Check
            key={0}
            type={"radio"}
            checked={!value}
            label={"None"}
            className='mx-3 my-2 w-auto'
            onChange={(e) => {
              if (e.target.checked) {
                valueSetter(null);
              }
            }}
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
                      checked={value.id === standard.id}
                      label={standard.key}
                      className='mx-3 my-2 w-auto'
                      onChange={(e) => {
                        if (e.target.checked) {
                          valueSetter(standard);
                        }
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
              onClick={() =>
                navigate(`/standard/new/${evaluation?.student_id}`)
              }
            >
              Track new standards
            </Button>
          </div>
        </div>
      );
    },
  );

  const tasksList = tasks.map((task, idx) => {
    return (
      <tr className='my-3' key={idx}>
        <td>
          <Button
            type='button'
            variant='danger'
            onClick={() => {
              setTasks(tasks.filter((t, i) => i !== idx));
              if (task.id) setTasksToDelete([...tasksToDelete, task.id]);
            }}
            disabled={tasks.length <= 1}
          >
            <i className='bi bi-trash-fill' />
          </Button>
        </td>
        <td>
          <Form.Select
            id='subject'
            className='form-control'
            value={task.subject}
            onChange={(e) =>
              setTasks(
                tasks.map((t, i) => {
                  if (i !== idx) return t;
                  else return { ...t, subject: e.target.value };
                }),
              )
            }
            required
          >
            <option disabled value=''>
              Select One
            </option>
            <option value='Math'>Math</option>
            <option value='Reading'>Reading</option>
            <option value='Other'>Other</option>
          </Form.Select>
        </td>
        <td>
          {/* <select id="standard" className="form-control"
            value={task.standard} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return { ...t, standard: e.target.value };
            }))}>
            <option value=''>None</option>
            {standardOptions}
          </select> */}
          <InputGroup>
            <Dropdown>
              <Dropdown.Toggle
                as={StandardDropdownToggle}
                value={task.standard}
              />
              <Dropdown.Menu
                as={StandardDropdown}
                value={task.standard}
                valueSetter={(s) =>
                  setTasks(
                    tasks.map((t, i) => {
                      if (i !== idx) return t;
                      else return { ...t, standard: s || "" };
                    }),
                  )
                }
              />
            </Dropdown>
          </InputGroup>
        </td>
        <td>
          <input
            id='progression'
            className='form-control'
            type='number'
            min='1'
            max='5'
            step='1'
            value={task.progression}
            onChange={(e) =>
              setTasks(
                tasks.map((t, i) => {
                  if (i !== idx) return t;
                  else return { ...t, progression: e.target.value };
                }),
              )
            }
          />
        </td>
        <td>
          <input
            id='engagement'
            className='form-control'
            type='number'
            min='1'
            max='5'
            step='1'
            value={task.engagement}
            onChange={(e) =>
              setTasks(
                tasks.map((t, i) => {
                  if (i !== idx) return t;
                  else return { ...t, engagement: e.target.value };
                }),
              )
            }
          />
        </td>
        <td>
          <textarea
            id='comments'
            className='form-control'
            value={task.comments}
            onChange={(e) =>
              setTasks(
                tasks.map((t, i) => {
                  if (i !== idx) return t;
                  else return { ...t, comments: e.target.value };
                }),
              )
            }
          />
        </td>
      </tr>
    );
  });

  return (
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
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              required
            >
              <option disabled value=''>
                Select One
              </option>
              {tutorOptions()}
            </select>
          </div>
          <div className='col'>
            <label className='form-label h5'>Date</label>
            <input
              id='date'
              className='form-control'
              type='date'
              value={evaluation?.date}
              onChange={(e) =>
                setEvaluation({ ...evaluation, date: e.target.value })
              }
            />
          </div>
        </div>
        <hr />
        <div className='h5'>Tasks</div>
        <Row className='d-flex px-3'>
          {loading ? (
            <div className='spinner-border align-self-center' />
          ) : (
            <div className='d-flex flex-column'>
              <Table striped>
                <thead>
                  <tr>
                    <th></th>
                    <th>Subject</th>
                    <th>Standard</th>
                    <th>Progression</th>
                    <th>Engagement</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>{tasksList}</tbody>
              </Table>
              <Button
                type='button'
                variant='secondary'
                className='me-auto'
                onClick={() =>
                  setTasks([
                    ...tasks,
                    {
                      subject: "",
                      standard: "",
                      progression: "5",
                      engagement: "5",
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
            {/* <input id="worksheet" className="form-control" type="file" /> */}
            <div>
              What to put here? Link to existing file? Ability to overwrite?
              ...?
            </div>
          </div>
          <div className='col'>
            <label className='form-label h5'>Worksheet Completion</label>
            <input
              id='worksheet_completion'
              className='form-control'
              type='text'
              value={evaluation?.worksheet_completion}
              onChange={(e) =>
                setEvaluation({
                  ...evaluation,
                  worksheet_completion: e.target.value,
                })
              }
            />
          </div>
          <div className='col'>
            <label className='form-label h5'>Next Session Plans</label>
            <textarea
              id='next_session'
              className='form-control'
              value={evaluation?.next_session}
              onChange={(e) =>
                setEvaluation({ ...evaluation, next_session: e.target.value })
              }
            />
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
          variant='danger'
          className='m-3 ms-auto'
          type='button'
          onClick={handleDelete}
        >
          Delete
        </Button>
        <button className='btn btn-primary m-3' onClick={sumbitEval}>
          Submit
        </button>
      </div>
      {/* </form> */}
      <Button
        variant='danger'
        className='mx-3 ms-auto'
        id='flagForReview'
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
  );
};

export default StudentEvalEdit;
