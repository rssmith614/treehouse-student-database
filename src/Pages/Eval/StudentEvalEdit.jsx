import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";

import { auth, db } from "../../Services/firebase";
import dayjs from "dayjs";


// to be replaced with DB call
// let tutors = ["Robert Smith", "Marcus Arellano", "Alex Gonzales"]

const StudentEvalEdit = () => {
  const [evaluation, setEvaluation] = useState({});
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState('');

  const [loading, setLoading] = useState(true);

  const params = useParams();

  const evalRef = useRef(doc(db, "evaluations", params.evalid));

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(evalRef.current)
      .then((res) => { setEvaluation(res.data()); setSelectedTutor(res.data().tutor_id) })
      .then(setLoading(false));

    getDocs(collection(db, 'tutors'))
      .then((res) => setTutors(res.docs));

  }, [params.evalid])

  function sumbitEval(e) {
    e.preventDefault();

    let tutorName;
    tutors.forEach((tutor) => {
      if (tutor.id === document.getElementById("tutor").value)
        tutorName = tutor.data().displayName;
    })

    const newEval = {
      student_id: evaluation.student_id,        // not mutable
      student_name: evaluation.student_name,    // not mutable
      tutor_id: document.getElementById("tutor").value,
      tutor_name: tutorName,
      date: document.getElementById("date").value,
      subject: document.getElementById("subject").value,
      standard: document.getElementById("standard").value,
      progression: document.getElementById("progression").value,
      engagement: document.getElementById("engagement").value,
      comments: document.getElementById("comments").value,
      worksheet_completion: document.getElementById("worksheet_completion").value,
      next_session: document.getElementById("next_session").value,
      owner: evaluation.owner,                  // not mutable
    }

    updateDoc(evalRef.current, newEval)
      .then(() => navigate(`/eval/${evalRef.current.id}`));
  }

  function tutorOptions() {
    return tutors.map((tutor) => {
      let tutorData = tutor.data();
      return (
        <option value={tutor.id} key={tutor.id}>{tutorData.displayName}</option>
      );
    });
  }

  const todayStr = dayjs().format('YYYY-MM-DD');

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className="display-1">Edit Session Evaluation</h1>
        <form onSubmit={sumbitEval}>
          <div className="d-flex flex-fill card p-3 m-3 bg-light-subtle">
            <div className="h3"
              data-toggle="tooltip" title="Contact an administrator if this is incorrect">{evaluation.student_name}</div>
            <div className="row my-3">
              <div className="col">
                <label className="form-label h5">Tutor</label>
                <select id="tutor" className="form-control"
                  value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.val)}>
                  <option disabled value="">Select One</option>
                  {tutorOptions()}
                </select>
            </div>
            <div className="col">
              <label className="form-label h5">Date</label>
              <input id="date" className="form-control" type="date" defaultValue={todayStr} />
            </div>
            <div className="col">
              <label className="form-label h5">Subject</label>
              <input id="subject" className="form-control" type="text" defaultValue={evaluation.subject} required />
            </div>
            <div className="col">
              <label className="form-label h5">Standard</label>
              <input id="standard" className="form-control" type="text" defaultValue={evaluation.standard} />
            </div>
            {/* <div className="col">
              <label className="form-label h5">Grade Level</label>
              <input id="grade_level" className="form-control" type="text" value={student.student_grade || ''}
               data-toggle="tooltip" title="Contact an administrator if this is incorrect" readOnly />
            </div> */}
          </div>
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Progression</label>
              <input id="progression" className="form-control" type="number" min="1" max="5" step="1" defaultValue={evaluation.progression} />
            </div>
            <div className="col">
              <label className="form-label h5">Engagement</label>
              <input id="engagement" className="form-control" type="number" min="1" max="5" step="1" defaultValue={evaluation.engagement} />
            </div>
            <div className="col">
              <label className="form-label h5">Comments</label>
              <textarea id="comments" className="form-control" defaultValue={evaluation.comments} />
            </div>
          </div>
          <hr />
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Worksheet</label>
              {/* <input id="worksheet" className="form-control" type="file" /> */}
              <div>What to put here? Link to existing file? Ability to overwrite? ...?</div>
            </div>
            <div className="col">
              <label className="form-label h5">Worksheet Completion</label>
              <input id="worksheet_completion" className="form-control" type="text" defaultValue={evaluation.worksheet_completion} />
            </div>
            <div className="col">
              <label className="form-label h5">Next Session Plans</label>
              <textarea id="next_session" className="form-control" defaultValue={evaluation.next_session} />
            </div>
          </div>

        </div>
        <div className="d-flex">
          <button type="button" className="btn btn-secondary m-3 me-auto" onClick={() => navigate(`/eval/${evalRef.current.id}`)}>Back</button>
          <button className="btn btn-primary m-3" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default StudentEvalEdit;