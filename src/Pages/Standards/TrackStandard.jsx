import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
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

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const setToast = useContext(ToastContext);

  const navigate = useNavigate();

  const params = useParams();

  const studentRef = useRef();

  useEffect(() => {
    studentRef.current = doc(db, "students", params.studentid);

    getDoc(studentRef.current)
      .then((res) => {
        setStudent(res.data());
      })

  }, [params.studentid])

  useEffect(() => {
    if (selectedStandard) {
      handleShow();
    }
  }, [selectedStandard])

  function addStandard(e) {
    e.preventDefault();

    document.getElementById('addStandard').innerHTML = "Add <span class='spinner-border spinner-border-sm' />";
    let status = document.getElementById('status').value;

    updateDoc(studentRef.current, {standards: arrayUnion({...selectedStandard, status: status})})
      .then(() => {
        // document.getElementById('addStandard').innerHTML = "Add";
        handleClose();
        setToast({header: 'Standard Added', message: `Standard ${selectedStandard.key} was successfully added to ${student.student_name}'s profile`})
      })
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
          <StandardsOfCategory grade={grade} category={category} setSelection={setSelectedStandard} />
        </Card.Body>
      </Card>
      <div className="d-flex p-3">
        <Button variant='secondary' onClick={() => navigate(`/student/${studentRef.current.id}`)}>Done</Button>
      </div>
      <Offcanvas show={show} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            Add <strong>{selectedStandard ? selectedStandard.key : ''}</strong> to the list of tracked standards for {student.student_name}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {selectedStandard ? selectedStandard.description : ''}
          <hr />
          <Form onSubmit={addStandard}>
            <Form.Label>Current Progression</Form.Label>
            <Form.Select defaultValue='3' id='status' required >
              <option value='1'>1 - Far Below Expectations</option>
              <option value='2'>2 - Below Expectations</option>
              <option value='3'>3 - Meets Expectations</option>
              <option value='4'>4 - Exceeds Expectations</option>
            </Form.Select>

            <Button className="mt-3" type="submit" id='addStandard'>Add</Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

export default TrackStandard;