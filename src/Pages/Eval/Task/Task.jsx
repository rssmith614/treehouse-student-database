import { Card, Col, Collapse, Dropdown, Row } from "react-bootstrap";
import TaskSummary from "./Components/TaskSummary";
import TaskStandards from "./Components/TaskStandards";
import React, { useState } from "react";
import { TaskMenu, TaskMenuToggle } from "./Components/TaskMenu";
import MediaQuery from "react-responsive";

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
            <Dropdown.Menu
              as={TaskMenu}
              tasks={tasks}
              task={task}
              task_idx={task_idx}
              handleTasksChange={handleTasksChange}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              setTasksToDelete={setTasksToDelete}
            />
          </Dropdown>
        </Card.Header>
        <Card.Body className='d-flex'>
          <MediaQuery minWidth={992}>
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
          </MediaQuery>
          <MediaQuery maxWidth={991}>
            <Row className='flex-column flex-fill'>
              <Col className='flex-column flex-fill'>
                <TaskSummary
                  task={task}
                  task_idx={task_idx}
                  tasks={tasks}
                  handleTasksChange={handleTasksChange}
                  entered={entered}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />
              </Col>
              <Collapse
                in={task.standards.length > 0}
                dimension={"height"}
                appear
              >
                <div>
                  <div className='d-flex pt-3'>
                    <hr />
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
            </Row>
          </MediaQuery>
        </Card.Body>
      </Card>
    </Collapse>
  );
};

export default Task;
