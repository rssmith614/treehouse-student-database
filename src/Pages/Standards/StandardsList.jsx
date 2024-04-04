import { Button, Card, Form, InputGroup, Nav } from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { useEffect, useState } from "react";
import StandardInfo from "./Components/StandardInfo";
import { Can } from "../../Services/can";
import { Standard } from "../../Services/defineAbility";
import { useNavigate } from "react-router-dom";

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

const StandardsList = () => {
  const [grade, setGrade] = useState(localStorage.getItem("grade") || "K");
  const [category, setCategory] = useState(
    localStorage.getItem("category") || "Math",
  );

  const [standardFilter, setStandardFilter] = useState("");
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [show, setShow] = useState(false);

  const [edit, setEdit] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("grade", grade);
    localStorage.setItem("category", category);
  }, [grade, category]);

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
    <div className='d-flex flex-column p-3'>
      <div className='display-1'>Standards Cheat Sheet</div>
      <div className='h5'>Quick reference for all Common Core standards</div>
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
            filter={standardFilter}
          />
        </Card.Body>
      </Card>
      <Can I='create' a={Standard}>
        <Button
          variant='secondary'
          className='mt-3 ms-auto'
          onClick={() => {
            setSelectedStandard({
              grade: grade,
              category: category,
            });
            setShow(true);
            setEdit(true);
          }}
        >
          Add New Standard
        </Button>
      </Can>
      <StandardInfo
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
        show={show}
        setShow={setShow}
        setEdit={setEdit}
      />
    </div>
  );
};

export default StandardsList;
