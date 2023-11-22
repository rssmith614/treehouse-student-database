import { arrayRemove, arrayUnion, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../../Services/firebase";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Can } from "../../Services/can";
import EvalsTable from "../../Components/EvalsTable";
import { Button, Form, Nav, Offcanvas, Tab } from "react-bootstrap";
import StandardsOfStudent from "../../Components/StandardsOfStudent";
import { ToastContext } from "../../Services/toast";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(duration);
dayjs.extend(relativeTime);

const StudentProfile = () => {
  const [student, setStudent] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedStandard, setSelectedStandard] = useState(null);

  const [tab, setTab] = useState(localStorage.getItem('student_tab') || 'about');
  const [show, setShow] = useState(false);

  const studentRef = useRef();

  const navigate = useNavigate();
  const addToast = useContext(ToastContext);
  
  const params = useParams();
  
  studentRef.current = doc(db, "students", params.studentid);
  
  useEffect(() => {

    getDoc(studentRef.current)
      .then((res) => {
        setStudent(res.data());
      }).then(setLoading(false))

    onSnapshot(studentRef.current, s => setStudent(s.data()));

  }, [params.studentid])

  useEffect(() => {
    localStorage.setItem('student_tab', tab);
  }, [tab])

  const emergencyContactList = () => {
    if (!student.emergency_contacts) return null;
    return student.emergency_contacts.map((c, i) => {
      return (
        <tr key={i}>
          <td>{c.name}</td>
          <td>{c.relation}</td>
          <td>{c.phone}</td>
        </tr>
      )
    })
  }

  useEffect(() => {
    if (selectedStandard) {
      setShow(true);
    }
  }, [selectedStandard])

  function handleSubmit(e) {
    e.preventDefault();

    document.getElementById('update').innerHTML = "Updating <span class='spinner-border spinner-border-sm' />";
    document.getElementById('update').setAttribute('disabled', true);

    let status = document.getElementById('status').value;

    setDoc(doc(studentRef.current, 'standards', selectedStandard.id), {status: status, timestamp: serverTimestamp()})
      .then(() => {
        setShow(false);
        addToast({header: 'Standard Progress Updated', message: `${student.student_name}'s progression for Standard ${selectedStandard.key} has been successfully updated.`})
      })
  }

  function handleRemove(e) {
    e.preventDefault();

    document.getElementById('remove').innerHTML = "Removing <span class='spinner-border spinner-border-sm' />";
    document.getElementById('remove').setAttribute('disabled', true);

    deleteDoc(doc(studentRef.current, 'standards', selectedStandard.id))
      .then(() => {
        setShow(false);
        addToast({header: 'Standard Progress Removed', message: `No longer tracking ${student.student_name}'s progression for ${selectedStandard.key}`});
      })
  }

  const innerContent = (
    <Tab.Container defaultActiveKey={tab}>
    <div className="card-header">
      <Nav variant="underline" activeKey={tab}>
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab"
            eventKey='about' onClick={() => setTab('about')}>About</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab"
          eventKey='evals' onClick={() => setTab('evals')}>Evaluations</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab"
          eventKey='standards' onClick={() => setTab('standards')}>Standards</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab"
          eventKey='assessments' onClick={() => setTab('assessments')}>Assessments</Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
    <Tab.Content className="card-body">
      <Tab.Pane eventKey="about">
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Birthday</div>
            <div className="d-flex">{student.student_dob}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Grade</div>
            <div className="d-flex">{student.student_grade}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">School</div>
            <div className="d-flex">{student.student_school}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Source</div>
            <div className="d-flex">{student.student_source}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Parent Name</div>
            <div className="d-flex">{student.parent_name}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Parent Phone Number</div>
            <div className="d-flex">{student.parent_phone}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Preferred Tutor</div>
            <div className="d-flex">{student.preferred_tutor_name}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start">
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Medical Conditions</div>
            <div className="d-flex">{student.medical_conditions}</div>
          </div>
          <div className="d-flex p-3 flex-column flex-fill">
            <div className="d-flex h5">Other Info</div>
            <div className="d-flex">{student.other}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start table-responsive flex-column flex-fill">
          <div className="d-flex p-3 h5">Emergency Contacts</div>
          <div className="d-flex px-5">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Relation</th>
                  <th scope="col">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {emergencyContactList()}
              </tbody>
            </table>
          </div>
        </div>
        <Can do="manage" on="students">
          <div className="d-flex justify-content-end">
            <button className="btn btn-info m-3" onClick={() => navigate(`/student/edit/${studentRef.current.id}`)}>Make Changes</button>
          </div>
        </Can>
      </Tab.Pane>
      <Tab.Pane eventKey="evals">
        <EvalsTable filterBy='student' id={studentRef.current.id} />
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary m-3" onClick={() => navigate(`/eval/new/${studentRef.current.id}`)}>New Session Eval</button>
        </div>
      </Tab.Pane>
      <Tab.Pane eventKey="standards">
        <StandardsOfStudent student={studentRef.current} setSelectedStandard={setSelectedStandard} />
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary m-3" onClick={() => navigate(`/standard/new/${studentRef.current.id}`)}>Track New Standards</button>
        </div>
      </Tab.Pane>
      <Tab.Pane eventKey="assessments">
        <div className="card-title">Assessments</div>
      </Tab.Pane>
    </Tab.Content>
    </Tab.Container>
  )
  
  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Student Profile - {student.student_name}
      </h1>
      <div className="d-flex ">
        <div className='d-flex m-3 card bg-light-subtle flex-fill'>
          {loading ? <div className="spinner-border align-self-center" /> : innerContent}
        </div>
      </div>
      <Offcanvas show={show} onHide={() => {setShow(false); }} onExited={() => setSelectedStandard(null)} placement="end">
        <Offcanvas.Header>
          <Offcanvas.Title>Standard {selectedStandard ? selectedStandard.key : ''}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedStandard ?
            <div className="d-flex flex-column">
              <Form onSubmit={handleSubmit}>
                <div>{selectedStandard.description}</div>
                <hr />
                <Form.Label>Current Progression</Form.Label>
                <Form.Select defaultValue={selectedStandard.status} id="status">
                  <option value='1'>1 - Far Below Expectations</option>
                  <option value='2'>2 - Below Expectations</option>
                  <option value='3'>3 - Meets Expectations</option>
                  <option value='4'>4 - Exceeds Expectations</option>
                </Form.Select>
                <Button variant='danger' className="m-3" type="button" id='remove'
                  onClick={handleRemove}>Stop Tracking</Button>
                <Button className="m-3" type="submit" id='update'>Update Progression</Button>
                <div className="fs-6 fst-italic text-end">Last updated {dayjs.unix(selectedStandard.timestamp.seconds).format('MM/DD/YYYY')} ({dayjs.duration(dayjs().diff(dayjs.unix(selectedStandard.timestamp.seconds))).humanize()} ago)</div>
              </Form>
            </div>
            : ''
          }
        </Offcanvas.Body>
      </Offcanvas>
        {/* <div className="d-flex justify-content-end">
          <Can do="manage" on="students">
            <button className="btn btn-info m-3" onClick={() => navigate(`/student/edit/${studentRef.current.id}`)}>Make Changes</button>
          </Can>
          <button className="btn btn-primary m-3" onClick={() => navigate(`/eval/new/${studentRef.current.id}`)}>New Session Eval</button>
        </div> */}
    </div>
  );
}

export default StudentProfile;