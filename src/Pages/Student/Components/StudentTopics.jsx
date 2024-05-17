import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Modal,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { auth } from "../../../Services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import ASCIIMathTip from "../../../Components/ASCIIMathTip";

const StudentTopics = ({ student, topics }) => {
  // const [editing, setEditing] = useState(false);

  const [focusedTopic, setFocusedTopic] = useState();

  const [showTypesettingTip, setShowTypesettingTip] = useState(false);

  useEffect(() => {
    if (typeof window?.MathJax !== "undefined") {
      window.MathJax.texReset();
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise();
    }
  }, [showTypesettingTip, focusedTopic]);

  function publishTopic(t) {
    let { id, ...rest } = t;
    if (id) {
      updateDoc(doc(student, "topics", id), rest);
    } else {
      addDoc(collection(student, "topics"), rest);
    }
    setFocusedTopic();
  }

  const EditTopic = ({ topic }) => {
    const [newTopic, setNewTopic] = useState({ ...topic });

    return (
      <Modal
        show={focusedTopic !== undefined}
        onHide={() => setFocusedTopic()}
        size='lg'
        centered
      >
        <Card>
          <Card.Header>
            <div className='h3'>
              {focusedTopic?.id ? "Edit Topic" : "Add New Topic"}
            </div>
            <InputGroup>
              <input
                id='topic'
                type='text'
                className='form-control'
                value={newTopic.topic}
                onChange={(e) =>
                  setNewTopic((prev) => ({ ...prev, topic: e.target.value }))
                }
                placeholder='Enter a topic...'
              />
              <Form.Select
                value={newTopic.priority}
                onChange={(e) => {
                  setNewTopic((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }));
                }}
              >
                <option value='' disabled>
                  Priority...
                </option>
                <option value='1'>High</option>
                <option value='2'>Medium</option>
                <option value='3'>Low</option>
              </Form.Select>
            </InputGroup>
          </Card.Header>
          <Card.Body>
            <Card className='bg-light-subtle'>
              <Card.Body>
                <textarea
                  className='form-control'
                  value={newTopic.description}
                  onChange={(e) =>
                    setNewTopic((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder='Enter a description...'
                />
                <div className='d-flex justify-content-end pt-1'>
                  <Button
                    className='p-0 pe-1'
                    variant='link'
                    onClick={() => {
                      setFocusedTopic();
                      setShowTypesettingTip(true);
                    }}
                  >
                    ASCIIMath
                  </Button>
                  <span>is supported</span>
                </div>
              </Card.Body>
            </Card>
          </Card.Body>
          <Card.Footer className='d-flex'>
            {newTopic.id && (
              <Button
                variant='danger'
                onClick={() => {
                  setFocusedTopic();
                  deleteDoc(doc(student, "topics", newTopic.id));
                }}
              >
                Delete
              </Button>
            )}
            <Button
              className='ms-auto'
              variant='primary'
              onClick={() => {
                if (!newTopic.topic) {
                  document.getElementById("topic").classList.add("is-invalid");
                  return;
                }
                publishTopic({
                  ...newTopic,
                  updateDate: dayjs().toISOString(),
                  updatedBy: auth.currentUser.displayName,
                });
              }}
            >
              Save
            </Button>
          </Card.Footer>
        </Card>
      </Modal>
    );
  };

  const Topic = ({ topic }) => {
    return (
      <Card className='mb-3'>
        <Card.Header className='d-flex'>
          <div className='h5'>{topic.topic}</div>
          <div className='ms-auto'>
            {topic.priority === "1" ? (
              <div className='badge bg-danger'>High Priority</div>
            ) : topic.priority === "2" ? (
              <div className='badge bg-warning'>Medium Priority</div>
            ) : topic.priority === "3" ? (
              <div className='badge bg-success'>Low Priority</div>
            ) : null}
          </div>
        </Card.Header>
        <Card.Body>
          <div className='d-flex flex-column'>
            <div className='d-flex'>
              <div className='flex-fill'>
                <Card
                  className='bg-light-subtle p-3'
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {topic.description === "" ? (
                    <div className='text-muted'>No description</div>
                  ) : (
                    <div>{topic.description}</div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <Row className=''>
            <div className='text-muted col'>
              Last updated{" "}
              <span className='text-primary'>
                {dayjs(topic.updateDate).format("MMMM D, YYYY")}
              </span>{" "}
              by <span className='text-primary'>{topic.updatedBy}</span>
            </div>
            <Button
              size='sm'
              className='col-2 me-3'
              variant='secondary'
              onClick={() => {
                setFocusedTopic(topic);
              }}
            >
              Edit
            </Button>
          </Row>
        </Card.Footer>
      </Card>
    );
  };

  const topicsList = topics
    .sort((a, b) => {
      let priorityA = parseInt(a.priority) || 4;
      let priorityB = parseInt(b.priority) || 4;
      return (
        priorityA - priorityB || dayjs(b.updateDate).diff(dayjs(a.updateDate))
      );
    })
    .map((topic, topic_idx) => {
      return <Topic key={topic_idx} topic={topic} />;
    });

  return (
    <div>
      {topicsList}
      <div className='d-flex pt-3 px-3'>
        <OverlayTrigger
          placement='top'
          overlay={
            <Popover>
              <Popover.Header>Topics</Popover.Header>
              <Popover.Body>
                Use this tab to add potential topics to cover with the student.
                Topics can be assigned a priority level to help organize the
                student's learning plan.
              </Popover.Body>
            </Popover>
          }
        >
          <i className='bi bi-info-square ms-auto me-3 align-self-center'></i>
        </OverlayTrigger>
        <Button
          className=''
          variant='primary'
          onClick={() => {
            setFocusedTopic({
              topic: "",
              description: "",
              updateDate: "",
              updatedBy: "",
              priority: "",
            });
          }}
        >
          Add New Topic
        </Button>
      </div>
      <ASCIIMathTip show={showTypesettingTip} setShow={setShowTypesettingTip} />
      <EditTopic topic={focusedTopic} />
    </div>
  );
};

export default StudentTopics;
