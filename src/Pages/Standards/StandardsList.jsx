import { Card, Nav, Tab } from "react-bootstrap";
import StandardsOfCategory from "../../Components/StandardsOfCategory";
import { useEffect, useState } from "react";

const grades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade']
const categories = ['Math', 'Reading']

const StandardsList = () => {
  const [grade, setGrade] = useState(localStorage.getItem('grade') || 'K');
  const [category, setCategory] = useState(localStorage.getItem('category') || 'Math');

  useEffect(() => {
    localStorage.setItem('grade', grade)
    localStorage.setItem('category', category)
  }, [grade, category])

  const gradeTabs = (
    grades.map((g) => {
      return (
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab" aria-current="true"
            eventKey={g.at(0)} onClick={() => setGrade(g.at(0))}>{g}</Nav.Link>
        </Nav.Item>
      );
    })
  );
  
  const categoryTabs = (
    categories.map((c) => {
      return (
        <Nav.Item>
          <Nav.Link data-bs-toggle="tab" aria-current="true"
          eventKey={c} onClick={() => setCategory(c)}>{c}</Nav.Link>
        </Nav.Item>
      )
    })
  );

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
          <StandardsOfCategory grade={grade} category={category} />
        </Card.Body>
      </Card>
    </div>
  );
}

export default StandardsList;