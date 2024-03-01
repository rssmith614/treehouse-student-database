import React from "react";
import { Dropdown, Form, InputGroup } from "react-bootstrap";

const ComboTableHeader = React.forwardRef(
  (
    {
      children,
      style,
      className,
      "aria-labelledby": labeledBy,
      value,
      valueSetter,
      sortSetter,
    },
    ref,
  ) => (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}
    >
      <div className='dropdown-item'>
        <InputGroup>
          <Form.Control
            autoFocus
            type='text'
            placeholder='Search'
            value={value}
            onChange={(e) => valueSetter(e.target.value)}
          />
          <i
            className='bi bi-x-lg input-group-text'
            style={{ cursor: "pointer" }}
            onClick={() => valueSetter("")}
          />
        </InputGroup>
      </div>
      <Dropdown.Item onClick={() => sortSetter("name_asc")}>
        A - Z
      </Dropdown.Item>
      <Dropdown.Item onClick={() => sortSetter("name_desc")}>
        Z - A
      </Dropdown.Item>
    </div>
  ),
);

export default ComboTableHeader;
