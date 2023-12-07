import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../Services/firebase";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";



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

const AssessmentsList = () => {
  const [assessments, setAssessments] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    getDocs(collection(db, 'assessments'))
      .then(res => {
        let assessmentGroups = {};
        res.docs.forEach(amt => {
          if (assessmentGroups[amt.data().grade]) {
            assessmentGroups[amt.data().grade].push({ ...amt.data(), id: amt.id });
          } else {
            assessmentGroups[amt.data().grade] = [{ ...amt.data(), id: amt.id }];
          }
        })
        setAssessments(assessmentGroups);
      })

  }, [])

  return (
    <div className="d-flex flex-column p-3">
      <div className="display-1">
        All Assessments
      </div>
      <h5>Select an assessment to edit, or add a new one</h5>
      <Card className="bg-light-subtle py-3">
        <Container>
          <Row className="justify-content-around" xs={{ cols: 'auto' }}>
            {Object.entries(assessments).sort((a, b) => ({
              'numbernumber': a - b,
              'stringnumber': -1,
              'numberstring': 1,
              'stringstring': a > b ? 1 : -1
            }[typeof (a) + typeof (b)]
            )).map((amtGroup, i) => {
              return (
                <Col key={i}>
                  <Card className="p-3 my-3" key={i}>
                    <h5>{grades[amtGroup[0]]}</h5>
                    <Container>
                      <Row xs={{ cols: 'auto' }}>
                        {amtGroup[1].sort((a, b) => a.category.localeCompare(b.category)).map((amt, i) => {
                          return (
                            <Col key={i}>
                              <Button variant='link' className="link-body-emphasis link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                              onClick={() => navigate(`/assessments/edit/${amt.id}`)}>
                                {amt.category}
                              </Button>
                            </Col>
                          )
                        })}
                      </Row>
                    </Container>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Container>
      </Card>
    </div>
  );
}

export default AssessmentsList;