import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

import { auth, db, storage } from "../../Services/firebase";
import dayjs from "dayjs";
import { ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "../../Services/toast";
import {
  Button,
  Dropdown,
  InputGroup,
  Table,
  Form,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";

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

  const addToast = useContext(ToastContext);

  const params = useParams();

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
            standard: "",
            progression: "5",
            engagement: "5",
            comments: "",
          },
        ],
  );

  const studentRef = useRef(doc(db, "students", params.studentid));

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(
      doc(db, "students", params.studentid),
      (doc) => {
        setStudent({ ...doc.data(), id: doc.id });
      },
    );

    const unsubscribeStudentStandards = onSnapshot(
      collection(doc(db, "students", params.studentid), "standards"),
      (snapshot) => {
        let compiledStandards = [];
        Promise.all(
          snapshot.docs.map(async (s) => {
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
      },
    );

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
      unsubscribeStudentStandards();
      unsubscribeTutors();
    };
  }, [params.studentid]);

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
        standard: "",
        progression: "5",
        engagement: "5",
        comments: "",
      },
    ]);
  }

  function sumbitEval(e) {
    e.preventDefault();

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    let tutorName;
    tutors.forEach((tutor) => {
      if (tutor.id === document.getElementById("tutor").value)
        tutorName = tutor.displayName;
    });

    const worksheetUpload = document.getElementById("worksheet").files[0];

    if (worksheetUpload) {
      const worksheetRef = ref(storage, `worksheets/${worksheetUpload.name}`);

      uploadBytes(worksheetRef, worksheetUpload).then(() =>
        addDoc(collection(db, "evaluations"), {
          ...evaluation,
          student_id: studentRef.current.id,
          student_name: student.student_name,
          tutor_id: selectedTutor,
          tutor_name: tutorName,
          owner: auth.currentUser.uid,
          worksheet: worksheetRef.fullPath,
          flagged: document
            .getElementById("flagForReview")
            .classList.contains("btn-outline-danger"),
        })
          .then((doc) => {
            tasks.forEach((t) =>
              addDoc(collection(doc, "tasks"), {
                ...t,
                standard: t.standard?.id || "",
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
        flagged: document
          .getElementById("flagForReview")
          .classList.contains("btn-outline-danger"),
      })
        .then((d) => {
          tasks.forEach((t) =>
            addDoc(collection(d, "tasks"), {
              ...t,
              standard: t.standard?.id || "",
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

  // const standardOptions = standards.sort((a,b) => {
  //   return (
  //     a.key.split('.')[1].localeCompare(b.key.split('.')[1]) ||
  //     a.key.split('.')[2] - b.key.split('.')[2] ||
  //     a.key.split('.')[2].localeCompare(b.key.split('.')[2]) ||
  //     a.key.localeCompare(b.key)
  //   )}).map((s, i) => {
  //     return (
  //       <option value={s.id} key={s.id}>{s.key}</option>
  //     );
  // });

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
              onClick={() => navigate(`/standard/new/${studentRef.current.id}`)}
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
        <td className='align-middle text-center'>
          <Button
            type='button'
            variant='danger'
            onClick={() => {
              setTasks(tasks.filter((t, i) => i !== idx));
            }}
            disabled={tasks.length <= 1}
          >
            <i className='bi bi-trash-fill' />
          </Button>
        </td>
        <td className='align-middle'>
          {/* <input id="subject" className="form-control" type="text"
            value={task.subject} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return { ...t, subject: e.target.value };
            }))} required /> */}
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
        <td className='align-middle'>
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
                style={{ maxHeight: 350, overflow: "scroll" }}
              />
            </Dropdown>
          </InputGroup>
        </td>
        <td className='align-middle'>
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
        <td className='align-middle'>
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
            placeholder='Worked on...'
            data-toggle='tooltip'
            title={`What you worked on with ${student.student_name} as it relates to this particular task`}
            required
          />
        </td>
      </tr>
    );
  });

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='display-1'>New Session Evaluation</h1>
      {/* <form onSubmit={sumbitEval}> */}
      <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
        <div
          className='h3'
          data-toggle='tooltip'
          title='Contact an administrator if this is incorrect'
        >
          {student.student_name}
        </div>
        <div className='row my-3'>
          <div className='col'>
            <label className='form-label h5'>Tutor</label>
            <select
              id='tutor'
              className='form-control'
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
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
              value={evaluation.date}
              onChange={(e) =>
                setEvaluation({ ...evaluation, date: e.target.value })
              }
            />
          </div>
        </div>
        <hr />
        <div className='d-flex flex-column'>
          <div className='h5'>Tasks</div>
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
            onClick={addTask}
          >
            Add Task
          </Button>
        </div>
        <hr />
        <div className='row my-3'>
          <div className='col'>
            <label className='form-label h5'>Worksheet</label>
            <input id='worksheet' className='form-control' type='file' />
          </div>
          <div className='col'>
            <label className='form-label h5'>Worksheet Completion</label>
            <input
              id='worksheet_completion'
              className='form-control'
              type='text'
              placeholder='Finished...'
              data-toggle='tooltip'
              title={`If you uploaded a worksheet, how far did the student get?`}
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
            <label className='form-label h5'>Next Session Plans</label>
            <textarea
              id='next_session'
              className='form-control'
              placeholder='Continue...'
              data-toggle='tooltip'
              title={`What you plan to work on next time, or notes for the next tutor`}
              value={evaluation.next_session}
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
          onClick={() => navigate(-1)}
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

export default NewStudentEval;
