import React from "react";
import { Dropdown } from "react-bootstrap";

const SortTableHeader = React.forwardRef(
  ({ style, className, "aria-labelledby": labeledBy, sortSetter }, ref) => (
    <div
      ref={ref}
      style={style}
      className={className}
      aria-labelledby={labeledBy}
    >
      <Dropdown.Item onClick={() => sortSetter("name_asc")}>
        A - Z
      </Dropdown.Item>
      <Dropdown.Item onClick={() => sortSetter("name_desc")}>
        Z - A
      </Dropdown.Item>
    </div>
  ),
);

export default SortTableHeader;
