import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import EvalSuggestions from "./EvalSuggestions";

const EvalNotes = ({ recentEvals, standardSuggestions, topics }) => {
  const [notes, setNotes] = useState([]);
  const [notesIndex, setNotesIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const navigate = useNavigate();

  // consolidate notes from recent evaluations
  useEffect(() => {
    const notes = recentEvals.map((e) => {
      return {
        id: e.id,
        tutor: e.tutor_name,
        date: e.date,
        notes: e.next_session,
      };
    });
    setNotes(notes);
  }, [recentEvals]);

  if (recentEvals.length === 0) return null;

  return (
    <div className='pb-3'>
      <Button
        variant=''
        className='w-100 ms-auto'
        onClick={() => setShowNotes(true)}
      >
        <Card className='shadow' style={{ cursor: "pointer" }}>
          <Card.Header>Last Session's Notes</Card.Header>
          <Card.Body>
            <div className='text-truncate'>{notes[0]?.notes}</div>
          </Card.Body>
        </Card>
      </Button>
      <Modal
        show={showNotes}
        onHide={() => setShowNotes(false)}
        centered
        size='lg'
      >
        <Modal.Header>
          <Modal.Title>For Today's Session</Modal.Title>
          <Button
            variant='secondary'
            onClick={() => setShowNotes(false)}
            style={{ "--bs-bg-opacity": "0" }}
          >
            <i className='bi bi-x-lg' />
          </Button>
        </Modal.Header>
        <Modal.Body>
          <Card className='d-flex flex-column bg-light-subtle'>
            <Card.Header>
              <div className='h4'>Previous Session Notes</div>
              <Card.Subtitle className='text-muted'>
                {recentEvals[0]?.student_name}
              </Card.Subtitle>
            </Card.Header>
            <Card.Body>
              <div className='d-flex'>
                <div className='d-flex flex-column'>
                  <div className='h6'>{notes[notesIndex]?.tutor}</div>
                  <div className='text-muted'>
                    {dayjs(notes[notesIndex]?.date).format("MMMM D, YYYY")}
                  </div>
                </div>
                <div className='ms-auto align-self-center'>
                  <Button
                    variant='primary'
                    size='sm'
                    onClick={() => navigate(`/eval/${notes[notesIndex]?.id}`)}
                  >
                    View Evaluation{" "}
                    <i className='ms-auto ps-1 bi bi-box-arrow-up-right'></i>
                  </Button>
                </div>
              </div>
              <hr />
              <div className=''>{notes[notesIndex]?.notes}</div>
            </Card.Body>
            <Card.Footer className='d-flex'>
              <Button
                variant='primary'
                size='sm'
                className='me-auto'
                disabled={notesIndex >= notes.length - 1}
                onClick={() => {
                  setNotesIndex(notesIndex + 1);
                }}
              >
                <i className='bi bi-arrow-left' />
              </Button>
              <div className='text-muted align-self-center'>
                {notes.length - notesIndex} / {notes.length}
              </div>
              <Button
                variant='primary'
                size='sm'
                className='ms-auto'
                disabled={notesIndex <= 0}
                onClick={() => {
                  setNotesIndex(notesIndex - 1);
                }}
              >
                <i className='bi bi-arrow-right' />
              </Button>
            </Card.Footer>
          </Card>
          <EvalSuggestions
            standardSuggestions={standardSuggestions}
            studentid={recentEvals[0]?.student_id}
            studentName={recentEvals[0]?.student_name}
            topics={topics}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EvalNotes;
