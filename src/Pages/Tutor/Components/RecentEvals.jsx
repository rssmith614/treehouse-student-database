import { Card, Form } from "react-bootstrap";
import EvalsTable from "../../../Components/EvalsTable";

const RecentEvals = ({ tutorid }) => {
  return (
    <Card className='bg-light-subtle my-3 flex-fill'>
      <Card.Header>
        <div className='h3 pt-1'>
          <i className='bi bi-journal-text pe-2' />
          Recent Evaluations
        </div>
      </Card.Header>
      <Card.Body>
        <div className='d-flex flex-column'>
          <EvalsTable filterBy='tutor' id={tutorid} _limit={10} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecentEvals;
