import React from "react";
import { Form, InputGroup, Dropdown } from "react-bootstrap";

const FilterTableHeader = React.forwardRef(
  (
    { style, className, "aria-labelledby": labeledBy, value, valueSetter },
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
    </div>
  ),
);

export default FilterTableHeader;
