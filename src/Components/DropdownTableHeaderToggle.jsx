import React from "react";

const DropdownTableHeaderToggle = React.forwardRef(
  ({ children, onClick }, ref) => (
    <div
      className='d-flex'
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </div>
  ),
);

export default DropdownTableHeaderToggle;
