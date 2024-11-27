import { useEffect, useState } from "react";
import { Button, Pagination, Table } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";

const PageNavigation = ({ numRecords, pageLimit, setCursorIndex }) => {
  const [pageNumber, setPageNumber] = useState(1);

  const maxPage = Math.floor((numRecords - 1) / pageLimit) + 1;

  return (
    <Pagination className='align-self-end'>
      <Pagination.First
        disabled={pageNumber === 1}
        onClick={() => {
          setPageNumber(1);
          setCursorIndex(0);
        }}
      />
      {pageNumber > 2 && (
        <Pagination.Ellipsis
          onClick={() => {
            setPageNumber(pageNumber - 2);
            setCursorIndex((pageNumber - 3) * pageLimit);
          }}
        />
      )}
      {pageNumber > 1 && (
        <Pagination.Item
          active={false}
          onClick={() => {
            setPageNumber(pageNumber - 1);
            setCursorIndex((pageNumber - 2) * pageLimit);
          }}
        >
          {pageNumber - 1}
        </Pagination.Item>
      )}
      <Pagination.Item active={numRecords > 0} disabled={numRecords === 0}>
        {pageNumber}
      </Pagination.Item>
      {pageNumber < maxPage && (
        <Pagination.Item
          active={false}
          onClick={() => {
            setPageNumber(pageNumber + 1);
            setCursorIndex(pageNumber * pageLimit);
          }}
        >
          {pageNumber + 1}
        </Pagination.Item>
      )}
      {pageNumber < maxPage - 1 && (
        <Pagination.Ellipsis
          onClick={() => {
            setPageNumber(pageNumber + 2);
            setCursorIndex((pageNumber + 1) * pageLimit);
          }}
        />
      )}
      <Pagination.Last
        disabled={pageNumber >= maxPage}
        onClick={() => {
          setPageNumber(maxPage);
          setCursorIndex((maxPage - 1) * pageLimit);
        }}
      />
    </Pagination>
  );
};

const PaginatedTable = ({
  header,
  records,
  pageLimit,
  filtered,
  clearFilters,
}) => {
  const [cursorIndex, setCursorIndex] = useState(0);

  useEffect(() => {
    if (cursorIndex >= records.length) setCursorIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records.length]);

  return (
    <div className='d-flex flex-column'>
      <div className='text-secondary align-self-start'>
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
