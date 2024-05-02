import {
  Button,
  ButtonGroup,
  Collapse,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

const ProgressionEngagement = ({
  task,
  task_idx,
  tasks,
  handleTasksChange,
}) => {
  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  const Progression = () => {
    return (
      <div className='d-flex flex-column w-100'>
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
              size='sm'
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
    );
  };

  const Engagement = () => {
    return (
      <div className='ms-auto w-100'>
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
          <ButtonGroup id={`${task_idx}_engagement`} className='bg-body'>
            {["1", "2", "3", "4"].map((eng) => (
              <Button
                key={eng}
                size='sm'
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

  return isDesktop ? (
    <div className='d-flex'>
      <div
        style={{
          width: task.standards.length > 0 ? "0%" : "50%",
          overflow: "hidden",
          transition: "width 0.35s",
        }}
      >
        {Progression()}
      </div>
      <div
        className={"d-flex" + (task.standards.length > 0 ? "" : " ps-3")}
        style={{
          width: task.standards.length > 0 ? "100%" : "50%",
          transition: "width 0.35s",
        }}
      >
        {Engagement()}
      </div>
    </div>
  ) : (
    <div className='d-flex flex-column'>
      <Collapse in={task.standards.length === 0} dimension={"height"} appear>
        <div>{Progression()}</div>
      </Collapse>
      <div
        className={"d-flex" + (task.standards.length > 0 ? "" : " pt-3")}
        style={{
          height: task.standards.length > 0 ? "100%" : "50%",
          transition: "height 0.35s",
        }}
      >
        {Engagement()}
      </div>
    </div>
  );
};

export default ProgressionEngagement;
