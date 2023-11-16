import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Card, Col, Container, OverlayTrigger, Popover, Row } from "react-bootstrap";
import { db } from "../Services/firebase";


const StandardsOfCategory = ({ grade, category, setSelection }) => {

  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    setLoading(true);

    getDocs(query(
        collection(db, 'standards'),
        where('grade', '==', grade),
        where('category', '==', category))
      ).then((res) => {
        let newSubcategories = {};
        res.docs.forEach((standard) => {
          if (newSubcategories[standard.data().sub_category]) {
            newSubcategories[standard.data().sub_category].push({...standard.data(), id: standard.id});
          } else {
            newSubcategories[standard.data().sub_category] = [{...standard.data(), id: standard.id}];
          }
        })
        setSubcategories(newSubcategories);
      }).then(() => setLoading(false));

  }, [grade, category])


  if (loading)
    return <div className="d-flex flex-column"><span className='d-flex align-self-center spinner-border' /></div>

  return (
    Object.entries(subcategories).sort((a,b) => a[0].localeCompare(b[0])).map((subCat, i) => {
      return (
        <Card className="p-3 my-3" key={i}>
          <div className="h5">{subCat[0]}</div>
          <Container>
            <Row xs={{ cols: 'auto' }}>
              {subCat[1].sort((a,b) => {
                return (
                  a.key.split('.')[1].localeCompare(b.key.split('.')[1]) ||
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
                            {/* {standard.questions !== undefined ? 
                              <>
                                <div className="text-decoration-underline">Example Question</div>
                                <div>Q: {standard.questions[0].question}</div>
                                <div>A: {standard.questions[0].answer}</div>
                              </>
                              :
                              <></>
                            } */}
                          </Popover.Body>
                        </Popover>
                      }>
                      <button className="btn btn-link link-body-emphasis link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelection(standard)}>
                          {standard.key}</button>
                    </OverlayTrigger>
                  </Col>
                )
              })}
            </Row>
          </Container>
        </Card>
      )
    })
  )
}

export default StandardsOfCategory;