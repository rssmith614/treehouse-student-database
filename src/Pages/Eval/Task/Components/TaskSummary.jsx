import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Collapse,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import useDebounce from "../../../../Services/debounce";
import ProgressionEngagement from "./ProgressionEngagement";
import ASCIIMathTip from "../../../../Components/ASCIIMathTip";

const TaskSummary = ({
  task,
  task_idx,
  tasks,
  handleTasksChange,
  entered,
  showPreview,
  setShowPreview,
}) => {
  const [showTypesettingTip, setShowTypesettingTip] = useState(false);

  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (typeof window.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise();
    }
  }, [showTypesettingTip]);

  useEffect(() => {
    if (
      window.MathJax.startup.document.getMathItemsWithin(
        document.getElementById(`${task_idx}_comments_preview`),
      ).length > 0 &&
      entered
    ) {
      setShowPreview(true);
    }
  }, [entered, setShowPreview, task_idx]);

  const handleTypeset = useDebounce(() => {
    if (typeof window.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise().then(() => {
        setLoadingPreview(false);
      });
    }

    if (
      window.MathJax.startup.document.getMathItemsWithin(
        document.getElementById(`${task_idx}_comments_preview`),
      ).length > 0 &&
      entered
    ) {
      setShowPreview(true);
    }
  }, 500);

  return (
    <>
      <div className='h5 d-flex'>
        <div className='align-middle'>Summary</div>
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
                setLoadingPreview(true);
                handleTypeset();
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
          <Collapse in={showPreview} appear>
            <div>
              <Card className='mt-3 bg-light-subtle'>
                <Card.Body>
                  <div className='d-flex'>
                    <div className='h6 text-decoration-underline'>Preview</div>
                    <span className='ps-2'>
                      {loadingPreview && (
                        <span
                          className='spinner-border spinner-border-sm align-top'
                          role='status'
                        >
                          <span className='visually-hidden'>Loading...</span>
                        </span>
                      )}
                    </span>
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
                  <div
                    id={`${task_idx}_comments_preview`}
                    className='placeholder-glow word-wrap text-break'
                  >
                    <div className={loadingPreview ? "" : ""}>
                      {task.comments}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Collapse>
          <hr />
          <ProgressionEngagement
            task={task}
            task_idx={task_idx}
            tasks={tasks}
            handleTasksChange={handleTasksChange}
          />
        </div>
      </div>
      <ASCIIMathTip show={showTypesettingTip} setShow={setShowTypesettingTip} />
    </>
  );
};

export default TaskSummary;
