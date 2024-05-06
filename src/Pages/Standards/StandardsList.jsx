import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Nav,
  Row,
} from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { useEffect, useState } from "react";
import StandardInfo from "./Components/StandardInfo";
import { Can } from "../../Services/can";
import { Standard } from "../../Services/defineAbility";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Services/firebase";

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

  const [showNew, setShowNew] = useState(false);

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

  async function createNewStandard(e) {
    e.preventDefault();

    const grade = document.getElementById("grade").value;
    const category = document.getElementById("category").value;
    const subCategory = document.getElementById("subCategory").value;
    const standardKey = document.getElementById("standardKey").value;

    let clean = true;

    if (subCategory === "") {
      document.getElementById("subCategory").classList.add("is-invalid");
      clean = false;
    } else {
      document.getElementById("subCategory").classList.remove("is-invalid");
    }

    if (standardKey === "") {
      document.getElementById("standardKey").classList.add("is-invalid");
      document.getElementById("keyFeedback").innerText =
        "Please enter a standard key";
      clean = false;
    } else {
      document.getElementById("standardKey").classList.remove("is-invalid");
    }

    if (!clean) {
      return;
    }

    await getDocs(
      query(collection(db, "standards"), where("key", "==", standardKey)),
    ).then((docs) => {
      if (docs.size > 0) {
        document.getElementById("standardKey").classList.add("is-invalid");
        document.getElementById("keyFeedback").innerText =
          "Standard key already exists";
        clean = false;
      }
    });

    if (!clean) {
      return;
    }

    const newStandard = {
      grade: grade,
      category: category,
      sub_category: subCategory,
      key: standardKey,
    };

    addDoc(collection(db, "standards"), newStandard).then((newDoc) => {
      navigate(`/standard/edit/${newDoc.id}`);
    });
  }

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
          <Row>
            <Col xs={12} md={3}>
              <InputGroup className='mb-3'>
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
            </Col>
          </Row>
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
            setShowNew(true);
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
        setEdit={true}
      />
      <Modal show={showNew} onHide={() => setShowNew(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Standard</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label>Grade</Form.Label>
              <Form.Select id='grade' defaultValue={grade}>
                {grades.map((g, i) => (
                  <option key={i} value={g.at(0)}>
                    {g}
                  </option>
                ))}
              </Form.Select>
              <div className='invalid-feedback'>Please select a grade</div>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Category</Form.Label>
              <Form.Select id='category' defaultValue={category}>
                {categories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Select>
              <div className='invalid-feedback'>Please select a category</div>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Sub-Category</Form.Label>
              <Form.Control type='text' id='subCategory' />
              <div className='invalid-feedback'>
                Please enter a sub-category
              </div>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Standard Key</Form.Label>
              <Form.Control type='text' id='standardKey' />
              <div id='keyFeedback' className='invalid-feedback'>
                Please enter a standard key
              </div>
            </Form.Group>
            <div className='d-flex'>
              <Button variant='secondary' onClick={() => setShowNew(false)}>
                Cancel
              </Button>
              <Button
                className='ms-auto'
                variant='primary'
                type='submit'
                onClick={createNewStandard}
              >
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StandardsList;
