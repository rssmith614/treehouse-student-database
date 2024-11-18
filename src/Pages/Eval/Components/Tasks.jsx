import React from "react";
import { Button, Card, Container } from "react-bootstrap";
import Task from "../Task/Task";

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
      <Task
        key={task_idx}
        task={task}
        task_idx={task_idx}
        tasks={tasks}
        handleTasksChange={handleTasksChange}
        standards={standards}
        setStandards={setStandards}
        setTasksToDelete={setTasksToDelete}
      />
    );
  });

  return (
    <>
      <Container>
        {tasksList}
        <Card className='p-3'>
          <Button
            type='button'
            variant='secondary'
            className=''
            onClick={addTask}
          >
            Add Task
            <i className='bi bi-plus ps-2' />
          </Button>
        </Card>
      </Container>
    </>
  );
};

export default Tasks;
