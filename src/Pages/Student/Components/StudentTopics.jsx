import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Button, Card, OverlayTrigger, Popover } from "react-bootstrap";
import { auth } from "../../../Services/firebase";
import { updateDoc } from "firebase/firestore";
import ASCIIMathTip from "../../../Components/ASCIIMathTip";

const StudentTopics = ({ student, topics }) => {
  const [editing, setEditing] = useState(false);

  const [showTypesettingTip, setShowTypesettingTip] = useState(false);

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise();
    }
  }, [showTypesettingTip, editing]);

  function updateTopics() {
    let newTopics = {
      topics: document.getElementById("topics").value,
      updatedBy: auth.currentUser.displayName,
      updateDate: dayjs().toISOString(),
    };

    updateDoc(student, { topics: newTopics }).then(() => {
      setEditing(false);
    });
  }

  return (
    <div>
      <Card>
        <Card.Body>
          <div className='d-flex flex-column'>
            <div className='d-flex'>
              <div className='flex-fill'>
                {editing ? (
                  <div className='d-flex flex-column'>
                    <textarea
                      id='topics'
                      className='form-control'
                      defaultValue={topics.topics}
                      onChange={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                    <Button
                      variant='link'
                      className='text-muted align-self-end'
                      onClick={() => {
                        setShowTypesettingTip(true);
                      }}
                    >
                      AsciiMath is Supported
                    </Button>
                  </div>
                ) : (
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <div>
                      {topics.topics === "" ? "None yet..." : topics.topics}
                    </div>
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Popover>
                          <Popover.Header>Topics</Popover.Header>
                          <Popover.Body>
                            What topics is the student currently working on, or
                            what should they work on in the future?
                            <hr />
                            <div className='text-decoration-underline'>
                              Example
                            </div>
                            "Multiplication, Division, and Fractions"
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <i className='bi bi-info-square position-absolute top-0 end-0 p-3'></i>
                    </OverlayTrigger>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      <div className='row pt-3 px-3'>
        <Button
          className='col-2 me-3'
          variant='primary'
          onClick={() => {
            if (editing) {
              updateTopics();
            } else {
              setEditing(true);
            }
          }}
        >
          {editing ? "Save" : "Edit"}
        </Button>
        {editing ? (
          <Button
            className='col-2'
            variant='secondary'
            onClick={() => {
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        ) : null}
        <div className='text-muted col text-end'>
          Last updated by{" "}
          {topics.updatedBy === "" ? (
            "N/A"
          ) : (
            <span className='text-primary'>{topics.updatedBy}</span>
          )}{" "}
          on{" "}
          {topics.updateDate === "" ? (
            "N/A"
          ) : (
            <span className='text-primary'>
              {dayjs(topics.updateDate).format("M/D/YYYY")}
            </span>
          )}
        </div>
      </div>
      <ASCIIMathTip show={showTypesettingTip} setShow={setShowTypesettingTip} />
    </div>
  );
};

export default StudentTopics;
