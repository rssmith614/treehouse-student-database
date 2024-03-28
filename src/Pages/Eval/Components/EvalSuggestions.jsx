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

const EvalSuggestions = ({ standardSuggestions }) => {
  const [showStandardInfo, setShowStandardInfo] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);

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
      <Collapse in={standardSuggestions.length > 0} className='w-100'>
        <div>
          <hr />
          <Card className='d-flex flex-column bg-light-subtle'>
            <Card.Header>
              <div className='h4'>Standards</div>
              <Card.Subtitle className='text-muted'>
                Suggestions for {""}
              </Card.Subtitle>
            </Card.Header>
            <Card.Body>
              <Container>
                <div className='row cols-auto justify-content-between'>
                  {standardSuggestions.filter((s) => s.progression).length >
                    0 && (
                    <Card className='col'>
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
                    <Card className='col'>
                      <Card.Body>
                        <div className='d-flex justify-content-between'>
                          <h4>Up Next</h4>
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Popover>
                                <Popover.Header>Up Next</Popover.Header>
                                <Popover.Body>
                                  These suggestions are based on standards that
                                  have been mastered recently.
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
                                <Card.Body className='d-flex justify-content-between align-items-center'>
                                  <div className='d-flex flex-column'>
                                    <div className='d-flex justify-content-between align-items-center'>
                                      <Button
                                        variant='link'
                                        onClick={() => {
                                          setSelectedStandard(standard.parent);
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
