import React, { useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

const StudentDropdown = React.forwardRef(
  (
    { style, className, selectedStudents, setSelectedStudents, allStudents },
    ref,
  ) => {
    const [search, setSearch] = useState("");

    return (
      <div
        ref={ref}
        style={{ ...style, maxHeight: "500px", overflowY: "auto" }}
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
        {allStudents
          .filter((s) =>
            s.student_name.toLowerCase().includes(search.toLowerCase()),
          )
          .filter((s) => {
            return !selectedStudents.some((selected) => selected.id === s.id);
          })
          .map((student, i) => {
            return (
              <Dropdown.Item
                key={i}
                className='mx-3 my-2 w-auto'
                onClick={() => {
                  setSelectedStudents([...selectedStudents, student]);
                }}
              >
                {student.student_name}
              </Dropdown.Item>
            );
          })}
      </div>
    );
  },
);

export default StudentDropdown;
