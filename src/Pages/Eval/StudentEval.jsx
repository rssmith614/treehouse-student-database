import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { db, storage } from "../../Services/firebase";
import { AbilityContext, Can } from "../../Services/can";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Button,
  Card,
  Col,
  Container,
  InputGroup,
  OverlayTrigger,
  Popover,
  Row,
  Table,
} from "react-bootstrap";
import { Eval } from "../../Services/defineAbility";
import { ToastContext } from "../../Services/toast";
import { useAbility } from "@casl/react";

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

  // const [loading, setLoading] = useState(true);

  const [worksheet, setWorksheet] = useState(null);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));
  const worksheetRef = useRef();

  const navigate = useNavigate();

  const addToast = useContext(ToastContext);
  const ability = useAbility(AbilityContext);

  useEffect(() => {
    const unsubscribeEval = onSnapshot(evalRef.current, (res) => {
      setEvaluation(res.data());
      if (res.data().worksheet === "" || !res.data().worksheet) return;

      worksheetRef.current = ref(storage, res.data().worksheet);
      getDownloadURL(worksheetRef.current).then((url) => {
        setWorksheet(url);
      });
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
              // debugger;
              // const standards = standardsData.map((s) => ({
              //   ...s.sdata,
              // }));
              compiledTasks[i] = {
                ...t.data(),
                id: t.id,
                standards: standardsData,
              };
            }
          }),
        ).then(() => {
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
        });
      },
    );

    return () => {
      unsubscribeEval();
      unsubscribeTasks();
    };
  }, [params.evalid]);

  function standardsLabel(standards) {
    if (standards.length === 0) return "None";
    else if (standards.length === 1) return standards[0].key;
    else return `${standards[0].key} +${standards.length - 1} more`;
  }

  // const tasksList = tasks.map((task, idx) => {
  //   return (
  //     <tr className='my-3' key={idx}>
  //       <td>
  //         <div id='subject'>{task.subject}</div>
  //       </td>
  //       <td>
  //         {task.standards.length === 0 ? (
  //           <>None</>
  //         ) : (
  //           <OverlayTrigger
  //             placement='right'
  //             flip={true}
  //             overlay={
  //               task.standards.length !== 0 ? (
  //                 task.standards.length === 1 ? (
  //                   <Popover className=''>
  //                     <Popover.Header>{task.standards[0].key}</Popover.Header>
  //                     <Popover.Body>
  //                       <div className='text-decoration-underline'>
  //                         Description
  //                       </div>
  //                       {task.standards[0].description}
  //                     </Popover.Body>
  //                   </Popover>
  //                 ) : (
  //                   <Popover className='' key={idx}>
  //                     {task.standards.map((standard, idx) => (
  //                       <>
  //                         <Popover.Header>{standard.key}</Popover.Header>
  //                         <Popover.Body>
  //                           <div className='text-decoration-underline'>
  //                             Description
  //                           </div>
  //                           {standard.description}
  //                         </Popover.Body>
  //                       </>
  //                     ))}
  //                   </Popover>
  //                 )
  //               ) : (
  //                 <></>
  //               )
  //             }
  //           >
  //             <div>{standardsLabel(task.standards)}</div>
  //           </OverlayTrigger>
  //         )}
  //       </td>
  //       <td>
  //         <div id='progression'>{progressions[task.progression]}</div>
  //       </td>
  //       <td>
  //         <div id='engagement'>{task.engagement}</div>
  //       </td>
  //       <td>
  //         <div id='comments'>{task.comments}</div>
  //       </td>
  //     </tr>
  //   );
  // });

  const tasksList = tasks.map((task, task_idx) => {
    return (
      <Col className=''>
        <Card className='mb-3' key={task_idx}>
          <Card.Header className='d-flex'>
            <div className='h5 align-self-end'>Task {task_idx + 1}</div>
          </Card.Header>
          <Card.Body className='d-flex'>
            <div className='d-flex card p-3 bg-light-subtle'>
              <div className='d-flex flex-column pb-3'>
                <div className='h5 d-flex'>Summary</div>
                <div>{task.comments}</div>
              </div>
              <div className='d-flex flex-column'>
                <div className='h5 d-flex'>Engagement</div>
                <div>{task.engagement}</div>
              </div>
            </div>
            {task.standards.length === 0 ? (
              <></>
            ) : (
              <>
                <div className='vr ms-3' />
                <div className='d-flex flex-column'>
                  <div className='h5 ms-3'>Standards</div>
                  <div className='d-flex'>
                    <Container>
                      <Row xs={{ cols: "auto" }}>
                        {task.standards.map((standard, standard_idx) => {
                          return (
                            <Col>
                              <Card className='bg-light-subtle mb-3'>
                                <Card.Header className='d-flex'>
                                  {grades[standard.grade]} {standard.category}
                                </Card.Header>
                                <Card.Body>
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
                                    <div>{standard.key}</div>
                                  </OverlayTrigger>
                                  {progressions[standard.progression]}
                                </Card.Body>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </Container>
                  </div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  });

  let evalInstance = new Eval(evaluation);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='display-1'>Session Evaluation</h1>
      <div className='d-flex flex-fill card p-3 m-3 bg-light-subtle'>
        <label className='form-label h5'>Student</label>
        <button
          className='btn btn-link me-auto h3 link-underline link-underline-opacity-0 link-underline-opacity-75-hover'
          data-toggle='tooltip'
          title={"View " + evaluation.student_name + "'s Profile"}
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/students/${evaluation.student_id}`)}
        >
          {evaluation.student_name}
        </button>
        <div className='row my-3'>
          <div className='col'>
            <label className='form-label h5'>Tutor</label>
            <br />
            {ability.can("view", "Tutor") && evaluation.tutor_id !== "" ? (
              <button
                id='tutor'
                className='btn btn-link h6 link-underline link-underline-opacity-0 link-underline-opacity-75-hover'
                data-toggle='tooltip'
                title={"View " + evaluation.tutor_name + "'s Profile"}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/tutor/${evaluation.tutor_id}`)}
              >
                {evaluation.tutor_name}
              </button>
            ) : (
              <div id='tutor' className='h6'>
                {evaluation.tutor_name}
              </div>
            )}
          </div>
          <div className='col'>
            <label className='form-label h5'>Date</label>
            <div id='date' className=''>
              {evaluation.date}
            </div>
          </div>
        </div>
        <hr />
        <div className='h5'>Tasks</div>
        <Container>
          <Row xs={{ cols: "auto" }}>{tasksList}</Row>
        </Container>
        <hr />
        <div className='row my-3'>
          <div className='col'>
            <label className='form-label h5'>Worksheet</label>
            <div>
              <a
                id='worksheet'
                className=''
                href={worksheet}
                target='_blank'
                rel='noreferrer'
              >
                {evaluation.worksheet}
              </a>
            </div>
          </div>
          <div className='col'>
            <label className='form-label h5'>Worksheet Completion</label>
            <div id='worksheet_completion' className=''>
              {evaluation.worksheet_completion}
            </div>
          </div>
          <div className='col'>
            <label className='form-label h5'>Next Session Plans</label>
            <div id='next_session' className=''>
              {evaluation.next_session}
            </div>
          </div>
        </div>
        {/* <Can I="manage" on="Eval">
          <hr />
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Eval Created By</label>
              <div id="creator" className="">{evaluation.owner}</div>
            </div>
          </div>
        </Can> */}
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
