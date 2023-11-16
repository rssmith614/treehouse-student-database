import { Button, Card, Form, Nav, Offcanvas, Table } from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { useContext, useEffect, useState } from "react";
import { Can } from "../../Services/can";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";

const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade']
const categories = ['Math', 'Reading']

const StandardsList = () => {
  const [grade, setGrade] = useState(localStorage.getItem('grade') || 'K');
  const [category, setCategory] = useState(localStorage.getItem('category') || 'Math');

  const [selectedStandard, setSelectedStandard] = useState(null);
  const [show, setShow] = useState(false);

  const [edit, setEdit] = useState(false);

  const setToast = useContext(ToastContext);

  useEffect(() => {
    localStorage.setItem('grade', grade)
    localStorage.setItem('category', category)
  }, [grade, category])

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

  useEffect(() => {
    if (selectedStandard) {
      setShow(true);
    }
  }, [selectedStandard])

  function handleSubmit(e) {
    e.preventDefault();

    document.getElementById('submitChanges').innerHTML = "Saving <span class='spinner-border spinner-border-sm' />";
    document.getElementById('submitChanges').setAttribute('disabled', true);

    if (document.getElementById('key').value !== selectedStandard.key) {
    }

    let newStandard = {
      key: document.getElementById('key').value,
      grade: document.getElementById('grade').value,
      category: document.getElementById('category').value,
      sub_category: document.getElementById('sub_category').value,
      description: document.getElementById('description').value
    }

    getDocs(query(collection(db, 'standards'), where('key', '==', selectedStandard.key)))
      .then((res) => updateDoc(doc(db, 'standards', res.docs[0].id), newStandard)
        .then(setToast({header: 'Changes Saved', message: `Standard ${newStandard.key} has been updated (Refresh to see)`}))
        .then(() => {setEdit(false); setShow(false)}))
     
  }

  const displayStandard = (
    <Offcanvas show={show} onHide={() => {setShow(false)}} onExited={() => setSelectedStandard(null)} placement='end'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <strong>{selectedStandard ? selectedStandard.key : ''}</strong>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <p className="fst-italic text-decoration-underline">Description</p>
        <p>{selectedStandard ? selectedStandard.description : ''}</p>
        {selectedStandard ? 
          selectedStandard.questions !== undefined ? 
          <>
            <p className="fst-italic text-decoration-underline">Example Question</p>
            <div>Q: {selectedStandard.questions[0].question}</div>
            <div>A: {selectedStandard.questions[0].answer}</div>
          </>
          :
          <></> // it's ok I hate this syntax too
          :
          <></>
        }
        <hr />
        <Can I='edit' on='standards'>
          <div className="d-flex">
            <Button variant='info' className="ms-auto" onClick={() => setEdit(true)}>Edit This Standard</Button>
          </div>
        </Can>
      </Offcanvas.Body>
    </Offcanvas>
  );

  const editStandard = (
    <Offcanvas show={show} onHide={() => setShow(false)} onExited={() => {setSelectedStandard(null); setEdit(false);}} placement='end'>
      {selectedStandard ?
        <>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <strong>Edit {selectedStandard.key}</strong>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Label>Standard Name</Form.Label>
            <Form.Control type='text' defaultValue={selectedStandard.key} id="key" />

            <Form.Label className="pt-3">Grade Level</Form.Label>
            <Form.Control type='text' defaultValue={selectedStandard.grade} id="grade" />

            <Form.Label className="pt-3">Category</Form.Label>
            <Form.Select defaultValue={selectedStandard.category} id="category">
              <option value="Math">Math</option>
              <option value="Reading">Reading</option>
            </Form.Select>

            <Form.Label className="pt-3">Sub-Category</Form.Label>
            <Form.Control type='text' defaultValue={selectedStandard.sub_category} id="sub_category" />

            <Form.Label className="pt-3">Description</Form.Label>
            <Form.Control as='textarea' defaultValue={selectedStandard.description} id="description" style={{ height: '150px' }} />

            {/* <p className="pt-3">Questions</p>
            {selectedStandard.questions !== undefined ?
              selectedStandard.questions.map((q) => {
                return (
                  <div className="d-flex justify-content-evenly">
                    <Card className="my-1 bg-light-subtle">
                      <Card.Header className="d-flex">
                        Q: {q.question}
                      </Card.Header>
                      <Card.Body>
                        A: {q.answer}
                      </Card.Body>
                    </Card>
                    <Button className="p-3 m-3" variant='danger'>X</Button>
                  </div>
                )
              })
              :
              <></>
            }
            <div className="d-flex pt-3">
              <Button variant='secondary' className="flex-fill">+</Button>
            </div> */}

            <div className="d-flex">
              <Button type='button' className="mt-3" variant="secondary" onClick={() => setEdit(false)}>Back</Button>
              <Button type='submit' className="ms-auto mt-3" id='submitChanges'>Save Changes</Button>
            </div>
          </Form>
        </Offcanvas.Body>
        </>
        :
        <></>
      }
    </Offcanvas>
  )

  return (
    <div className="d-flex flex-column p-3">
      <div className="display-1">
        Standards Cheat Sheet
      </div>
      <div className="h5">Quick reference for all Common Core standards</div>
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
      {edit ?
        editStandard
        :
        displayStandard
      }
    </div>
  );
}

export default StandardsList;