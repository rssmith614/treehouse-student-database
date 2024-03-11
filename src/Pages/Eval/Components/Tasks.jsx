import React, { useEffect, useState } from "react";
import { Button, Card, Collapse, Container } from "react-bootstrap";
import TaskStandards from "./TaskStandards";
import TaskSummary from "./TaskSummary";

const Tasks = ({
  tasks,
  handleTasksChange,
  standards,
  setStandards,
  setTasksToDelete,
}) => {
  function addTask() {
    handleTasksChange([
      ...tasks,
      {
        subject: "",
        standards: [],
        progression: "",
        engagement: "",
        comments: "",
      },
    ]);
  }

  const tasksList = tasks.map((task, task_idx) => {
    return (
      <Collapse in={true} key={task_idx} appear>
        <Card className='mb-3'>
          <Card.Header className='d-flex'>
            <div className='h5 align-self-end'>Task {task_idx + 1}</div>
            <Button
              variant='link'
              className='ms-auto'
              disabled={task.standards.length > 0}
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
            >
              Add CC Standards
            </Button>
            <Button
              type='button'
              variant='danger'
              onClick={() => {
                const newTasks = tasks.filter((t, i) => i !== task_idx);
                handleTasksChange(newTasks);
                if (setTasksToDelete)
                  setTasksToDelete((prev) => [...prev, task.id]);
              }}
              disabled={tasks.length <= 1}
            >
              <i className='bi bi-trash-fill' />
            </Button>
          </Card.Header>
          <Card.Body className='d-flex'>
            <div className='d-flex flex-column flex-fill'>
              <TaskSummary
                task={task}
                task_idx={task_idx}
                tasks={tasks}
                handleTasksChange={handleTasksChange}
              />
            </div>
            <Collapse in={task.standards.length > 0} dimension={"width"} appear>
              <div>
                <div className='d-flex'>
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
  });

  return (
    <>
      <Container>{tasksList}</Container>
      <Button
        type='button'
        variant='secondary'
        className='me-auto'
        onClick={addTask}
      >
        Add Task
      </Button>
    </>
  );
};

export default Tasks;
