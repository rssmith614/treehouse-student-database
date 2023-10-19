import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../Services/firebase";
import { Can } from "../Services/can";


const StudentEval = () => {

  const [evaluation, setEvaluation] = useState({});

  const [loading, setLoading] = useState(true);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(evalRef.current)
      .then((res) => setEvaluation(res.data()))
      .then(setLoading(false));

  }, [params.studentid])

  class Eval {
    constructor(dict) {
      for (const key in dict) {
        if (dict.hasOwnProperty(key)) {
          this[key] = dict[key];
        }
      }
    }
  }

  let evalInstance = new Eval(evaluation);

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className="display-1">Session Evaluation</h1>
          <div className="d-flex flex-fill card p-3 m-3 bg-light-subtle">
          <div className="h3"
            data-toggle="tooltip" title={"View " + evaluation.student_name + "'s Profile"}
            style={{ cursor: "pointer" }} onClick={() => navigate(`/student/${evaluation.student_id}`)}>{evaluation.student_name}</div>
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Tutor</label>
              <Can I="view" on="Tutor">
                <div id="tutor" className=""
                  data-toggle="tooltip" title={"View " + evaluation.tutor_name + "'s Profile"}
                  style={{ cursor: "pointer" }} onClick={() => navigate(`/tutor/${evaluation.tutor_id}`)}>{evaluation.tutor_name}</div>
              </Can>
              <Can not I="view" on="Tutor">
                <div id="tutor" className="">{evaluation.tutor_name}</div>
              </Can>
          </div>
          <div className="col">
            <label className="form-label h5">Date</label>
            <div id="date" className="">{evaluation.date}</div>
          </div>
          <div className="col">
            <label className="form-label h5">Subject</label>
            <div id="subject" className="">{evaluation.subject}</div>
          </div>
          <div className="col">
            <label className="form-label h5">Standard</label>
            <div id="standard" className="">{evaluation.standard}</div>
          </div>
          {/* <div className="col">
            <label className="form-label h5">Grade Level</label>
            <div id="grade_level" className="">{evaluation.student_grade}</div>
          </div> */}
        </div>
        <div className="row my-3">
          <div className="col">
            <label className="form-label h5">Progression</label>
            <div id="progression" className="">{evaluation.progression}</div>
          </div>
          <div className="col">
            <label className="form-label h5">Engagement</label>
            <div id="engagement" className="">{evaluation.engagement}</div>
          </div>
          <div className="col">
            <label className="form-label h5">Comments</label>
            <div id="comments" className="">{evaluation.comments}</div>
          </div>
        </div>
        <hr />
        <div className="row my-3">
          <div className="col">
            <label className="form-label h5">Worksheet</label>
            <div id="worksheet" className="">TODO: link to worksheet</div>
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

      </div>
      <div className="d-flex">
        <button type="button" className="btn btn-secondary m-3 me-auto" onClick={() => navigate(`/evals/${evaluation.student_id}`)}>Back to {evaluation.student_name}'s Evals</button>
        <Can I="edit" this={evalInstance}>
          <button className="btn btn-info m-3" onClick={() => navigate(`/eval/edit/${evalRef.current.id}`)}>Make Changes</button>
        </Can>
      </div>
    </div>
  );
};

export default StudentEval;