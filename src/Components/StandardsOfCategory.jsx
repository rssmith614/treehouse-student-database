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
import { useAbility } from "@casl/react";
import { AbilityContext } from "../Services/can";
import { Standard } from "../Services/defineAbility";

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

  const ability = useAbility(AbilityContext);

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
      <div className='d-flex flex-column'>
        <span className='d-flex align-self-center spinner-border' />
      </div>
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
                        placement='right'
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
                              {/* {standard.questions !== undefined ? 
                              <>
                                <div className="text-decoration-underline">Example Question</div>
                                <div>Q: {standard.questions[0].question}</div>
                                <div>A: {standard.questions[0].answer}</div>
                              </>
                              :
                              <></>
                            } */}
                              {track ? (
                                <Button
                                  className='mt-3'
                                  id='addStandard'
                                  onClick={addSelection}
                                >
                                  Add
                                </Button>
                              ) : (
                                <></>
                              )}
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
                            if (
                              !track &&
                              !ability.can("edit", new Standard(standard))
                            ) {
                              return;
                            } else {
                              setSelection(standard);
                            }
                            setPoppedStandard(standard);
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
