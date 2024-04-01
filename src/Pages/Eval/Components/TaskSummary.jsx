import { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Collapse,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";

const TaskSummary = ({ task, task_idx, tasks, handleTasksChange }) => {
  const [showPreview, setShowPreview] = useState(false);

  const [showTypesettingTip, setShowTypesettingTip] = useState(false);

  useEffect(() => {
    if (typeof window.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise();

      if (
        window.MathJax.startup.document.getMathItemsWithin(document.body)
          .length > 0
      ) {
        setShowPreview(true);
      }
    }
  }, [task.comments, showTypesettingTip]);

  const ProgressionEngagement = () => {
    return (
      <div className='d-flex'>
        <div
          className={task.standards.length > 0 ? "" : "pe-3"}
          style={{
            width: task.standards.length > 0 ? "0%" : "50%",
            overflow: "hidden",
            transition: "width 0.5s",
          }}
        >
          <div className='d-flex flex-column'>
            <div className='h5 d-flex'>
              Progression
              <OverlayTrigger
                placement='top'
                overlay={
                  <Popover>
                    <Popover.Header>Progression</Popover.Header>
                    <Popover.Body>
                      How well did the student understand the material?
                    </Popover.Body>
                  </Popover>
                }
              >
                <i className='bi bi-info-square ms-auto ps-2'></i>
              </OverlayTrigger>
            </div>
            <ButtonGroup id={`${task_idx}_progression`} className='bg-body'>
              {["1", "2", "3", "4"].map((prog) => (
                <Button
                  key={prog}
                  variant={
                    task.progression === prog ? "primary" : "outline-secondary"
                  }
                  onClick={() => {
                    handleTasksChange(
                      tasks.map((t, i) => {
                        if (i !== task_idx) return t;
                        else return { ...t, progression: prog };
                      }),
                    );
                  }}
                >
                  {prog}
                </Button>
              ))}
            </ButtonGroup>
            <div className='invalid-feedback'>
              Please set a progression for this task
            </div>
          </div>
        </div>
        <div
          className={task.standards.length > 0 ? "" : "ps-3"}
          style={{
            width: task.standards.length > 0 ? "100%" : "50%",
            transition: "width 0.5s",
          }}
        >
          {Engagement()}
        </div>
      </div>
    );
  };

  const Engagement = () => {
    return (
      <div>
        <div className='d-flex flex-column'>
          <div className='h5 d-flex'>
            Engagement
            <OverlayTrigger
              placement='top'
              overlay={
                <Popover>
                  <Popover.Header>Engagement</Popover.Header>
                  <Popover.Body>
                    How well did the student work with the tutor?
                  </Popover.Body>
                </Popover>
              }
            >
              <i className='bi bi-info-square ms-auto ps-2'></i>
            </OverlayTrigger>
          </div>
          <ButtonGroup name={`${task_idx}_engagement`} className='bg-body'>
            {["1", "2", "3", "4"].map((eng) => (
              <Button
                key={eng}
                variant={
                  task.engagement === eng ? "primary" : "outline-secondary"
                }
                onClick={() => {
                  handleTasksChange(
                    tasks.map((t, i) => {
                      if (i !== task_idx) return t;
                      else return { ...t, engagement: eng };
                    }),
                  );
                }}
              >
                {eng}
              </Button>
            ))}
          </ButtonGroup>
          <div className='invalid-feedback'>
            Please set an engagement level for this task
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='h5 d-flex'>
        <div className='align-middle'>Summary</div>
        <Collapse in={true} dimension='width'>
          <Button
            size='sm'
            className='ms-3 text-nowrap'
            variant='secondary'
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </Collapse>
        <OverlayTrigger
          placement='top'
          className='ms-auto align-middle'
          flip={true}
          overlay={
            <Popover>
              <Popover.Header>Comments</Popover.Header>
              <Popover.Body>
                What did the student work on? What did they do well? What did
                they struggle with?
                <hr />
                <div className='text-decoration-underline'>Example</div>
                "Worked on adding fractions with unlike denominators. Struggled
                with finding the least common denominator."
              </Popover.Body>
            </Popover>
          }
        >
          <i className='bi bi-info-square ms-auto'></i>
        </OverlayTrigger>
      </div>
      <div className='d-flex card bg-light-subtle'>
        <div className='card-body'>
          <div className='d-flex flex-column'>
            <textarea
              id={`${task_idx}_comments`}
              className='form-control'
              value={task.comments}
              onChange={(e) => {
                handleTasksChange(
                  tasks.map((t, i) => {
                    if (i !== task_idx) return t;
                    else return { ...t, comments: e.target.value };
                  }),
                );
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onMouseEnter={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              required
            />
            <div className='invalid-feedback'>
              Please provide a brief summary for this task
            </div>
          </div>
          <Collapse in={showPreview}>
            <div>
              <Card className='mt-3 bg-light-subtle'>
                <Card.Body>
                  <div className='d-flex'>
                    <div className='h6 text-decoration-underline'>Preview</div>
                    <Button
                      variant='link'
                      className='ms-auto'
                      onClick={() => {
                        setShowTypesettingTip(true);
                      }}
                    >
                      <i className='bi bi-question-square'></i>
                    </Button>
                  </div>
                  <div>{task.comments}</div>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
          <hr />
          {/* <Collapse in={task.standards.length > 0}>{Engagement()}</Collapse>
          <Collapse in={task.standards.length === 0}>
            {ProgressionEngagement()}
          </Collapse> */}
          {ProgressionEngagement()}
        </div>
      </div>
      <Modal
        show={showTypesettingTip}
        onHide={() => setShowTypesettingTip(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Typesetting Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Typesetting is the process of converting mathematical notation into
            a format that can be displayed on a computer screen or printed.
          </p>
          <p>
            To enable typesetting using AsciiMath, wrap your mathematical
            notation in <code>`backticks`</code>.
          </p>
          <p>
            <span className='text-decoration-underline'>Examples</span>
            <br />
            <code>`f(x) = x^2`</code> {`\`-> f(x) = x^2\``}
            <br />
            <br />
            <code>{`\`1/2 + 2/3\``}</code> {`\`-> 1/2 + 2/3\``}
            <br />
            <br />
            <code>{`\`sqrt 2\``}</code> {`\`-> sqrt 2\``}
          </p>
          <p>And many, many more...</p>
          <p>
            For more information, check out the{" "}
            <a
              href='https://asciimath.org/#syntax'
              target='_blank'
              rel='noreferrer'
            >
              AsciiMath Docs
            </a>
            .
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TaskSummary;
