import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Card, Col, Container, OverlayTrigger, Popover, Row, Table } from "react-bootstrap";
import { db } from "../Services/firebase";


const statuses = {
  'None': 'Not Yet Tracked',
  '1': '1 - Far Below Expectations',
  '2': '2 - Below Expectations',
  '3': '3 - Meets Expectations',
  '4': '4 - Exceeds Expectations'
}

const grades = {
  'K': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
}

const StandardsOfStudent = ({ student, setSelectedStandard }) => {

  const [groupedStandards, setGroupedStandards] = useState({});

  useEffect(() => {
    getDocs(collection(student, 'standards'))
      .then(subCollStandards => {
        let groups = {};
        Promise.all(subCollStandards.docs.map(async s => {
          return getDoc(doc(db, 'standards', s.id))
            .then(standard => {
              let group = `${grades[standard.data().grade]} - ${standard.data().sub_category}`;
              if (groups[group]) {
                groups[group].push({...s.data(), ...standard.data(), id: standard.id});
              } else {
                groups[group] = [{...s.data(), ...standard.data(), id: standard.id}];
              }
            })
        }))
        .then(() => {
          setGroupedStandards(groups);
        });
      })
  }, [student])

  function color(status) {
    switch (status) {
      case '1':
        return 'link-danger';
      case '2':
        return 'link-warning';
      case '3':
        return 'link-success';
      case '4':
        return 'link-primary'
      default:
        return 'link-light';
    }
  }

  return (
    Object.entries(groupedStandards).sort((a,b) => a[0].localeCompare(b[0])).map((group, i) => {
      return (
        <Card className="p-3 my-3" key={i}>
          <Button variant="link" className="me-auto link-underline link-underline-opacity-0"
            style={{ cursor: 'default' }}>
              <h5>{group[0]}</h5></Button>

            <Container>
              <Row xs={{ cols: 'auto' }}>
                {group[1].sort((a,b) => {
                  return (
                    a.key.split('.')[1].localeCompare(b.key.split('.')[1]) ||
                    a.key.split('.')[2] - b.key.split('.')[2] ||
                    a.key.split('.')[2].localeCompare(b.key.split('.')[2]) ||
                    a.key.localeCompare(b.key)
                  )
                })
                .map((standard, i) => {
                  return (
                    <Col key={i}>
                      <OverlayTrigger
                        overlay={
                          <Popover className="">
                            <Popover.Header>
                              {standard.key}
                            </Popover.Header>
                            <Popover.Body>
                              <div className="text-decoration-underline">Description</div>
                              {standard.description}
                              <hr />
                              <div className="text-decoration-underline">Progression</div>
                              {statuses[standard.status]}
                            </Popover.Body>
                          </Popover>
                        }>
                        <button className={`btn btn-link ${color(standard.status)}
                          link-underline-opacity-0 link-underline-opacity-75-hover`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedStandard(standard)}>
                            {standard.key}</button>
                      </OverlayTrigger>
                    </Col>
                  )
                })}
              </Row>
            </Container>
        </Card>
      );
    })
  )
}

export default StandardsOfStudent;