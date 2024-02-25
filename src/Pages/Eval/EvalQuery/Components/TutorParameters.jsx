import React, { useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

const TutorParameters = ({ tutors, tutorList, setTutorList }) => {
  const tutorDropdownLabel = (list) => {
    if (list.length === tutors.length || list.length === 0) {
      return "Any";
    } else {
      return list.map((t, i) => {
        return i > 0 ? " " + t.displayName : t.displayName;
      });
    }
  };

  const TutorDropdownToggle = React.forwardRef(
    ({ style, className, onClick, value }, ref) => (
      <Form.Control
        ref={ref}
        style={{ ...style, cursor: "pointer" }}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          onClick(e);
        }}
        value={tutorDropdownLabel(value)}
        readOnly
      ></Form.Control>
    ),
  );

  const TutorDropdown = React.forwardRef(
    ({ style, className, value, valueSetter }, ref) => {
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
          {tutors
            .filter((t) =>
              t.displayName.toLowerCase().includes(search.toLowerCase()),
            )
            .map((tutor, i) => {
              return (
                <Form.Check
                  key={i}
                  checked={value.includes(tutor)}
                  label={tutor.displayName}
                  className='mx-3 my-2 w-auto'
                  onChange={(e) => {
                    if (e.target.checked) {
                      valueSetter([...value, tutor]);
                    } else {
                      valueSetter(value.filter((t) => t !== tutor));
                    }
                  }}
                />
              );
            })}
        </div>
      );
    },
  );

  return (
    <Dropdown>
      <Dropdown.Toggle as={TutorDropdownToggle} value={tutorList} />
      <Dropdown.Menu
        as={TutorDropdown}
        value={tutorList}
        valueSetter={setTutorList}
      />
    </Dropdown>
  );
};

export default TutorParameters;
