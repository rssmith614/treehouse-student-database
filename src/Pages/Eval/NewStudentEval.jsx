import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";

import { auth, db, storage } from "../../Services/firebase";
import dayjs from "dayjs";
import { ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "../../Services/toast";
import { Button, Row, Table } from "react-bootstrap";


const NewStudentEval = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);
  const [standards, setStandards] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");

  const [tasks, setTasks] = useState([{subject: "", standard: "", progression: "5", engagement: "5", comments: ""}]);

  const [loading, setLoading] = useState(true);

  const addToast = useContext(ToastContext);

  const params = useParams();

  const studentRef = useRef(doc(db, "students", params.studentid));

  const navigate = useNavigate();

  useEffect(() => {

    getDoc(studentRef.current)
      .then((docs) => {
        setStudent(docs.data());
        setSelectedTutor(docs.data().preferred_tutor);
        getDocs(collection(studentRef.current, 'standards'))
          .then(subCollStandards => {
            let compiledStandards = [];
            Promise.all(subCollStandards.docs.map(async s => {
              return getDoc(doc(db, 'standards', s.id))
                .then(standard => {
                  compiledStandards.push({...s.data(), ...standard.data(), id: standard.id});
                })
            }))
              .then(() => {
                setStandards(compiledStandards);
              });
          })
          .then(setLoading(false));
        });

    getDocs(collection(db, 'tutors'))
      .then((res) => setTutors(res.docs));

  }, [params.studentid])

  function addTask() {
    setTasks([...tasks, {subject: "", standard: "", progression: "", engagement: "", comments: ""}]);
  }

  function sumbitEval(e) {
    e.preventDefault();

    document.getElementById("submit").innerHTML = "Submit <span class='spinner-border spinner-border-sm' />";

    let tutorName;
    tutors.forEach((tutor) => {
      if (tutor.id === document.getElementById("tutor").value)
        tutorName = tutor.data().displayName;
    })

    const worksheetUpload = document.getElementById("worksheet").files[0];

    const newEval = {
      student_id: studentRef.current.id,
      student_name: student.student_name,
      tutor_id: document.getElementById("tutor").value,
      tutor_name: tutorName,
      date: document.getElementById("date").value,
      worksheet_completion: document.getElementById("worksheet_completion").value,
      next_session: document.getElementById("next_session").value,
      owner: auth.currentUser.uid,
    }

    if (worksheetUpload) {
      const worksheetRef = ref(storage, `worksheets/${worksheetUpload.name}`);

      newEval.worksheet = worksheetRef.fullPath;

      uploadBytes(worksheetRef, worksheetUpload)
        .then(() => 
            addDoc(collection(db, "evaluations"), newEval)
          .then((doc) => {
            tasks.forEach(t => addDoc(collection(doc, 'tasks'), t));
            addToast({header: 'Evaluation Submitted', message: `Session evaluation for ${newEval.student_name} was successfully uploaded`})
          })
          .then(() =>
              navigate(`/student/${params.studentid}`)
          )
        )
    } else {
      newEval.worksheet = '';

      addDoc(collection(db, "evaluations"), newEval)
        .then((d) => {
          tasks.forEach(t => addDoc(collection(d, 'tasks'), t));
          addToast({header: 'Evaluation Submitted', message: `Session evaluation for ${newEval.student_name} was successfully uploaded`})
        })
        .then(() =>
          navigate(`/student/${params.studentid}`)
        )
    }
  }

  function tutorOptions() {
    return tutors.map((tutor) => {
      let tutorData = tutor.data();
      return (
        <option value={tutor.id} key={tutor.id}>{tutorData.displayName}</option>
      );
    });
  }

  const standardOptions = standards.sort((a,b) => {
    return (
      a.key.split('.')[1].localeCompare(b.key.split('.')[1]) ||
      a.key.split('.')[2] - b.key.split('.')[2] ||
      a.key.split('.')[2].localeCompare(b.key.split('.')[2]) ||
      a.key.localeCompare(b.key)
    )}).map((s, i) => {
      return (
        <option value={s.id} key={s.id}>{s.key}</option>
      );
  });

  const tasksList = tasks.map((task, idx) => {
    return (
      <tr className="my-3" key={idx}>
        <td><Button type="button" variant="danger" onClick={() => {setTasks(tasks.filter((t, i) => i !== idx))}}><i className="bi bi-trash-fill" /></Button></td>
        <td>
          <input id="subject" className="form-control" type="text"
            value={task.subject} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return {...t, subject: e.target.value};
            }))} required />
        </td>
        <td>
          <select id="standard" className="form-control"
            value={task.standard} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return {...t, standard: e.target.value};
            }))}>
              <option value=''>None</option>
              {standardOptions}
            </select>
        </td>
        <td>
          <input id="progression" className="form-control" type="number" min="1" max="5" step="1"
            value={task.progression} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return {...t, progression: e.target.value};
            }))} />
        </td>
        <td>
          <input id="engagement" className="form-control" type="number" min="1" max="5" step="1"
            value={task.engagement} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return {...t, engagement: e.target.value};
            }))} />
        </td>
        <td>
          <textarea id="comments" className="form-control"
            value={task.comments} onChange={e => setTasks(tasks.map((t, i) => {
              if (i !== idx) return t;
              else return {...t, comments: e.target.value};
            }))} />
        </td>
      </tr>
    )
  })

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
          </div>
          <hr />
          <div className="d-flex flex-column">
            <div className="h5">Tasks</div>
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
              <tbody>
                {tasksList}
              </tbody>
            </Table>
            <Button type="button" variant="secondary" className="me-auto" onClick={addTask}>Add Task</Button>
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
          <button className="btn btn-primary m-3 ms-auto" id="submit" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default NewStudentEval;