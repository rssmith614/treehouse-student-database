import React from "react";
import { useState } from "react";
import { Button, Form, OverlayTrigger, Popover } from "react-bootstrap";

const grades = {
  K: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

function color(progression) {
  const parsed = parseFloat(progression);
  let color;
  if (parsed >= 3.5) {
    color = "success";
  } else if (parsed >= 2.5) {
    color = "primary text-dark ";
  } else if (parsed >= 1.5) {
    color = "warning";
  } else {
    color = "danger";
  }
  return color;
}

function label(progression) {
  const parsed = parseFloat(progression);
  let label;
  if (parsed >= 3.5) {
    label = "Exceeds Expectations";
  } else if (parsed >= 2.5) {
    label = "Meets Expectations";
  } else if (parsed >= 1.5) {
    label = "Below Expectations";
  } else {
    label = "Far Below Expectations";
  }
  return label;
}

const StandardDropdown = React.forwardRef(
  (
    {
      style,
      className,
      value,
      valueSetter,
      standards,
      newStandardSelector,
      setShowNewStandardPane,
    },
    ref,
  ) => {
    const [search, setSearch] = useState("");

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Control
          className='mx-3 my-2 w-auto'
          placeholder='Search'
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        {standards
          .filter((s) => {
            return -(
              s.key.toLowerCase().includes(search.toLowerCase()) ||
              s.category.toLowerCase().includes(search.toLowerCase()) ||
              s.sub_category.toLowerCase().includes(search.toLowerCase()) ||
              s.description.toLowerCase().includes(search.toLowerCase())
            );
          })
          .sort((a, b) => {
            return (
              a.key.split(".")[1].localeCompare(b.key.split(".")[1]) ||
              a.key.split(".")[2] - b.key.split(".")[2] ||
              a.key.split(".")[2].localeCompare(b.key.split(".")[2]) ||
              a.key.localeCompare(b.key)
            );
          })
          .map((standard, i) => {
            return (
              <OverlayTrigger
                placement='right'
                flip={true}
                key={standard.id}
                overlay={
                  <Popover className=''>
                    <Popover.Header>
                      {standard.key} <br />
                      {`${grades[standard.grade]} ${standard.category}: ${
                        standard.sub_category
                      }`}
                    </Popover.Header>
                    <Popover.Body>
                      <div className='text-decoration-underline'>
                        Description
                      </div>
                      <div className='mb-1'>{standard.description}</div>
                      {standard.progression && (
                        <span
                          className={`badge bg-${color(standard.progression)}`}
                        >
                          {standard.progression} - {label(standard.progression)}
                        </span>
                      )}
                      {standard.parent && (
                        <span className='badge bg-secondary me-2'>
                          Because you mastered {standard.parent.key}
                        </span>
                      )}
                    </Popover.Body>
                  </Popover>
                }
              >
                <div
                  key={standard.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    valueSetter(standard);
                  }}
                >
                  <Form.Check
                    type={"radio"}
                    checked={value.id === standard.id}
                    label={standard.key}
                    className='mx-3 my-2 w-auto'
                    onChange={() => {}}
                  />
                </div>
              </OverlayTrigger>
            );
          })}
        <div className='d-flex flex-column'>
          <div className='px-3 fs-6 fst-italic text-end'>
            Can't find what you're looking for?
          </div>
          <Button
            className='align-self-end'
            variant='link'
            onClick={() => {
              newStandardSelector.current = valueSetter;
              setShowNewStandardPane(true);
            }}
          >
            Find another Standard
          </Button>
        </div>
      </div>
    );
  },
);

export default StandardDropdown;
