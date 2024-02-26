import { Form, OverlayTrigger, Popover } from "react-bootstrap";

const TaskSummary = ({ task, task_idx, tasks, setTasks }) => {
  return (
    <>
      <div className='h5 d-flex'>
        Summary
        <OverlayTrigger
          placement='top'
          className='ms-auto'
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
                setTasks(
                  tasks.map((t, i) => {
                    if (i !== task_idx) return t;
                    else return { ...t, comments: e.target.value };
                  }),
                );
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              required
            />
            <div className='invalid-feedback'>
              Please provide a brief summary for this task
            </div>
          </div>
          {task.standards.length === 0 ? (
            <>
              <hr />
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
                <Form.Select
                  id={`${task_idx}_progression`}
                  style={{ width: "auto" }}
                  value={task.progression}
                  onChange={(e) => {
                    setTasks(
                      tasks.map((t, i) => {
                        if (i !== task_idx) return t;
                        else return { ...t, progression: e.target.value };
                      }),
                    );
                  }}
                >
                  <option disabled value=''>
                    Select One
                  </option>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                </Form.Select>
                <div className='invalid-feedback'>
                  Please set a progression for this task
                </div>
              </div>
            </>
          ) : null}
          <hr />
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
            <Form.Select
              id={`${task_idx}_engagement`}
              style={{ width: "auto" }}
              value={task.engagement}
              onChange={(e) => {
                setTasks(
                  tasks.map((t, i) => {
                    if (i !== task_idx) return t;
                    else return { ...t, engagement: e.target.value };
                  }),
                );
              }}
            >
              <option disabled value=''>
                Select One
              </option>
              <option value='1'>1</option>
              <option value='2'>2</option>
              <option value='3'>3</option>
              <option value='4'>4</option>
            </Form.Select>
            <div className='invalid-feedback'>
              Please set an engagement level for this task
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskSummary;
