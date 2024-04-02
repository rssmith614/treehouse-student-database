import React, { useState } from "react";
import { Button, Card, Collapse, Container, Dropdown } from "react-bootstrap";
import TaskStandards from "./TaskStandards";
import TaskSummary from "./TaskSummary";
import Task from "./Task";

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
