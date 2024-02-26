import React from "react";
import { Form, OverlayTrigger, Popover } from "react-bootstrap";

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

const StandardDropdownToggle = React.forwardRef(
  ({ style, className, onClick, value, id_, selected }, ref) => (
    <>
      {selected.key !== "" ? (
        <OverlayTrigger
          placement='right'
          flip={true}
          key={id_}
          overlay={
            <Popover className=''>
              <Popover.Header>
                {selected.key} <br />
                {`${grades[selected.grade]} ${selected.category}: ${
                  selected.sub_category
                }`}
              </Popover.Header>
              <Popover.Body>
                <div className='text-decoration-underline'>Description</div>
                {selected.description}
              </Popover.Body>
            </Popover>
          }
        >
          <Form.Control
            id={id_}
            ref={ref}
            style={{ ...style, cursor: "pointer" }}
            className={className}
            onClick={(e) => {
              e.preventDefault();
              onClick(e);
            }}
            value={value}
            onChange={() => {}}
            readOnly
          ></Form.Control>
        </OverlayTrigger>
      ) : (
        <Form.Control
          id={id_}
          ref={ref}
          style={{ ...style, cursor: "pointer" }}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            onClick(e);
          }}
          defaultValue={value}
          readOnly
        ></Form.Control>
      )}
      <div className='invalid-feedback'>Please select a standard</div>
    </>
  ),
);

export default StandardDropdownToggle;
