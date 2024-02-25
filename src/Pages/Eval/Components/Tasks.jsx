import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import TaskStandards from "./TaskStandards";
import TaskSummary from "./TaskSummary";

const Tasks = ({ tasks, setTasks, standards, setStandards }) => {
  function addTask() {
    setTasks([
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
      <Card className='mb-3' key={task_idx}>
        <Card.Header className='d-flex'>
          <div className='h5 align-self-end'>Task {task_idx + 1}</div>
          <Button
            type='button'
            variant='danger'
            className='ms-auto'
            onClick={() => {
              setTasks(tasks.filter((t, i) => i !== task_idx));
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
              setTasks={setTasks}
            />
          </div>
          <div className='vr mx-3' />
          <div className='d-flex flex-column'>
            <TaskStandards
              task={task}
              task_idx={task_idx}
              tasks={tasks}
              setTasks={setTasks}
              standards={standards}
              setStandards={setStandards}
            />
          </div>
        </Card.Body>
      </Card>
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
