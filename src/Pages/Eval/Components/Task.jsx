import { Button, Card, Collapse, Dropdown } from "react-bootstrap";
import TaskSummary from "./TaskSummary";
import TaskStandards from "./TaskStandards";
import React, { useState } from "react";

const Task = ({
  task,
  task_idx,
  tasks,
  handleTasksChange,
  standards,
  setStandards,
  setTasksToDelete,
}) => {
  const [entered, setEntered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const TaskMenuToggle = React.forwardRef(({ onClick }, ref) => (
    <Button
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      variant=''
      style={{
        "--bs-btn-padding-x": "0",
        "--bs-btn-padding-y": "0",
      }}
    >
      <i className='bi bi-three-dots fs-4 text-primary'></i>
    </Button>
  ));

  return (
    <Collapse
      in={true}
      key={task_idx}
      appear
      onEntered={() => setEntered(true)}
    >
      <Card className='mb-3'>
        <Card.Header className='d-flex'>
          <div className='h5 align-self-end'>Task {task_idx + 1}</div>
          <Dropdown className='ms-auto'>
            <Dropdown.Toggle as={TaskMenuToggle} />
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setShowPreview(!showPreview);
                }}
              >
                {showPreview ? (
                  <i className='bi bi-eye-slash' />
                ) : (
                  <i className='bi bi-eye' />
                )}{" "}
                {showPreview ? "Hide" : "Show"} Summary Preview
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  const newTasks = tasks.map((t, i) => {
                    if (i !== task_idx) return t;
                    else
                      return {
                        ...t,
                        standards: [
                          ...t.standards,
                          {
                            key: "",
                            progression: "",
                          },
                        ],
                      };
                  });
                  handleTasksChange(newTasks);
                }}
                disabled={task.standards.length !== 0}
              >
                <i className='bi bi-plus' /> Add CC Standards
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  const newTasks = tasks.filter((t, i) => i !== task_idx);
                  handleTasksChange(newTasks);
                  if (setTasksToDelete)
                    setTasksToDelete((prev) => [...prev, task.id]);
                }}
                disabled={tasks.length <= 1}
              >
                <i className='bi bi-trash' /> Delete Task
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body className='d-flex'>
          <div className='d-flex flex-column flex-fill'>
            <TaskSummary
              task={task}
              task_idx={task_idx}
              tasks={tasks}
              handleTasksChange={handleTasksChange}
              entered={entered}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
            />
          </div>
          <Collapse in={task.standards.length > 0} dimension={"width"} appear>
            <div>
              <div className='d-flex h-100'>
                <div className='vr mx-3' />
                <div className='d-flex flex-column'>
                  <TaskStandards
                    task={task}
                    task_idx={task_idx}
                    tasks={tasks}
                    handleTasksChange={handleTasksChange}
                    standards={standards}
                    setStandards={setStandards}
                  />
                </div>
              </div>
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    </Collapse>
  );
};

export default Task;
