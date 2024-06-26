import React, { useRef, useState } from "react";
import {
  Button,
  Card,
  Collapse,
  Dropdown,
  Form,
  Offcanvas,
} from "react-bootstrap";
import TrackStandard from "../../../Standards/TrackStandard";
import {
  StandardDropdownMenu,
  StandardDropdownToggle,
} from "./StandardDropdown";
import StandardInfo from "../../../Standards/Components/StandardInfo";
import { useMediaQuery } from "react-responsive";

const TaskStandards = ({
  task,
  task_idx,
  tasks,
  handleTasksChange,
  standards,
  setStandards,
}) => {
  const [showNewStandardPane, setShowNewStandardPane] = useState(false);

  const [showStandardInfo, setShowStandardInfo] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState({});

  const newStandardSelector = useRef((standardToAdd) => {
    const newTasks = tasks.map((t, i) => {
      if (i !== task_idx) return t;
      else
        return {
          ...t,
          standards: [...t.standards, standardToAdd],
        };
    });

    handleTasksChange(newTasks);
  });

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  const desktopStandards = task.standards.map((standard, standard_idx) => {
    return (
      <Collapse in={true} key={standard_idx} appear>
        <div>
          <li className='list-group-item d-flex' key={standard_idx}>
            <div className='d-flex flex-column justify-content-center pe-3'>
              <Button
                variant='danger'
                className='ms-auto'
                onClick={() => {
                  const newTasks = tasks.map((t, i) => {
                    if (i !== task_idx) return t;
                    else
                      return {
                        ...t,
                        standards: t.standards.filter(
                          (s, j) => j !== standard_idx,
                        ),
                      };
                  });
                  handleTasksChange(newTasks);
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
                  as={StandardDropdownMenu}
                  standards={standards}
                  newStandardSelector={newStandardSelector}
                  setShowNewStandardPane={setShowNewStandardPane}
                  value={standard}
                  valueSetter={(selection) => {
                    const newTasks = tasks.map((t, i) => {
                      if (i !== task_idx) return t;
                      else
                        return {
                          ...t,
                          standards: t.standards.map((s, j) => {
                            if (j !== standard_idx) return s;
                            else
                              return {
                                ...selection,
                                progression: "",
                              };
                          }),
                        };
                    });
                    handleTasksChange(newTasks);
                  }}
                  setSelectedStandard={setSelectedStandard}
                  setShowStandardInfo={setShowStandardInfo}
                  style={{
                    maxHeight: 350,
                    overflow: "scroll",
                  }}
                />
              </Dropdown>
              <Form.Select
                id={`${task_idx}_${standard_idx}_progression`}
                className={isDesktop ? "w-auto" : ""}
                value={standard?.progression}
                onChange={(e) => {
                  const newTasks = tasks.map((t, i) => {
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
                  });
                  handleTasksChange(newTasks);
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
        </div>
      </Collapse>
    );
  });

  const mobileStandards = task.standards.map((standard, standard_idx) => {
    return (
      <Collapse in={true} key={standard_idx} appear>
        <div>
          <li className='list-group-item d-flex' key={standard_idx}>
            <div className='d-flex flex-column'>
              <div className='d-flex pb-1'>
                <Button
                  variant='danger'
                  className='me-1'
                  onClick={() => {
                    const newTasks = tasks.map((t, i) => {
                      if (i !== task_idx) return t;
                      else
                        return {
                          ...t,
                          standards: t.standards.filter(
                            (s, j) => j !== standard_idx,
                          ),
                        };
                    });
                    handleTasksChange(newTasks);
                  }}
                >
                  <i className='bi bi-trash-fill' />
                </Button>
                <Dropdown>
                  <Dropdown.Toggle
                    id_={`${task_idx}_${standard_idx}_standard`}
                    as={StandardDropdownToggle}
                    value={standard?.key || "Standard"}
                    className=''
                    selected={standard}
                  />
                  <Dropdown.Menu
                    as={StandardDropdownMenu}
                    standards={standards}
                    newStandardSelector={newStandardSelector}
                    setShowNewStandardPane={setShowNewStandardPane}
                    value={standard}
                    valueSetter={(selection) => {
                      const newTasks = tasks.map((t, i) => {
                        if (i !== task_idx) return t;
                        else
                          return {
                            ...t,
                            standards: t.standards.map((s, j) => {
                              if (j !== standard_idx) return s;
                              else
                                return {
                                  ...selection,
                                  progression: "",
                                };
                            }),
                          };
                      });
                      handleTasksChange(newTasks);
                    }}
                    setSelectedStandard={setSelectedStandard}
                    setShowStandardInfo={setShowStandardInfo}
                    style={{
                      maxHeight: 350,
                      overflow: "scroll",
                    }}
                  />
                </Dropdown>
              </div>
              <Form.Select
                id={`${task_idx}_${standard_idx}_progression`}
                className={isDesktop ? "w-auto" : ""}
                value={standard?.progression}
                onChange={(e) => {
                  const newTasks = tasks.map((t, i) => {
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
                  });
                  handleTasksChange(newTasks);
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
        </div>
      </Collapse>
    );
  });

  return (
    <>
      <div className='h5'>Standards</div>
      <div className='d-flex'>
        <Card className='p-3 bg-light-subtle flex-fill justify-content-center'>
          <ul className='list-group mb-3'>
            {isDesktop ? desktopStandards : mobileStandards}
          </ul>
          <Button
            variant='secondary'
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
          }}
          standardSelector={newStandardSelector.current}
        />
      </Offcanvas>
      <StandardInfo
        show={showStandardInfo}
        setShow={setShowStandardInfo}
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
      />
    </>
  );
};

export default TaskStandards;
