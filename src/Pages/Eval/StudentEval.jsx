import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useContext, useMemo } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { auth, db, storage } from "../../Services/firebase";
import { AbilityContext, Can } from "../../Services/can";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Button,
  Card,
  Col,
  Container,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { Eval } from "../../Services/defineAbility";
import { ToastContext } from "../../Services/toast";
import { useAbility } from "@casl/react";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { sendEvalOwnershipRequestEmail } from "../../Services/email";

const progressions = {
  1: "1 - Far Below Expectations",
  2: "2 - Below Expectations",
  3: "3 - Meets Expectations",
  4: "4 - Exceeds Expectations",
  "": "N/A",
};

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

const StudentEval = () => {
  const [evaluation, setEvaluation] = useState({});
  const [tasks, setTasks] = useState([]);
  const [evalOwnerName, setEvalOwnerName] = useState("");

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false); // For ownership request

  const [worksheets, setWorksheets] = useState([]);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));

  const navigate = useNavigate();

  const addToast = useContext(ToastContext);
  const ability = useAbility(AbilityContext);

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  // scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribeEval = onSnapshot(evalRef.current, async (res) => {
      setEvaluation(res.data());
      await getDoc(doc(db, "tutors", res.data().owner)).then((owner) => {
        setEvalOwnerName(owner.data().displayName);
      });

      if (res.data().worksheets) {
        const worksheetPromises = res
          .data()
          .worksheets.map(async (worksheet) => {
            if (worksheet.type === "file") {
              try {
                let worksheetRef = ref(storage, worksheet.path);
                let url = await getDownloadURL(worksheetRef);
                return {
                  path: worksheetRef.name,
                  downloadUrl: url,
                  type: "file",
                  completion: worksheet.completion,
                };
              } catch (err) {
                return {
                  link: worksheet.link,
                  type: "url",
                  completion: worksheet.completion,
                };
              }
            } else {
              return {
                link: worksheet.link,
                type: "url",
                completion: worksheet.completion,
              };
            }
          });
        const worksheetsData = await Promise.all(worksheetPromises);
        setWorksheets([...worksheetsData]);
      }

      if (res.data().worksheet === "" || !res.data().worksheet) return;

      try {
        let worksheetRef = ref(storage, res.data().worksheet);
        let url = await getDownloadURL(worksheetRef);
        setWorksheets([
          {
            path: res.data().worksheet,
            downloadUrl: url,
            type: "file",
            completion: res.data().worksheet_completion,
          },
        ]);
      } catch (err) {
        setWorksheets([
          {
            link: res.data().worksheet,
            type: "url",
            completion: res.data().worksheet_completion,
          },
        ]);
      }
    });

    const unsubscribeTasks = onSnapshot(
      collection(evalRef.current, "tasks"),
      (res) => {
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
                    progression: standard?.progression || t.data().progression,
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
        ).then(() => {
          compiledTasks.sort((a, b) => {
            return a.idx - b.idx || 0;
          });
          setTasks(compiledTasks);
          setLoading(false);
        });
      },
    );

    return () => {
      unsubscribeEval();
      unsubscribeTasks();
    };
  }, [params.evalid]);

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise();
    }
  }, [tasks]);

  const tasksList = tasks.map((task, task_idx) => {
    return (
      <Col className='d-flex w-100 flex-column' key={task_idx}>
        <Card className='mb-3 flex-fill' key={task_idx}>
          <Card.Header>Task {task_idx + 1}</Card.Header>
          <Card.Body className={"d-flex" + (!isDesktop ? " flex-column" : "")}>
            <div className='d-flex flex-column flex-fill'>
              <div className='h5 d-flex'>Summary</div>
              <div className='d-flex card bg-light-subtle'>
                {/* <div className='card-header'>Comments</div> */}
                <div className='card-body'>
                  <div className='d-flex flex-column'>
                    <div
                      className='text-break'
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {task.comments}
                    </div>
                  </div>
                  <hr />
                  {task.standards.length === 0 ? (
                    <>
                      <div className='d-flex flex-column'>
                        <div className='fst-italic'>
                          Progression: {task.progression}/4
                        </div>
                      </div>
                    </>
                  ) : null}
                  <div className='d-flex flex-column'>
                    <div className='fst-italic'>
                      Engagement: {task.engagement}/4
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {task.standards.length === 0 ? (
              <></>
            ) : (
              <>
                {isDesktop ? <div className='vr mx-3' /> : <hr />}
                <div className='d-flex flex-column'>
                  <div className='h5'>Standards</div>
                  <div className='d-flex'>
                    <Card className='p-3 bg-light-subtle'>
                      <ul className='list-group'>
                        {task.standards.map((standard, standard_idx) => {
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
                              <li className='list-group-item d-flex'>
                                <div className='mx-2'>
                                  <div className='fw-bold'>{standard.key}</div>
                                  <div
                                    className={isDesktop ? "text-nowrap" : ""}
                                  >
                                    {progressions[standard.progression]}
                                  </div>
                                </div>
                              </li>
                            </OverlayTrigger>
                          );
                        })}
                      </ul>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  });

  const evalInstance = useMemo(() => new Eval(evaluation), [evaluation]);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='display-1'>Session Evaluation</h1>
      <div className='d-flex flex-fill card p-3 bg-light-subtle'>
        <div className='row mt-3'>
          <div className='col'>
            <label className='form-label h5 text-decoration-underline'>
              Student
            </label>
            <br />
            <button
              className='btn btn-link me-auto h3 link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-nowrap'
              data-toggle='tooltip'
              title={"View " + evaluation.student_name + "'s Profile"}
              style={{ cursor: "pointer", "--bs-btn-padding-x": "0px" }}
              onClick={() => navigate(`/students/${evaluation.student_id}`)}
            >
              {evaluation.student_name}
            </button>
          </div>
          <div className='col'>
            <label className='form-label h5 text-decoration-underline'>
              Tutor
            </label>
            <br />
            {ability.can("view", "Tutor") && evaluation.tutor_id !== "" ? (
              <button
                id='tutor'
                className='btn btn-link h6 link-underline link-underline-opacity-0 link-underline-opacity-75-hover text-nowrap'
                data-toggle='tooltip'
                title={"View " + evaluation.tutor_name + "'s Profile"}
                style={{ cursor: "pointer", "--bs-btn-padding-x": "0px" }}
                onClick={() => navigate(`/tutor/${evaluation.tutor_id}`)}
              >
                {evaluation.tutor_name}
              </button>
            ) : (
              <div id='tutor' className='h6 text-nowrap'>
                {evaluation.tutor_name}
              </div>
            )}
          </div>
          <div className='col'>
            <label className='form-label h5 text-decoration-underline'>
              Date
            </label>
            <div id='date' className='text-nowrap'>
              {dayjs(evaluation.date).format("MMMM D, YYYY")}
            </div>
          </div>
        </div>
        <hr />
        <div className='h5 text-decoration-underline'>Tasks</div>
        <Container>
          {loading ? (
            <Card className='placeholder-wave w-50'>
              <Card.Header>
                <div className='placeholder col-1' />
              </Card.Header>
              <Card.Body>
                <div className='placeholder col-2 h5' />
                <Card className='bg-light-subtle'>
                  <Card.Body>
                    <div className='placeholder col-6' />
                    <hr />
                    <div className='placeholder col-12' />
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          ) : (
            <Row xs={{ cols: "auto" }}>{tasksList}</Row>
          )}
        </Container>
        <hr />
        <div className='row mt-3'>
          <div className='col-md-6'>
            <label className='form-label h5 text-decoration-underline'>
              Worksheets
            </label>
            <Container>
              {worksheets.map((worksheet, idx) => {
                return (
                  <Card key={idx} className='p-3 mb-1'>
                    <div className='d-flex'>
                      {worksheet.type === "file" ? (
                        <a
                          href={worksheet.downloadUrl}
                          target='_blank'
                          rel='noreferrer'
                          className='text-end'
                        >
                          {worksheet.path}
                        </a>
                      ) : (
                        <a
                          href={worksheet.link}
                          target='_blank'
                          rel='noreferrer'
                          className='text-end'
                        >
                          {worksheet.link}
                        </a>
                      )}
                    </div>
                    <div className='d-flex'>
                      <div className=''>{worksheet.completion}</div>
                    </div>
                  </Card>
                );
              })}
            </Container>
          </div>
          <div className='col-md-6'>
            <label className='form-label h5 text-decoration-underline text-nowrap'>
              Next Session Plans
            </label>
            <div id='next_session' style={{ whiteSpace: "pre-wrap" }}>
              {evaluation.next_session}
            </div>
          </div>
        </div>
        <Can I='manage' an={Eval}>
          <hr />
          <h5 className='text-decoration-underline'>Owner</h5>
          <div>{evalOwnerName}</div>
        </Can>
      </div>
      <div className='d-flex'>
        <button
          type='button'
          className='btn btn-secondary m-3 me-auto'
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <Can I='edit' this={evalInstance}>
          <button
            className='btn btn-info m-3 ms-auto'
            onClick={() => navigate(`/eval/edit/${evalRef.current.id}`)}
          >
            Make Changes
          </button>
        </Can>
        <Can not I='edit' this={evalInstance}>
          <Button
            id='edit'
            variant='info'
            className='m-3 ms-auto'
            onClick={() => setShowModal(true)}
          >
            Make Changes
          </Button>
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Ownership Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                You don't have permission to edit this evaluation. You can
                request ownership from an Admin in order to make changes.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant='primary'
                onClick={() => {
                  document
                    .getElementById("edit")
                    .setAttribute("disabled", true);
                  document.getElementById("edit").innerHTML =
                    "Sending Email <span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>";
                  sendEvalOwnershipRequestEmail(
                    auth.currentUser.displayName,
                    window.location.href,
                    evaluation.tutor_name,
                    evaluation.student_name,
                    evaluation.date,
                  )
                    .then(() => {
                      addToast({
                        header: "Success",
                        message: "Message sent.",
                      });
                      document
                        .getElementById("edit")
                        .removeAttribute("disabled");
                      document.getElementById("edit").innerHTML =
                        "Make Changes";
                    })
                    .catch((error) => {
                      addToast({
                        header: "Error",
                        message: "Message failed to send.",
                      });
                      console.log(error);
                      document
                        .getElementById("edit")
                        .removeAttribute("disabled");
                      document.getElementById("edit").innerHTML =
                        "Make Changes";
                    });
                  setShowModal(false);
                }}
              >
                Send Email to Admins
              </Button>
            </Modal.Footer>
          </Modal>
        </Can>
      </div>
      {evaluation.flagged ? (
        <Can I='review' an='eval'>
          <Button
            variant='success'
            className='mx-3 ms-auto'
            onClick={(e) => {
              e.preventDefault();
              e.target.setAttribute("disabled", true);
              e.target.innerHTML =
                'Mark as Reviewed <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
              setDoc(evalRef.current, { flagged: false }, { merge: true }).then(
                () => {
                  addToast({
                    header: "Success",
                    message: "Eval has been marked as reviewed.",
                  });
                  e.target.removeAttribute("disabled");
                  e.target.innerHTML = "Mark as Reviewed";
                },
              );
            }}
          >
            Mark as Reviewed
          </Button>
        </Can>
      ) : null}
    </div>
  );
};

export default StudentEval;
