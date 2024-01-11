import { useContext, useEffect, useState } from "react";
import { Button, Card, Nav, Offcanvas } from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { ToastContext } from "../../Services/toast";

const grades = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
];
const categories = ["Math", "Reading"];

const TrackStandard = ({ standards, setStandards, close }) => {
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [grade, setGrade] = useState(localStorage.getItem("grade") || "K");
  const [category, setCategory] = useState(
    localStorage.getItem("category") || "Math",
  );

  const [showSingle, setShowSingle] = useState(false);

  const addToast = useContext(ToastContext);

  useEffect(() => {
    localStorage.setItem("grade", grade);
    localStorage.setItem("category", category);
  }, [grade, category]);

  useEffect(() => {
    if (selectedStandard) {
      setShowSingle(true);
    }
  }, [selectedStandard]);

  function addStandard(e) {
    e.preventDefault();

    setStandards([...standards, selectedStandard]);
    setShowSingle(false);
    close();
    addToast({
      header: "Standard Added",
      message: `Standard ${selectedStandard.key} is ready to be added to the task`,
    });
  }

  const gradeTabs = grades.map((g, i) => {
    return (
      <Nav.Item key={i}>
        <Nav.Link
          data-bs-toggle='tab'
          aria-current='true'
          eventKey={g.at(0)}
          onClick={() => setGrade(g.at(0))}
        >
          {g}
        </Nav.Link>
      </Nav.Item>
    );
  });

  const categoryTabs = categories.map((c, i) => {
    return (
      <Nav.Item key={i}>
        <Nav.Link
          data-bs-toggle='tab'
          aria-current='true'
          eventKey={c}
          onClick={() => setCategory(c)}
        >
          {c}
        </Nav.Link>
      </Nav.Item>
    );
  });

  const addSingle = (
    <>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          Add <strong>{selectedStandard?.key}</strong> to the list of standards
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <p className='fst-italic text-decoration-underline'>Description</p>
        <p>{selectedStandard?.description}</p>
        {selectedStandard?.questions !== undefined ? (
          <>
            <p className='fst-italic text-decoration-underline'>
              Example Question
            </p>
            <div>Q: {selectedStandard.questions[0].question}</div>
            <div>A: {selectedStandard.questions[0].answer}</div>
          </>
        ) : (
          <></>
        )}
        <hr />

        <Button className='mt-3' id='addStandard' onClick={addStandard}>
          Add
        </Button>
      </Offcanvas.Body>
    </>
  );

  return (
    <div className='d-flex flex-column p-3'>
      <div className='display-1'>Add Standard to Evaluation Task</div>
      <div className='h5'>Select a Standard to Add to a Task</div>
      <Card className='bg-light-subtle'>
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
          <StandardsOfCategory
            grade={grade}
            category={category}
            setSelection={setSelectedStandard}
            track
          />
        </Card.Body>
      </Card>
      <div className='d-flex p-3'>
        <Button variant='secondary' onClick={close}>
          Done
        </Button>
      </div>
      <Offcanvas
        show={showSingle}
        onHide={() => {
          setShowSingle(false);
        }}
        onExited={() => setSelectedStandard(null)}
        placement='end'
      >
        {addSingle}
      </Offcanvas>
    </div>
  );
};

export default TrackStandard;
