import { useContext, useEffect, useState } from "react";
import { Button, Card, InputGroup, Nav, Form } from "react-bootstrap";
import { ToastContext } from "../../../Services/toast";
import StandardsOfCategory from "../../../Components/StandardsOfCategory";
import StandardInfo from "./StandardInfo";

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

const PickStandard = ({ standards, setStandards, close, standardSelector }) => {
  const [selectedStandard, setSelectedStandard] = useState(null);

  const [standardFilter, setStandardFilter] = useState("");

  const [grade, setGrade] = useState(localStorage.getItem("grade") || "K");
  const [category, setCategory] = useState(
    localStorage.getItem("category") || "Math",
  );

  const [show, setShow] = useState(false);

  const addToast = useContext(ToastContext);

  useEffect(() => {
    localStorage.setItem("grade", grade);
    localStorage.setItem("category", category);
  }, [grade, category]);

  function addStandard(standardToAdd) {
    standardSelector(standardToAdd);

    if (!standards.find((s) => s.id === standardToAdd.id)) {
      setStandards([...standards, standardToAdd]);
    }
    addToast({
      header: "Standard Added",
      message: `Standard ${standardToAdd.key} has been selected`,
    });
    close();
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

  useEffect(() => {
    if (selectedStandard) {
      setShow(true);
    }
  }, [selectedStandard]);

  return (
    <>
      <div className='d-flex flex-column p-3'>
        <div className='display-1'>Add Standard to Graph</div>
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
            <InputGroup className='w-25 mb-3'>
              <Form.Control
                type='text'
                placeholder={`Search ${grades.find((g) => g[0] === grade[0])} ${category}`}
                value={standardFilter}
                onChange={(e) => {
                  setStandardFilter(e.target.value);
                }}
              />
              <Button
                variant='secondary'
                className='bi bi-x-lg input-group-text'
                style={{ cursor: "pointer" }}
                onClick={() => setStandardFilter("")}
              />
            </InputGroup>
            <StandardsOfCategory
              grade={grade}
              category={category}
              setSelection={setSelectedStandard}
              addSelection={addStandard}
              filter={standardFilter}
              track
            />
          </Card.Body>
        </Card>
        <div className='d-flex p-3'>
          <Button variant='secondary' onClick={close}>
            Done
          </Button>
        </div>
      </div>
      <StandardInfo
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
        show={show}
        setShow={setShow}
        addSelection={addStandard}
      />
    </>
  );
};

export default PickStandard;
