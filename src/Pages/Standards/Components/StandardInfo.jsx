import { useContext } from "react";
import { Button, Card, Modal } from "react-bootstrap";
import { AbilityContext } from "../../../Services/can";
import { Standard } from "../../../Services/defineAbility";

const StandardInfo = ({
  selectedStandard,
  setSelectedStandard,
  show,
  setShow,
  addSelection,
  setEdit,
}) => {
  const ability = useContext(AbilityContext);

  return (
    <Modal
      show={show}
      onHide={() => {
        setShow(false);
      }}
      onExited={() => setSelectedStandard(null)}
      size='lg'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <strong>{selectedStandard ? selectedStandard.key : ""}</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className='fst-italic text-decoration-underline'>Description</p>
        <p>{selectedStandard ? selectedStandard.description : ""}</p>
        {selectedStandard?.image ? (
          <Card.Img src={selectedStandard?.image} />
        ) : null}
        {selectedStandard?.question ? (
          <>
            <hr />
            <p className='fst-italic text-decoration-underline'>
              Example Question
            </p>
            {selectedStandard?.question_image ? (
              <Card.Img src={selectedStandard?.question_image} />
            ) : null}
            <div className='fw-bold pt-1'>{selectedStandard?.question}</div>
            <div>Sample Answer: {selectedStandard?.answer}</div>
          </>
        ) : null}
        <div className='d-flex'>
          {addSelection ? (
            <Button
              className='mt-3'
              id='addStandard'
              onClick={() => {
                addSelection(selectedStandard);
                setShow(false);
              }}
            >
              Add to Task
            </Button>
          ) : null}
          {!addSelection &&
          ability.can("edit", new Standard(selectedStandard)) ? (
            <Button
              variant='secondary'
              className='mt-3 ms-auto'
              id='editStandard'
              onClick={() => {
                setEdit(true);
              }}
            >
              Edit
            </Button>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default StandardInfo;
