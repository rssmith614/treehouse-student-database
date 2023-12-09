import { addDoc, arrayUnion, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";
import { Button, Card, Form, Nav, Offcanvas } from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { ToastContext } from "../../Services/toast";


const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade']
const categories = ['Math', 'Reading']


const TrackStandard = () => {
  const [student, setStudent] = useState({});
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [grade, setGrade] = useState(localStorage.getItem('grade') || 'K');
  const [category, setCategory] = useState(localStorage.getItem('category') || 'Math');

  const [showSingle, setShowSingle] = useState(false);
  const [showSubcat, setShowSubcat] = useState(false);

  const addToast = useContext(ToastContext);

  const navigate = useNavigate();

  const params = useParams();

  const studentRef = useRef();

  useEffect(() => {
    localStorage.setItem('grade', grade)
    localStorage.setItem('category', category)
  }, [grade, category])

  useEffect(() => {
    studentRef.current = doc(db, "students", params.studentid);

    getDoc(studentRef.current)
      .then((res) => {
        setStudent(res.data());
      })

  }, [params.studentid])

  useEffect(() => {
    if (selectedStandard) {
      if (selectedStandard instanceof Array)
        setShowSubcat(true);
      else
        setShowSingle(true);
    }
  }, [selectedStandard])

  function addStandard(e) {
    e.preventDefault();

    document.getElementById('addStandard').innerHTML = "Add <span class='spinner-border spinner-border-sm' />";
    let status = document.getElementById('status').value;

    if (selectedStandard instanceof Array) {
      Promise.all(selectedStandard.map((s) => {
        return setDoc(doc(studentRef.current, 'standards', s.id), {status: status, timestamp: serverTimestamp()})
      })).then(() => {
        setShowSubcat(false);
        addToast({header: 'Standards Added', message: `${selectedStandard.length} standards were successfully added to ${student.student_name}'s profile`})
      });

    } else {
      
      setDoc(doc(studentRef.current, 'standards', selectedStandard.id), {status: status, timestamp: serverTimestamp()})
        .then((res) => {
          setShowSingle(false);
          addToast({header: 'Standard Added', message: `Standard ${selectedStandard.key} was successfully added to ${student.student_name}'s profile`})
        })
    }

  }

  const gradeTabs = (
    grades.map((g, i) => {
      return (
        <Nav.Item key={i}>
          <Nav.Link data-bs-toggle="tab" aria-current="true"
            eventKey={g.at(0)} onClick={() => setGrade(g.at(0))}>{g}</Nav.Link>
        </Nav.Item>
      );
    })
  );
  
  const categoryTabs = (
    categories.map((c, i) => {
      return (
        <Nav.Item key={i}>
          <Nav.Link data-bs-toggle="tab" aria-current="true"
          eventKey={c} onClick={() => setCategory(c)}>{c}</Nav.Link>
        </Nav.Item>
      )
    })
  );

  const addSingle = (
    <>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Add <strong>{selectedStandard?.key}</strong> to the list of tracked standards for {student.student_name}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <p className="fst-italic text-decoration-underline">Description</p>
        <p>{selectedStandard?.description}</p>
        {selectedStandard?.questions !== undefined ? 
          <>
            <p className="fst-italic text-decoration-underline">Example Question</p>
            <div>Q: {selectedStandard.questions[0].question}</div>
            <div>A: {selectedStandard.questions[0].answer}</div>
          </>
          :
          <></>
        }
        <hr />
        <Form onSubmit={addStandard}>
          <Form.Label>Current Progression</Form.Label>
          <Form.Select id='status' >
            <option>None</option>
            <option value='1'>1 - Far Below Expectations</option>
            <option value='2'>2 - Below Expectations</option>
            <option value='3'>3 - Meets Expectations</option>
            <option value='4'>4 - Exceeds Expectations</option>
          </Form.Select>

          <Button className="mt-3" type="submit" id='addStandard'>Add</Button>
        </Form>
      </Offcanvas.Body>
    </>
  )

  const addSubcat = (
    <>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Add all <strong>{selectedStandard instanceof Array ? selectedStandard.at(0)?.sub_category : ''}</strong> standards to the list of tracked standards for {student.student_name}
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={addStandard}>
          <Form.Label>Default Progression</Form.Label>
          <Form.Select id='status'>
            <option>None</option>
            <option value='1'>1 - Far Below Expectations</option>
            <option value='2'>2 - Below Expectations</option>
            <option value='3'>3 - Meets Expectations</option>
            <option value='4'>4 - Exceeds Expectations</option>
          </Form.Select>

          <Button className="mt-3" type="submit" id='addStandard'>Add {selectedStandard?.length} standard{selectedStandard?.length > 1 ? 's':''}</Button>
        </Form>
      </Offcanvas.Body>
    </>
  )

  return (
    <div className="d-flex flex-column p-3">
      <div className="display-1">
        Track New Standards
      </div>
      <div className="h5">Select a Standard to Track with {student.student_name}</div>
      <Card className="bg-light-subtle">
        <Card.Header>
          <Nav variant='underline' activeKey={grade}>
            {gradeTabs}
          </Nav>
        </Card.Header>
        <Card.Header>
          <Nav fill variant='underline' activeKey={category}>
            {categoryTabs}
          </Nav>
        </Card.Header>
        <Card.Body>
          <StandardsOfCategory grade={grade} category={category} setSelection={setSelectedStandard} track />
        </Card.Body>
      </Card>
      <div className="d-flex p-3">
        <Button variant='secondary' onClick={() => navigate(`/students/${studentRef.current.id}`)}>Done</Button>
      </div>
      <Offcanvas show={showSingle || showSubcat} onHide={() => {setShowSingle(false); setShowSubcat(false)}} onExited={() => setSelectedStandard(null)} placement='end'>
        {showSingle ?
          addSingle
        :
          addSubcat
        }
      </Offcanvas>
    </div>
  )
}

export default TrackStandard;