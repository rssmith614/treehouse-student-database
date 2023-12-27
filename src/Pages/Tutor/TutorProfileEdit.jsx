import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebase";
import { ToastContext } from "../../Services/toast";
import { Col, Form, Row } from "react-bootstrap";
import { AbilityContext } from "../../Services/can";
import { Tutor } from "../../Services/defineAbility";
import { useAbility } from "@casl/react";

const TutorProfileEdit = () => {
  const [tutor, setTutor] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedClearance, setSelectedClearance] = useState("");

  const navigate = useNavigate();

  const addToast = useContext(ToastContext);
  const ability = useAbility(AbilityContext);

  const params = useParams();

  const tutorDocRef = useRef(doc(db, "tutors", params.tutorid));

  useEffect(() => {
    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) => {
      setTutor(doc.data());
      if (doc.data().clearance === "pending") setSelectedClearance("");
      else setSelectedClearance(doc.data().clearance);

      setLoading(false);
    });

    return () => unsubscribeTutor();
  }, [params.tutorid]);

  function handleSubmit(e) {
    e.preventDefault();

    let newClearance = document.getElementById("tutorclearance").value;

    if (
      (newClearance === "held" || newClearance === "revoked") &&
      tutor.clearance !== newClearance
    ) {
      if (
        !window.confirm(
          `You are about to REMOVE ALL priveleges for ${tutor.displayName}. They will not be allowed to view or alter any data. Are you sure you want to do this?`,
        )
      ) {
        return;
      }
    } else if (
      tutor.clearance === "admin" &&
      newClearance !== tutor.clearance
    ) {
      if (
        !window.confirm(
          `You are about to REMOVE admin priveleges for ${tutor.displayName}. Are you sure you want to do this?`,
        )
      ) {
        return;
      }
    } else if (newClearance === "admin" && newClearance !== tutor.clearance) {
      if (
        !window.confirm(
          `You are about to GRANT admin priveleges to ${tutor.displayName}. They will have full read, write, and edit permissions on all data. Are you sure you want to do this?`,
        )
      ) {
        return;
      }
    }

    tutor.clearance = newClearance;

    updateDoc(tutorDocRef.current, tutor)
      .then(() =>
        addToast({
          header: "Changes Saved",
          message: `Tutor ${tutor.displayName}'s profile has been updated`,
        }),
      )
      .then(() => navigate(`/tutor/${tutorDocRef.current.id}`));
  }

  const tutorInstance = new Tutor(tutor);

  const innerContent = (
    <div className='d-flex align-items-center'>
      <Row xs={{ cols: "auto" }}>
        <Col>
          <div className='d-flex flex-column p-3'>
            <div className='h3'>Email</div>
            <input
              className='form-control m-1'
              value={tutor.email || ""}
              disabled
              data-toggle='tooltip'
              title='Email cannot be modified'
            ></input>
          </div>
        </Col>
        <Col>
          <div className='d-flex flex-column p-3'>
            <div className='h3'>Clearance</div>
            <Form.Select
              id='tutorclearance'
              className='m-1'
              required
              value={selectedClearance}
              onChange={(e) => setSelectedClearance(e.target.value)}
              disabled={ability.cannot("edit", tutorInstance, "clearance")}
            >
              <option value='' disabled>
                Assign Clearance
              </option>
              <option value='admin'>Admin</option>
              <option value='tutor'>Tutor</option>
              <option value='held'>Held</option>
              <option value='revoked'>Revoked</option>
            </Form.Select>
          </div>
        </Col>
        <Col>
          <div className='d-flex flex-column p-3'>
            <div className='h3'>Preferred Student Ages</div>
            <Form.Control
              className='m-1'
              value={tutor.preferredAges || ""}
              onChange={(e) => {
                setTutor({ ...tutor, preferredAges: e.target.value });
              }}
            />
          </div>
        </Col>
        <Col>
          <div className='d-flex flex-column p-3'>
            <div className='h3'>Preferred Subjects</div>
            <Form.Control
              className='m-1'
              value={tutor.preferredSubjects || ""}
              onChange={(e) => {
                setTutor({ ...tutor, preferredSubjects: e.target.value });
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>Tutor Profile - {tutor.displayName}</h1>
      <form onSubmit={handleSubmit}>
        <div className='d-flex flex-row justify-content-center'>
          <div className='d-flex flex-fill m-3 p-3 card bg-light-subtle justify-content-center'>
            {loading ? (
              <div className='spinner-border align-self-center' />
            ) : (
              innerContent
            )}
          </div>
        </div>
        <div className='d-flex'>
          <button
            type='button'
            className='btn btn-secondary m-3'
            onClick={() => navigate(`/tutor/${tutorDocRef.current.id}`)}
          >
            Back
          </button>
          <button type='sumbit' className='btn btn-primary m-3 ms-auto'>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileEdit;
