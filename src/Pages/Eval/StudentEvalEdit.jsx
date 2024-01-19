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
  Dropdown,
  Form,
  InputGroup,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
  Table,
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
                  t
                    .data()
                    .standards?.map((standardId) =>
                      getDoc(doc(db, "standards", standardId)),
                    ) || [];
                const standardsData = await Promise.all(standardPromises);
                const standards = standardsData.map((s) => ({
                  ...s.data(),
                  id: s.id,
                }));
                compiledTasks[i] = {
                  ...t.data(),
                  id: t.id,
                  standards: standards,
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
                task.standards?.map((standardId) => {
                  if (standardId === "") return Promise.resolve(null);
                  return getDoc(doc(db, "standards", standardId)).then(
                    (standard) => {
                      return {
                        ...standard.data(),
                        id: standard.id,
                      };
                    },
                  );
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
      if (
        (tasks[i].progression && tasks[i].progression <= 2) ||
        tasks[i].engagement <= 2
      ) {
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

  async function sumbitEval(e) {
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
      addToast({
        header: "No Tutor Selected",
        message: "Please select a tutor before submitting",
      });
      clean = false;
    }

    tasks.forEach((t, i) => {
      if (t.subject === "") {
        document.getElementById(`${i}_subject`).classList.add("is-invalid");
        addToast({
          header: "Missing Subject",
          message: "Please select a subject for all tasks",
        });
        clean = false;
      }
      t.standards.forEach((s) => {
        if (t.subject !== s.category && t.subject !== "Other") {
          document.getElementById(`${i}_subject`).classList.add(`is-invalid`);
          addToast({
            header: "Subject and Standard Mismatch",
            message: (
              <>
                Subject and standard mismatch for task {i + 1} ({s.key} is a{" "}
                {s.category} standard)
              </>
            ),
          });
          clean = false;
        }
      });
      if (t.comments === "") {
        document.getElementById(`${i}_comments`).classList.add("is-invalid");
        addToast({
          header: "Missing Comments",
          message: "Please enter comments for all tasks",
        });
        clean = false;
      }
    });

    if (evaluation.next_session === "") {
      document.getElementById("next_session").classList.add("is-invalid");
      addToast({
        header: "Missing Next Session Plans",
        message: "Please enter plans for the next session",
      });
      clean = false;
    }

    if (!clean) return;

    localStorage.removeItem(`${params.evalid}`);
    localStorage.removeItem(`${params.evalid}_tasks`);

    let tutorName =
      tutors.find((t) => t.id === selectedTutor)?.data().displayName || "";

    let evalUpload = evaluation;

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

    const worksheetUpload = document.getElementById("worksheet").files[0];

    if (worksheetUpload) {
      if (evaluation?.worksheet !== "" && evaluation?.worksheet !== undefined) {
        deleteObject(ref(storage, evaluation?.worksheet));
      }

      const worksheetRef = ref(storage, `worksheets/${worksheetUpload.name}`);

      await uploadBytes(worksheetRef, worksheetUpload).then(() => {
        // setEvaluation({ ...evaluation, worksheet: worksheetRef.fullPath });
        evalUpload.worksheet = worksheetRef.fullPath;
      });
    } else {
      evalUpload.worksheet = evaluation?.worksheet;
    }

    updateDoc(evalRef.current, evalUpload)
      .then(() => {
        tasks.forEach((t) => {
          let { id: _, standard: __, ...rest } = t;
          console.log(t.standards);
          if (t.id === undefined) {
            addDoc(collection(evalRef.current, "tasks"), {
              ...rest,
              standards: t.standards.map((s) => s.id),
              progression: t.standards.length === 0 ? "" : t.progression,
            });
          } else {
            setDoc(doc(db, "evaluations", evalRef.current.id, "tasks", t.id), {
              ...rest,
              standards: t.standards.map((s) => s.id),
              progression: t.standards.length === 0 ? "" : t.progression,
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

  function standardsLabel(standards) {
    if (standards.length === 0) return "None";
    else if (standards.length === 1) return standards[0].key;
    else return `${standards[0].key} +${standards.length - 1} more`;
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
        value={standardsLabel(value)}
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
            checked={value.length === 0}
            label={"None"}
            className='mx-3 my-2 w-auto'
            onChange={(e) => {
              if (e.target.checked) {
                valueSetter([]);
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
                      // type={"radio"}
                      checked={
                        value === undefined
                          ? false
                          : value.some((s) => s.key === standard.key)
                      }
                      label={standard.key}
                      className='mx-3 my-2 w-auto'
                      onChange={(e) => {
                        if (e.target.checked) {
                          valueSetter([...value, standard]);
                        } else {
                          valueSetter(
                            value.filter((s) => s.id !== standard.id),
                          );
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
              onClick={() => setShowNewStandardPane(true)}
            >
              Find another Standard
            </Button>
          </div>
        </div>
      );
    },
  );

  const tasksList = tasks.map((task, idx) => {
    return (
      <tr className='my-3' key={idx}>
        <td className='align-middle'>
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
        <td className='align-middle'>
          <Form.Select
            id={`${idx}_subject`}
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
        <td className='align-middle'>
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
                value={task.standards}
              />
              <Dropdown.Menu
                as={StandardDropdown}
                value={task.standards}
                valueSetter={(s) =>
                  setTasks(
                    tasks.map((t, i) => {
                      if (i !== idx) return t;
                      else return { ...t, standards: s || [] };
                    }),
                  )
                }
              />
            </Dropdown>
          </InputGroup>
        </td>
        <td className='align-middle'>
          <Form.Select
            value={task.standards.length === 0 ? "" : task.progression}
            disabled={task.standards.length === 0}
            onChange={(e) =>
              setTasks(
                tasks.map((t, i) => {
                  if (i !== idx) return t;
                  else return { ...t, progression: e.target.value };
                }),
              )
            }
          >
            <option disabled value=''></option>
            <option value='1'>1 - Far Below Expectations</option>
            <option value='2'>2 - Below Expectations</option>
            <option value='3'>3 - Meets Expectations</option>
            <option value='4'>4 - Exceeds Expectations</option>
          </Form.Select>
        </td>
        <td className='align-middle'>
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
                  if (i !== idx) return t;
                  else return { ...t, engagement: e.target.value };
                }),
              )
            }
          />
        </td>
        <td className='align-middle'>
          <textarea
            id={`${idx}_comments`}
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
          <Row className='d-flex flex-column'>
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
                      <th>
                        <div className='d-flex'>
                          Progression
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Popover>
                                <Popover.Header>Progression</Popover.Header>
                                <Popover.Body>
                                  Rate the student's mastery of the standard
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <i className='bi bi-info-square ms-auto'></i>
                          </OverlayTrigger>
                        </div>
                      </th>
                      <th>
                        <div className='d-flex'>
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
                      </th>
                      <th className='d-flex'>
                        <div className='d-flex'>
                          Comments
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Popover>
                                <Popover.Header>Comments</Popover.Header>
                                <Popover.Body>
                                  What did the student work on? What did they do
                                  well? What did they struggle with?
                                  <hr />
                                  <div className='text-decoration-underline'>
                                    Example
                                  </div>
                                  "Worked on adding fractions with unlike
                                  denominators. Struggled with finding the least
                                  common denominator."
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <i className='bi bi-info-square ms-auto'></i>
                          </OverlayTrigger>
                        </div>
                      </th>
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
              <input id='worksheet' className='form-control' type='file' />
              <div className='p-1 text-muted fst-italic'>
                Uploading a new worksheet will override the old one.
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
      <Offcanvas
        show={showNewStandardPane}
        onHide={() => setShowNewStandardPane(false)}
        placement='end'
        style={{ width: "75%" }}
      >
        <TrackStandard
          standards={standards}
          setStandards={setStandards}
          close={() => setShowNewStandardPane(false)}
        />
      </Offcanvas>
    </>
  );
};

export default StudentEvalEdit;
