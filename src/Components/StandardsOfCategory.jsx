import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { db } from "../Services/firebase";

const StandardsOfCategory = ({
  grade,
  category,
  setSelection,
  addSelection,
  filter = "",
  track,
}) => {
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState(true);

  const [poppedStandard, setPoppedStandard] = useState({});

  useEffect(() => {
    const unsubscribeStandards = onSnapshot(
      query(
        collection(db, "standards"),
        where("grade", "==", grade),
        where("category", "==", category),
      ),
      (res) => {
        let newSubcategories = {};
        res.docs.forEach((standard) => {
          if (newSubcategories[standard.data().sub_category]) {
            newSubcategories[standard.data().sub_category].push({
              ...standard.data(),
              id: standard.id,
            });
          } else {
            newSubcategories[standard.data().sub_category] = [
              { ...standard.data(), id: standard.id },
            ];
          }
        });
        setSubcategories(newSubcategories);
        setLoading(false);
      },
    );

    return () => unsubscribeStandards();
  }, [grade, category]);

  if (loading)
    return (
      <>
        <Card className='p-3 my-3 mw-0 placeholder-wave'>
          <div className='h4 placeholder m-3 col-2 bg-primary' />
          <Container>
            <Row xs={{ cols: "auto" }}>
              {[...Array(5).fill(0)].map((_, index) => (
                <div className='placeholder m-3 col-1' key={index} />
              ))}
            </Row>
          </Container>
        </Card>
        <Card className='p-3 my-3 mw-0 placeholder-wave'>
          <div className='h4 placeholder m-3 col-2 bg-primary' />
          <Container>
            <Row xs={{ cols: "auto" }}>
              {[...Array(12).fill(0)].map((_, index) => (
                <div className='placeholder m-3 col-1' key={index} />
              ))}
            </Row>
          </Container>
        </Card>
      </>
    );

  return Object.entries(subcategories)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((subCat, i) => {
      return (
        <Card
          className='p-3 my-3'
          key={i}
          onTouchEnd={(e) => {
            if (e.target.id !== poppedStandard.id) setPoppedStandard({});
          }}
        >
          {track ? (
            <Button variant='link' className='me-auto' onClick={() => {}}>
              <h4>{subCat[0]}</h4>
            </Button>
          ) : (
            <Button
              variant='link'
              className='me-auto link-underline link-underline-opacity-0'
              style={{ cursor: "default" }}
            >
              <h4>{subCat[0]}</h4>
            </Button>
          )}
          <Container>
            <Row xs={{ cols: "auto" }}>
              {subCat[1]
                .filter((s) => {
                  return -(
                    s.key.toLowerCase().includes(filter.toLowerCase()) ||
                    s.category.toLowerCase().includes(filter.toLowerCase()) ||
                    s.sub_category
                      .toLowerCase()
                      .includes(filter.toLowerCase()) ||
                    s.description.toLowerCase().includes(filter.toLowerCase())
                  );
                })
                .sort((a, b) => {
                  return (
                    a.key.split(".")[1].localeCompare(b.key.split(".")[1]) ||
                    a.key.split(".")[2] - b.key.split(".")[2] ||
                    a.key.split(".")[2].localeCompare(b.key.split(".")[2]) ||
                    a.key.localeCompare(b.key)
                  );
                })
                .map((standard, i) => {
                  return (
                    <Col key={i}>
                      <OverlayTrigger
                        placement='top'
                        flip={true}
                        show={poppedStandard === standard}
                        overlay={
                          <Popover className=''>
                            <Popover.Header>{standard.key}</Popover.Header>
                            <Popover.Body>
                              <div className='text-decoration-underline'>
                                Description
                              </div>
                              <div>{standard.description}</div>
                              <div className='d-flex'>
                                {track ? (
                                  <Button
                                    className='mt-3'
                                    id='addStandard'
                                    onClick={() => {
                                      addSelection(standard);
                                    }}
                                  >
                                    Add
                                  </Button>
                                ) : (
                                  <></>
                                )}
                                <Button
                                  variant='link'
                                  className='ms-auto mt-3'
                                  onClick={() => {
                                    setSelection(standard);
                                    setPoppedStandard({});
                                  }}
                                >
                                  More...
                                </Button>
                              </div>
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          id={standard.id}
                          className='btn btn-link link-body-emphasis link-underline link-underline-opacity-0 link-underline-opacity-75-hover'
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.target.focus();
                            // if (!track) {
                            setPoppedStandard(standard);
                            // }
                          }}
                          onBlur={() => setPoppedStandard({})}
                        >
                          {standard.key}
                        </button>
                      </OverlayTrigger>
                    </Col>
                  );
                })}
            </Row>
          </Container>
        </Card>
      );
    });
};

export default StandardsOfCategory;
