import { useState } from "react";
import { Button, Pagination, Table } from "react-bootstrap";

const PageNavigation = ({
  numRecords,
  pageLimit,
  cursorIndex,
  setCursorIndex,
}) => {
  return (
    <Pagination>
      <Pagination.First onClick={() => setCursorIndex(0)} />
      <Pagination.Prev
        onClick={() => setCursorIndex(Math.max(cursorIndex - pageLimit, 0))}
      />
      {Array.from({ length: Math.ceil(numRecords / pageLimit) }, (_, i) => (
        <Pagination.Item
          key={i}
          active={i * pageLimit === cursorIndex}
          onClick={() => setCursorIndex(i * pageLimit)}
        >
          {i + 1}
        </Pagination.Item>
      ))}
      <Pagination.Next
        onClick={() =>
          setCursorIndex(
            Math.min(
              cursorIndex + pageLimit,
              Math.max(0, Math.floor((numRecords - 1) / pageLimit) * pageLimit),
            ),
          )
        }
      />
      <Pagination.Last
        onClick={() =>
          setCursorIndex(
            Math.max(0, Math.floor((numRecords - 1) / pageLimit) * pageLimit),
          )
        }
      />
    </Pagination>
  );
};

const PaginatedTable = ({
  records,
  pageLimit,
  header,
  filtered,
  clearFilters,
}) => {
  const [cursorIndex, setCursorIndex] = useState(0);

  return (
    <div>
      <PageNavigation
        numRecords={records.length}
        pageLimit={pageLimit}
        cursorIndex={cursorIndex}
        setCursorIndex={setCursorIndex}
      />
      <div className='text-secondary'>
        Showing {cursorIndex + 1} -{" "}
        {Math.min(cursorIndex + pageLimit, records.length)} of {records.length}{" "}
        {filtered ? (
          <>
            Filtered Results
            <Button
              variant='link'
              className='mb-1'
              style={{ "--bs-btn-padding-y": "0rem" }}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </>
        ) : null}
      </div>
      <Table striped hover style={{ tableLayout: "fixed" }}>
        {header}
        <tbody>{records.slice(cursorIndex, cursorIndex + pageLimit)}</tbody>
      </Table>
      <PageNavigation
        numRecords={records.length}
        pageLimit={pageLimit}
        cursorIndex={cursorIndex}
        setCursorIndex={setCursorIndex}
      />
    </div>
  );
};

export default PaginatedTable;
