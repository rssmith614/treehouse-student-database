import dayjs from "dayjs";
import { useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Container,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import StandardInfo from "../../Standards/Components/StandardInfo";
import { useNavigate } from "react-router-dom";

const EvalSuggestions = ({
  standardSuggestions,
  studentid,
  studentName,
  topics,
}) => {
  const [showStandardInfo, setShowStandardInfo] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);

  const navigate = useNavigate();

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

  return (
    <>
      <Collapse
        in={standardSuggestions.length > 0 || topics.length > 0}
        className='w-100'
      >
        <div>
          {standardSuggestions.length > 0 && <hr />}
          {standardSuggestions.length > 0 && (
            <Card className='d-flex flex-column bg-light-subtle'>
              <Card.Header>
                <div className='h4'>Standards</div>
                <Card.Subtitle className='text-muted'>
                  Suggestions for {studentName}
                </Card.Subtitle>
              </Card.Header>
              <Card.Body>
                <Container>
                  <div className='row'>
                    {standardSuggestions.filter((s) => s.progression).length >
                      0 && (
                      <Card className='col-12 col-md-6'>
                        <Card.Body>
                          <div className='d-flex justify-content-between'>
                            <h4>To Review</h4>
                            <OverlayTrigger
                              placement='top'
                              overlay={
                                <Popover>
                                  <Popover.Header>To Review</Popover.Header>
                                  <Popover.Body>
                                    These standards have an average progression
                                    below 3.5 and have been worked on recently.
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <i className='bi bi-question-square'></i>
                            </OverlayTrigger>
                          </div>
                          <div className='d-flex flex-wrap'>
                            {standardSuggestions
                              .filter((s) => s.progression)
                              .map((standard) => (
                                <Card
                                  className='bg-light-subtle w-100 m-1'
                                  key={standard.id}
                                >
                                  <Card.Body>
                                    <div className='d-flex justify-content-between align-items-center'>
                                      <Button
                                        variant='link'
                                        onClick={() => {
                                          setSelectedStandard(standard);
                                          setShowStandardInfo(true);
                                        }}
                                        style={{
                                          "--bs-btn-padding-x": "0",
                                          "--bs-btn-padding-y": "0",
                                        }}
                                      >
                                        {standard.key}
                                      </Button>
                                      <div
                                        className={`badge bg-${color(standard.progression)}`}
                                      >
                                        {standard.progression}
                                      </div>
                                    </div>
                                    <div className='text-muted'>
                                      As of{" "}
                                      {dayjs(standard.asof).format(
                                        "MMMM D, YYYY",
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              ))}
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                    {standardSuggestions.filter(
                      (s) => s.progression === undefined,
                    ).length > 0 && (
                      <Card className='col-12 col-md-6'>
                        <Card.Body>
                          <div className='d-flex justify-content-between'>
                            <h4>Up Next</h4>
                            <OverlayTrigger
                              placement='top'
                              overlay={
                                <Popover>
                                  <Popover.Header>Up Next</Popover.Header>
                                  <Popover.Body>
                                    These suggestions are based on standards
                                    that have been mastered recently.
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <i className='bi bi-question-square'></i>
                            </OverlayTrigger>
                          </div>
                          <div className='d-flex flex-wrap'>
                            {standardSuggestions
                              .filter((s) => s.progression === undefined)
                              .map((standard) => (
                                <Card
                                  className='bg-light-subtle w-100 m-1'
                                  key={standard.id}
                                >
                                  <Card.Body className='d-flex justify-content-between align-items-center w-auto'>
                                    <div className='d-flex flex-column'>
                                      <div className='d-flex justify-content-between align-items-center'>
                                        <Button
                                          variant='link'
                                          onClick={() => {
                                            setSelectedStandard(
                                              standard.parent,
                                            );
                                            setShowStandardInfo(true);
                                          }}
                                          style={{
                                            "--bs-btn-padding-x": "0",
                                            "--bs-btn-padding-y": "0",
                                          }}
                                        >
                                          {standard.parent.key}
                                        </Button>
                                        <span
                                          className={`badge bg-${color(standard.parent.progression)}`}
                                        >
                                          {standard.parent.progression}
                                        </span>
                                      </div>
                                      <div className='text-muted'>
                                        As of{" "}
                                        {dayjs(standard.parent.asof).format(
                                          "MMMM D, YYYY",
                                        )}
                                      </div>
                                    </div>
                                    <i className='bi bi-arrow-right fs-2'></i>
                                    <Button
                                      variant='link'
                                      className=''
                                      onClick={() => {
                                        setSelectedStandard(standard);
                                        setShowStandardInfo(true);
                                      }}
                                      style={{
                                        "--bs-btn-padding-x": "0",
                                        "--bs-btn-padding-y": "0",
                                      }}
                                    >
                                      {standard.key}
                                    </Button>
                                  </Card.Body>
                                </Card>
                              ))}
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </div>
                </Container>
              </Card.Body>
            </Card>
          )}
          {topics.length > 0 && <hr />}
          {topics.length > 0 && (
            <Card className='d-flex flex-column bg-light-subtle mt-3'>
              <Card.Header>
                <div className='h4'>Topics</div>
                <Card.Subtitle className='text-muted'>
                  Suggestions for {studentName}
                </Card.Subtitle>
              </Card.Header>
              <Card.Body>
                {topics
                  .sort((a, b) => {
                    let priorityA = parseInt(a.priority) || 4;
                    let priorityB = parseInt(b.priority) || 4;
                    return (
                      priorityA - priorityB ||
                      dayjs(b.updateDate).diff(dayjs(a.updateDate))
                    );
                  })
                  .map((topic, topic_idx) => (
                    <Card key={topic_idx} className='mb-3'>
                      <Card.Header className='d-flex'>
                        <h5>{topic.topic}</h5>
                        <div className='ms-auto'>
                          {topic.priority === "1" ? (
                            <div className='badge bg-danger'>High Priority</div>
                          ) : topic.priority === "2" ? (
                            <div className='badge bg-warning'>
                              Medium Priority
                            </div>
                          ) : topic.priority === "3" ? (
                            <div className='badge bg-success'>Low Priority</div>
                          ) : null}
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Card className='bg-light-subtle p-3'>
                          {topic.description === "" ? (
                            <div className='text-muted'>No description</div>
                          ) : (
                            <div>{topic.description}</div>
                          )}
                        </Card>
                      </Card.Body>
                      <Card.Footer>
                        <div className='text-muted'>
                          Last updated{" "}
                          <span className='text-primary'>
                            {dayjs(topic.updateDate).format("MMMM D, YYYY")}
                          </span>{" "}
                          by{" "}
                          <span className='text-primary'>
                            {topic.updatedBy}
                          </span>
                        </div>
                      </Card.Footer>
                    </Card>
                  ))}
              </Card.Body>
              <Button
                variant='primary'
                className='align-self-end me-3 mb-3'
                onClick={() => {
                  localStorage.setItem("student_tab", "topics");
                  navigate(`/students/${studentid}`);
                }}
              >
                Go to Topics
              </Button>
            </Card>
          )}
        </div>
      </Collapse>
      <StandardInfo
        show={showStandardInfo}
        setShow={setShowStandardInfo}
        close={() => {
          setShowStandardInfo(false);
          setSelectedStandard(false);
        }}
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
      />
    </>
  );
};

export default EvalSuggestions;
