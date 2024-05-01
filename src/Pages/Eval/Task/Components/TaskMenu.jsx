import { Button, Dropdown } from "react-bootstrap";
import React from "react";

const TaskMenu = React.forwardRef(
  (
    {
      style,
      className,
      tasks,
      task,
      task_idx,
      handleTasksChange,
      showPreview,
      setShowPreview,
      setTasksToDelete,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={style}
        className={className}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
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
      </div>
    );
  },
);

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

export { TaskMenu, TaskMenuToggle };
