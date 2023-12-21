import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../Services/firebase";

import { useEffect, useState, useRef } from "react";

const StudentEvalForm = (props) => {
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);

  const studentRef = useRef();

  studentRef.current = doc(db, "students", props.studentid);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(studentRef.current, (res) => {
      setStudent(res.data());
      setLoading(false)
    });

    return () => unsubscribeStudents();
  }, [props.studentid])

  async function sumbitEval() {
    
  }

  function tutorOptions() {
    return tutors.map((tutor) => {
      if (student.preferred_tutor === tutor)
        return (
          <option selected value={tutor} key={tutor}>{tutor}</option>
        );
      else
        return (
          <option value={tutor} key={tutor.id}>{tutor}</option>
        );
    });
  }

  return (
    <form>
      <h2 className="h3">{student.student_name}</h2>
      <div className="row my-3">
        <div className="col">
          <label className="form-label h5">Tutor</label>
          <select className="form-control" required>
            <option disabled selected value="">Select One</option>
            {tutorOptions()}
          </select>
        </div>
        <div className="col">
          <label className="form-label h5">Date</label>
          <input className="form-control" type="date" />
        </div>
        <div className="col">
          <label className="form-label h5">Subject</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h5">Standard</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h5">Grade Level</label>
          <input className="form-control" type="text" />
        </div>
      </div>
      <div className="row my-3">
        <div className="col">
          <label className="form-label h5">Progression</label>
          <input className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
        </div>
        <div className="col">
          <label className="form-label h5">Engagement</label>
          <input className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
        </div>
        <div className="col">
          <label className="form-label h5">Comments</label>
          <textarea className="form-control" />
        </div>
      </div>
      <hr />
      <div className="row my-3">
        <div className="col">
          <label className="form-label h5">Worksheet</label>
          <input className="form-control" type="file" />
        </div>
        <div className="col">
          <label className="form-label h5">Worksheet Completion</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h5">Next Session Plans</label>
          <textarea className="form-control" />
        </div>
      </div>

      <button className="d-flex btn btn-primary m-3 ms-auto" type="submit">Submit</button>
    </form>
  );
}

export default StudentEvalForm;