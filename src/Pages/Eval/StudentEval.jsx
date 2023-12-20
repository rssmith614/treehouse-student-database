import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { db, storage } from "../../Services/firebase";
import { Can } from "../../Services/can";
import { getDownloadURL, ref } from "firebase/storage";
import { OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import { Eval } from "../../Services/defineAbility";

const StudentEval = () => {

  const [evaluation, setEvaluation] = useState({});
  const [tasks, setTasks] = useState([]);

  // const [loading, setLoading] = useState(true);

  const [worksheet, setWorksheet] = useState(null);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));
  const worksheetRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(evalRef.current)
      .then((res) => {
        setEvaluation(res.data());
        if (res.data().worksheet === '' || !res.data().worksheet) return;
        
        worksheetRef.current = ref(storage, res.data().worksheet);
        // console.log(worksheetRef.current)
        getDownloadURL(worksheetRef.current)
          .then((url) => {
            setWorksheet(url);
          })
      })

    getDocs(collection(evalRef.current, 'tasks'))
      .then(res => {
        let compiledTasks = new Array(res.docs.length);
        Promise.all(res.docs.map(async (t, i) => {
          if (t.data().standard === '')
            return compiledTasks[i] = {...res.docs[i].data(), standard: {key: "", description: ""}};
          else
            return getDoc(doc(db, 'standards', t.data().standard))
              .then(s => {
                compiledTasks[i] = {...res.docs[i].data(), standard: s.data()};
              })
        }))
        .then(() => {
          compiledTasks.sort((a, b) => {
            let a_standard = a.standard.key || '0.0.0';
            let b_standard = b.standard.key || '0.0.0';
            return (
              a_standard.split('.')[1].localeCompare(b_standard.split('.')[1]) ||
              a_standard.split('.')[2] - b_standard.split('.')[2] ||
              a_standard.split('.')[2].localeCompare(b_standard.split('.')[2]) ||
              a_standard.localeCompare(b_standard)
            )
          })
          setTasks(compiledTasks);
        })
      })
      // .then(() => setLoading(false));

  }, [params.evalid])

  const tasksList = tasks.map((task, idx) => {
    return (
      <tr className="my-3" key={idx}>
        <td>
          <div id="subject">{task.subject}</div>
        </td>
        <td>
          <OverlayTrigger
            placement="right"
            flip={true}
            overlay={task.standard.key !== 'None' ?
              <Popover className="">
                <Popover.Header>
                  {task.standard.key}
                </Popover.Header>
                <Popover.Body>
                  <div className="text-decoration-underline">Description</div>
                  {task.standard.description}
                </Popover.Body>
              </Popover>
              : 
              <></>
            }>
            <div>{task.standard.key}</div>
          </OverlayTrigger>
        </td>
        <td>
          <div id="progression">{task.progression}</div>
        </td>
        <td>
          <div id="engagement">{task.engagement}</div>
        </td>
        <td>
          <div id="comments">{task.comments}</div>
        </td>
      </tr>
    )
  })

  let evalInstance = new Eval(evaluation);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className="display-1">Session Evaluation</h1>
          <div className="d-flex flex-fill card p-3 m-3 bg-light-subtle">
          <label className="form-label h5">Student</label>
          <button className="btn btn-link me-auto h3 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
            data-toggle="tooltip" title={"View " + evaluation.student_name + "'s Profile"}
            style={{ cursor: "pointer" }} onClick={() => navigate(`/students/${evaluation.student_id}`)}>{evaluation.student_name}</button>
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Tutor</label><br />
              <Can I="view" on="Tutor">
                <button id="tutor" className="btn btn-link h6 link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                  data-toggle="tooltip" title={"View " + evaluation.tutor_name + "'s Profile"}
                  style={{ cursor: "pointer" }} onClick={() => navigate(`/tutor/${evaluation.tutor_id}`)}>{evaluation.tutor_name}</button>
              </Can>
              <Can not I="view" on="Tutor">
                <div id="tutor" className="h6">{evaluation.tutor_name}</div>
              </Can>
          </div>
          <div className="col">
            <label className="form-label h5">Date</label>
            <div id="date" className="">{evaluation.date}</div>
          </div>
        </div>
        <hr />
        <div className="h5">Tasks</div>
        <Row className="d-flex px-3">
          <Table striped>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Standard</th>
                <th>Progression</th>
                <th>Engagement</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {tasksList}
            </tbody>
          </Table>
        </Row>
        <hr />
        <div className="row my-3">
          <div className="col">
            <label className="form-label h5">Worksheet</label>
            <div>
              <a id="worksheet" className="" href={worksheet} target="_blank" rel="noreferrer">{evaluation.worksheet}</a>
            </div>
          </div>
          <div className="col">
            <label className="form-label h5">Worksheet Completion</label>
            <div id="worksheet_completion" className="">{evaluation.worksheet_completion}</div>
          </div>
          <div className="col">
            <label className="form-label h5">Next Session Plans</label>
            <div id="next_session" className="">{evaluation.next_session}</div>
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
      <div className="d-flex">
        <button type="button" className="btn btn-secondary m-3 me-auto" onClick={() => navigate(-1)}>Back</button>
        <Can I="edit" this={evalInstance}>
          <button className="btn btn-info m-3 ms-auto" onClick={() => navigate(`/eval/edit/${evalRef.current.id}`)}>Make Changes</button>
        </Can>
      </div>
    </div>
  );
};

export default StudentEval;