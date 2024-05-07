import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Collapse, Modal, Row } from "react-bootstrap";
import { AbilityContext } from "../../../Services/can";
import { Standard } from "../../../Services/defineAbility";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "../../../Services/firebase";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";

const StandardInfo = ({
  selectedStandard,
  setSelectedStandard,
  show,
  setShow,
  addSelection,
  setEdit,
}) => {
  const ability = useContext(AbilityContext);

  const [compiledPreReqs, setCompiledPreReqs] = useState([]);
  const [compiledPostReqs, setCompiledPostReqs] = useState([]);

  const [standardImageURL, setStandardImageURL] = useState("");
  const [questionImageURL, setQuestionImageURL] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all(
      (selectedStandard?.prerequisites ?? []).map(async (prereq) => {
        let st = await getDoc(doc(db, "standards", prereq));
        return { ...st.data(), id: st.id };
      }),
    ).then((standards) => {
      setCompiledPreReqs(standards);
    });
  }, [selectedStandard?.prerequisites]);

  useEffect(() => {
    Promise.all(
      (selectedStandard?.postrequisites ?? []).map(async (postreq) => {
        let st = await getDoc(doc(db, "standards", postreq));
        return { ...st.data(), id: st.id };
      }),
    ).then((standards) => {
      setCompiledPostReqs(standards);
    });
  }, [selectedStandard?.postrequisites]);

  useEffect(() => {
    if (/^standards\/.*/.test(selectedStandard?.image || "")) {
      const standardImageRef = ref(storage, selectedStandard?.image);
      getDownloadURL(standardImageRef).then((url) => {
        setStandardImageURL(url);
      });
    } else {
      setStandardImageURL(selectedStandard?.image);
    }
  }, [selectedStandard?.image]);

  useEffect(() => {
    if (/^standards\/.*/.test(selectedStandard?.question_image || "")) {
      const questionImageRef = ref(storage, selectedStandard?.question_image);
      questionImageRef.getDownloadURL().then((url) => {
        setQuestionImageURL(url);
      });
    } else {
      setQuestionImageURL(selectedStandard?.question_image);
    }
  }, [selectedStandard?.question_image]);

  function color(progression) {
    const parsed = parseFloat(progression);
    let color;
    if (parsed >= 3.5) {
      color = "success";
    } else if (parsed >= 2.5) {
      color = "primary text-dark ";
    } else if (parsed >= 1.5) {
      color = "warning";
    } else {
      color = "danger";
    }
    return color;
  }

  function label(progression) {
    const parsed = parseFloat(progression);
    let label;
    if (parsed >= 3.5) {
      label = "Exceeds Expectations";
    } else if (parsed >= 2.5) {
      label = "Meets Expectations";
    } else if (parsed >= 1.5) {
      label = "Below Expectations";
    } else {
      label = "Far Below Expectations";
    }
    return label;
  }

  return (
    <Modal
      show={show}
      onHide={() => {
        setShow(false);
      }}
      onExited={() => setSelectedStandard(null)}
      size='lg'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <strong>{selectedStandard ? selectedStandard.key : ""}</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedStandard?.progression && (
          <div className='h4'>
            <span className={`badge bg-${color(selectedStandard.progression)}`}>
              {selectedStandard?.progression} -{" "}
              {label(selectedStandard.progression)}
            </span>
          </div>
        )}
        {selectedStandard?.parent && (
          <div className='h4'>
            Because you mastered{" "}
            <Button
              variant='link'
              onClick={() => setSelectedStandard(selectedStandard.parent)}
            >
              {selectedStandard.parent.key}
            </Button>
          </div>
        )}
        <p className='fst-italic text-decoration-underline'>Description</p>
        <Card className='bg-light-subtle'>
          <Card.Body>
            <div className='d-flex'>
              {standardImageURL ? (
                <img
                  src={standardImageURL}
                  alt={selectedStandard?.description}
                  style={{ maxHeight: "250px" }}
                />
              ) : null}
              <div className='p-3'>
                <p>{selectedStandard ? selectedStandard.description : ""}</p>
              </div>
            </div>
            <div className='d-flex pt-3'>
              <div className='me-3 w-50'>
                <p className='fst-italic text-decoration-underline'>
                  Standard Prerequisites
                </p>
                <Card className=''>
                  <Card.Body>
                    <Row xs={{ cols: "auto" }}>
                      {compiledPreReqs.length > 0 ? (
                        compiledPreReqs.map((prereq, i) => (
                          <Col key={i}>
                            <Button
                              variant='link'
                              onClick={() => setSelectedStandard(prereq)}
                            >
                              {prereq.key}
                            </Button>
                          </Col>
                        ))
                      ) : (
                        <Col>
                          <p>No prerequisites</p>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </div>
              <div className='w-50'>
                <p className='fst-italic text-decoration-underline'>
                  Standard Postrequisites
                </p>
                <Card className=''>
                  <Card.Body>
                    <Row xs={{ cols: "auto" }}>
                      {compiledPostReqs.length > 0 ? (
                        compiledPostReqs.map((postreq, i) => (
                          <Col key={i}>
                            <Button
                              variant='link'
                              onClick={() => setSelectedStandard(postreq)}
                            >
                              {postreq.key}
                            </Button>
                          </Col>
                        ))
                      ) : (
                        <Col>
                          <p>No postrequisites</p>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Card.Body>
        </Card>
        {/* {selectedStandard?.question ? ( */}
        <Collapse in={(selectedStandard?.question ?? "") !== ""}>
          <div>
            <hr />
            <p className='fst-italic text-decoration-underline'>
              Example Question
            </p>
            <Card className='p-3 bg-light-subtle'>
              <Card.Body>
                <div className='d-flex'>
                  {questionImageURL ? (
                    <img
                      src={questionImageURL}
                      alt={selectedStandard?.question}
                      style={{ maxHeight: "250px" }}
                    />
                  ) : null}
                  <div className='d-flex flex-column p-3'>
                    <div className='fw-bold py-1'>
                      {selectedStandard?.question}
                    </div>
                    <div>Sample Answer: {selectedStandard?.answer}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Collapse>
        {/* ) : null} */}
        <div className='d-flex'>
          {addSelection ? (
            <Button
              className='mt-3'
              id='addStandard'
              onClick={() => {
                addSelection(selectedStandard);
                setShow(false);
              }}
            >
              Add
            </Button>
          ) : null}
          {!addSelection &&
          setEdit &&
          ability.can("edit", new Standard(selectedStandard)) ? (
            <Button
              variant='secondary'
              className='mt-3 ms-auto'
              id='editStandard'
              onClick={() => {
                navigate(`/standard/edit/${selectedStandard.id}`);
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default StandardInfo;
