import React, { useRef, useState } from "react";
import { Button, Card, Dropdown, Form, Offcanvas } from "react-bootstrap";
import TrackStandard from "../../Standards/TrackStandard";
import StandardDropdown from "./StandardDropdown";
import StandardDropdownToggle from "./StandardDropdownToggle";

const TaskStandards = ({
  task,
  task_idx,
  tasks,
  setTasks,
  standards,
  setStandards,
}) => {
  const [showNewStandardPane, setShowNewStandardPane] = useState(false);

  const newStandardSelector = useRef(null);

  return (
    <>
      <div className='h5'>Standards</div>
      <div className='d-flex'>
        <Card className='p-3 bg-light-subtle flex-fill justify-content-center'>
          {task.standards.length === 0 ? null : (
            <ul className='list-group mb-3'>
              {task.standards.map((standard, standard_idx) => {
                return (
                  <li className='list-group-item d-flex' key={standard_idx}>
                    <div className='d-flex flex-column justify-content-center pe-3'>
                      <Button
                        variant='danger'
                        className='ms-auto'
                        onClick={() => {
                          setTasks(
                            tasks.map((t, i) => {
                              if (i !== task_idx) return t;
                              else
                                return {
                                  ...t,
                                  standards: t.standards.filter(
                                    (s, j) => j !== standard_idx,
                                  ),
                                };
                            }),
                          );
                        }}
                      >
                        <i className='bi bi-trash-fill' />
                      </Button>
                    </div>
                    <div className='d-flex flex-column'>
                      <Dropdown className='pb-1'>
                        <Dropdown.Toggle
                          id_={`${task_idx}_${standard_idx}_standard`}
                          as={StandardDropdownToggle}
                          value={standard?.key || "Standard"}
                          className=''
                          selected={standard}
                        />
                        <Dropdown.Menu
                          as={StandardDropdown}
                          standards={standards}
                          newStandardSelector={newStandardSelector}
                          setShowNewStandardPane={setShowNewStandardPane}
                          value={standard}
                          valueSetter={(s) =>
                            setTasks(
                              tasks.map((t, i) => {
                                if (i !== task_idx) return t;
                                else {
                                  return {
                                    ...t,
                                    standards: t.standards.map((s1, j) => {
                                      if (j !== standard_idx) return s1;
                                      else
                                        return {
                                          ...s,
                                          progression: s1.progression,
                                        };
                                    }),
                                  };
                                }
                              }),
                            )
                          }
                          style={{
                            maxHeight: 350,
                            overflow: "scroll",
                          }}
                        />
                      </Dropdown>
                      <Form.Select
                        id={`${task_idx}_${standard_idx}_progression`}
                        style={{ width: "auto" }}
                        value={standard?.progression}
                        onChange={(e) => {
                          setTasks(
                            tasks.map((t, i) => {
                              if (i !== task_idx) return t;
                              else
                                return {
                                  ...t,
                                  standards: t.standards.map((s, j) => {
                                    if (j !== standard_idx) return s;
                                    else
                                      return {
                                        ...s,
                                        progression: e.target.value,
                                      };
                                  }),
                                };
                            }),
                          );
                        }}
                      >
                        <option disabled value=''>
                          Progression
                        </option>
                        <option value='1'>1 - Far Below Expectations</option>
                        <option value='2'>2 - Below Expectations</option>
                        <option value='3'>3 - Meets Expectations</option>
                        <option value='4'>4 - Exceeds Expectations</option>
                      </Form.Select>
                      <div className='invalid-feedback'>
                        Please select a progression for this standard
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Button
            variant='secondary'
            onClick={() => {
              setTasks(
                tasks.map((t, i) => {
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
                }),
              );
            }}
          >
            Add Standard
          </Button>
        </Card>
      </div>
      <Offcanvas
        show={showNewStandardPane}
        onHide={() => setShowNewStandardPane(false)}
        placement='end'
        style={{ width: "75%", overflow: "auto" }}
      >
        <TrackStandard
          standards={standards}
          setStandards={setStandards}
          close={() => {
            setShowNewStandardPane(false);
            newStandardSelector.current = null;
          }}
          standardSelector={newStandardSelector.current}
        />
      </Offcanvas>
    </>
  );
};

export default TaskStandards;
