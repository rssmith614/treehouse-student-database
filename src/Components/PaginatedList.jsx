import { useEffect, useState } from "react";
import { Button, Dropdown, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

const F_PageNavigation = ({
  totalRecords,
  numRecords,
  pageLimit,
  cursorIndex,
  setCursorIndex,
  advance,
}) => {
  return (
    <div className='d-flex justify-content-between'>
      <Button
        variant='secondary'
        disabled={cursorIndex === 0}
        onClick={() => setCursorIndex(cursorIndex - pageLimit)}
      >
        Previous
      </Button>
      <Button
        variant='secondary'
        disabled={cursorIndex + pageLimit >= totalRecords}
        onClick={(e) => {
          if (cursorIndex + pageLimit >= numRecords) {
            e.preventDefault();
            e.stopPropagation();
            e.target.innerHTML = "Loading...";
            e.target.disabled = true;
            advance().then(() => {
              e.target.innerHTML = "Next";
              e.target.disabled = false;
            });
          } else {
            setCursorIndex(cursorIndex + pageLimit);
          }
        }}
      >
        Next
      </Button>
    </div>
  );
};

const PaginatedList = ({
  records,
  pageLimit,
  tableSort,
  setTableSort,
  totalRecords,
  requery,
}) => {
  const [dropdownLabel, setDropdownLabel] = useState("Newest First");

  const [cursorIndex, setCursorIndex] = useState(0);

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  function recordsList() {
    return records.slice(cursorIndex, cursorIndex + pageLimit);
  }

  useEffect(() => {
    if (tableSort === "date_desc") {
      setDropdownLabel("Newest First");
    } else {
      setDropdownLabel("Oldest First");
    }
  }, [tableSort]);

  return (
    <>
      <div className='text-secondary align-self-start'>
        Showing {cursorIndex + 1} -{" "}
        {Math.min(cursorIndex + pageLimit, totalRecords)} of {totalRecords}{" "}
      </div>
      <Row className={`my-1 ${isDesktop && "w-50"}`}>
        <Dropdown>
          <Dropdown.Toggle variant='secondary'>{dropdownLabel}</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setTableSort("date_desc")}>
              Newest First
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTableSort("date_asc")}>
              Oldest First
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Row>
      <ul className='list-group mb-3'>
        {recordsList()}
        {/* {records} */}
      </ul>
      <F_PageNavigation
        totalRecords={totalRecords}
        numRecords={records.length}
        pageLimit={pageLimit}
        cursorIndex={cursorIndex}
        setCursorIndex={setCursorIndex}
        advance={async () => {
          await requery();
          setCursorIndex(cursorIndex + pageLimit);
        }}
      />
    </>
  );
};

export default PaginatedList;
