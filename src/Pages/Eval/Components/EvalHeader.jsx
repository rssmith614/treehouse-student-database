import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../../Services/firebase";

const EvalHeader = ({ evaluation, handleEvalChange, loading, draft }) => {
  const [tutors, setTutors] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeTutors = onSnapshot(
      collection(db, "tutors"),
      (snapshot) => {
        const newTutors = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTutors(newTutors);
      },
    );

    return () => {
      unsubscribeTutors();
    };
  }, []);

  function tutorOptions() {
    return tutors.map((tutor) => {
      return (
        <option value={tutor.id} key={tutor.id}>
          {tutor.displayName}
        </option>
      );
    });
  }

  return (
    <>
      {loading ? (
        <div className='placeholder-wave'>
          <div className='placeholder h3 bg-primary py-3 col-1' />
        </div>
      ) : (
        <div className='d-flex'>
          <Button
            variant='link'
            className='me-auto'
            size='lg'
            style={{
              "--bs-btn-padding-x": "0rem",
              "--bs-btn-padding-y": "0rem",
            }}
            onClick={() => navigate(`/students/${evaluation.student_id}`)}
          >
            <div className='h3'>{evaluation.student_name}</div>
          </Button>
          {draft && (
            <Button
              variant='secondary'
              onClick={() => navigate(`/eval/edit/${draft}`)}
            >
              Load Draft
            </Button>
          )}
        </div>
      )}
      <div className='row my-3 justify-content-center'>
        <div className='col-12 col-md-6 pb-3'>
          <label className='form-label h5'>Tutor</label>
          <Form.Select
            id='tutor'
            className='form-control'
            value={evaluation?.tutor_id || ""}
            onChange={(e) => {
              const newEval = {
                ...evaluation,
                tutor_id: e.target.value,
                tutor_name: tutors.find((t) => t.id === e.target.value)
                  ?.displayName,
              };
              handleEvalChange(newEval);
            }}
          >
            <option disabled value=''>
              Select One
            </option>
            {tutorOptions()}
          </Form.Select>
          <div className='invalid-feedback'>Please select a tutor</div>
        </div>
        <div className='col col-xs'>
          <label className='form-label h5'>Date</label>
          <input
            id='date'
            className='form-control'
            type='date'
            value={evaluation?.date || ""}
            onChange={(e) => {
              const newEval = { ...evaluation, date: e.target.value };
              handleEvalChange(newEval);
            }}
          />
          <div className='invalid-feedback'>
            Please provide a date for the evaluation
          </div>
        </div>
      </div>
    </>
  );
};

export default EvalHeader;
