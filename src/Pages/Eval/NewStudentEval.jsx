import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";

import { auth, db } from "../../Services/firebase";
import dayjs from "dayjs";


// to be replaced with DB call
// let tutors = ["Robert Smith", "Marcus Arellano", "Alex Gonzales"]

const NewStudentEval = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");

  const [loading, setLoading] = useState(true);

  const params = useParams();

  const studentRef = useRef(doc(db, "students", params.studentid));

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(studentRef.current)
      .then((docs) => { setStudent(docs.data()); setSelectedTutor(docs.data().preferred_tutor) })
      .then(setLoading(false));

    getDocs(collection(db, 'tutors'))
      .then((res) => setTutors(res.docs));

  }, [params.studentid])

  function sumbitEval(e) {
    e.preventDefault();

    let tutorName;
    tutors.forEach((tutor) => {
      if (tutor.id === document.getElementById("tutor").value)
        tutorName = tutor.data().displayName;
    })

    const newEval = {
      student_id: studentRef.current.id,
      student_name: student.student_name,
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
      owner: auth.currentUser.email,
    }

    addDoc(collection(db, "evaluations"), newEval)
      .then(() => navigate(`/student/${params.studentid}`));
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
      <h1 className="display-1">New Session Evaluation</h1>
        <form onSubmit={sumbitEval}>
          <div className="d-flex flex-fill card p-3 m-3 bg-light-subtle">
            <div className="h3"
              data-toggle="tooltip" title="Contact an administrator if this is incorrect">{student.student_name}</div>
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
              <input id="subject" className="form-control" type="text" required />
            </div>
            <div className="col">
              <label className="form-label h5">Standard</label>
              <input id="standard" className="form-control" type="text" />
            </div>
            <div className="col">
              <label className="form-label h5">Grade Level</label>
              <input id="grade_level" className="form-control" type="text" value={student.student_grade || ''}
               data-toggle="tooltip" title="Contact an administrator if this is incorrect" readOnly />
            </div>
          </div>
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Progression</label>
              <input id="progression" className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
            </div>
            <div className="col">
              <label className="form-label h5">Engagement</label>
              <input id="engagement" className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
            </div>
            <div className="col">
              <label className="form-label h5">Comments</label>
              <textarea id="comments" className="form-control" />
            </div>
          </div>
          <hr />
          <div className="row my-3">
            <div className="col">
              <label className="form-label h5">Worksheet</label>
              <input id="worksheet" className="form-control" type="file" />
            </div>
            <div className="col">
              <label className="form-label h5">Worksheet Completion</label>
              <input id="worksheet_completion" className="form-control" type="text" />
            </div>
            <div className="col">
              <label className="form-label h5">Next Session Plans</label>
              <textarea id="next_session" className="form-control" />
            </div>
          </div>

        </div>
        <div className="d-flex">
          {/* <button type="button" className="btn btn-secondary m-3 me-auto" onClick={() => navigate(`/student/${params.studentid}`)}>Back</button> */}
          <button className="btn btn-primary m-3 ms-auto" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default NewStudentEval;