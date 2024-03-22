import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  or,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Card, Collapse, Form, Modal } from "react-bootstrap";
import { db, storage } from "../../../Services/firebase";
import { ToastContext } from "../../../Services/toast";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import PickStandard from "./PickStandard";

const EditStandard = ({
  show,
  setShow,
  setSelectedStandard,
  setEdit,
  selectedStandard,
}) => {
  const [imageType, setImageType] = useState("link");
  const [image, setImage] = useState(selectedStandard?.image || "");
  const [questionImageType, setQuestionImageType] = useState("link");
  const [questionImage, setQuestionImage] = useState(
    selectedStandard?.question_image || "",
  );

  const [prerequisites, setPrerequisites] = useState([]);
  const [postrequisites, setPostrequisites] = useState([]);

  const [showNewStandardPane, setShowNewStandardPane] = useState(false);

  const standards = useRef("");
  function setStandards(newStandards) {
    standards.current === "pre"
      ? setPrerequisites(newStandards)
      : setPostrequisites(newStandards);
  }

  const newStandardSelector = useRef((standardToAdd) => {
    const newStandards = [
      ...(standards.current === "pre" ? prerequisites : postrequisites),
      standardToAdd,
    ];
    setStandards(newStandards);
  });

  const addToast = useContext(ToastContext);

  useEffect(() => {
    Promise.all(
      (selectedStandard?.prerequisites ?? []).map(async (prereq) => {
        let st = await getDoc(doc(db, "standards", prereq));
        return { ...st.data(), id: st.id };
      }),
    ).then((standards) => {
      setPrerequisites(standards);
    });
  }, [selectedStandard?.prerequisites]);

  useEffect(() => {
    Promise.all(
      (selectedStandard?.postrequisites ?? []).map(async (postreq) => {
        let st = await getDoc(doc(db, "standards", postreq));
        return { ...st.data(), id: st.id };
      }),
    ).then((standards) => {
      setPostrequisites(standards);
    });
  }, [selectedStandard?.postrequisites]);

  async function handleSubmit(e) {
    e.preventDefault();

    document.getElementById("submitChanges").innerHTML =
      "Saving <span class='spinner-border spinner-border-sm' />";
    document.getElementById("submitChanges").setAttribute("disabled", true);

    let imageURL = "";

    if (imageType === "file") {
      const imageUpload = document.getElementById("image").files[0];
      if (imageUpload) {
        console.log(imageUpload);
        const imageRef = ref(
          storage,
          "standards/" + selectedStandard.id + "/" + imageUpload.name,
        );

        await uploadBytes(imageRef, imageUpload).then(async (snapshot) => {
          const downloadURL = await getDownloadURL(snapshot.ref);
          imageURL = downloadURL;
        });
      }
    } else {
      imageURL = document.getElementById("image").value;
    }

    let questionImageURL = "";

    if (questionImageType === "file") {
      const questionImageUpload =
        document.getElementById("question_image").files[0];
      if (questionImageUpload) {
        const questionImageRef = ref(
          storage,
          "standards/" + selectedStandard.id + "/" + questionImageUpload.name,
        );

        await uploadBytes(questionImageRef, questionImageUpload).then(
          async (snapshot) => {
            const downloadURL = await getDownloadURL(snapshot.ref);
            questionImageURL = downloadURL;
          },
        );
      }
    } else {
      questionImageURL = document.getElementById("question_image").value;
    }

    let newStandard = {
      key: document.getElementById("key").value,
      grade: document.getElementById("grade").value,
      category: document.getElementById("category").value,
      sub_category: document.getElementById("sub_category").value,
      description: document.getElementById("description").value,
      image: imageURL,
      question: document.getElementById("question").value,
      answer: document.getElementById("answer").value,
      question_image: questionImageURL,
      prerequisites: prerequisites.map((prereq) => prereq.id),
      postrequisites: postrequisites.map((postreq) => postreq.id),
    };

    if (selectedStandard.id) {
      prerequisites.forEach(async (prereq) => {
        getDoc(doc(db, "standards", prereq.id)).then((st) => {
          if (st.exists() && !st.data()?.postrequisites) {
            updateDoc(doc(db, "standards", prereq.id), {
              postrequisites: [selectedStandard.id],
            });
          } else {
            updateDoc(doc(db, "standards", prereq.id), {
              postrequisites: arrayUnion(selectedStandard.id),
            });
          }
        });
      });
      updateDoc(doc(db, "standards", selectedStandard.id), newStandard)
        .then(
          addToast({
            header: "Changes Saved",
            message: `Standard ${newStandard.key} has been updated`,
          }),
        )
        .then(() => {
          setShow(false);
        });
    } else {
      addDoc(collection(db, "standards"), newStandard)
        .then((res) => {
          prerequisites.forEach(async (prereq) => {
            getDoc(doc(db, "standards", prereq.id)).then((st) => {
              if (st.exists() && !st.data()?.postrequisites) {
                updateDoc(doc(db, "standards", prereq.id), {
                  postrequisites: [res.id],
                });
              } else {
                updateDoc(doc(db, "standards", prereq.id), {
                  postrequisites: arrayUnion(res.id),
                });
              }
            });
          });
          addToast({
            header: "Standard Added",
            message: `Standard ${newStandard.key} has been added`,
          });
        })
        .then(() => {
          setShow(false);
        });
    }
  }

  const prerequisitesList = prerequisites.map((standard) => (
    <Collapse in={true} key={standard.id} appear>
      <div>
        <li className='list-group-item d-flex'>
          <Button
            variant='danger'
            size='sm'
            onClick={() => {
              setPrerequisites(
                prerequisites.filter((prereq) => prereq.id !== standard.id),
              );
            }}
          >
            <i className='bi bi-x-lg' />
          </Button>
          <div className='d-flex flex-column justify-content-center ms-3'>
            {standard.key}
          </div>
        </li>
      </div>
    </Collapse>
  ));

  const postrequisitesList = postrequisites.map((standard) => (
    <Collapse in={true} key={standard.id} appear>
      <div>
        <li className='list-group-item d-flex'>
          <Button
            variant='danger'
            size='sm'
            onClick={() => {
              setPostrequisites(
                postrequisites.filter((postreq) => postreq.id !== standard.id),
              );
            }}
          >
            <i className='bi bi-x-lg' />
          </Button>
          <div className='d-flex flex-column justify-content-center ms-3'>
            {standard.key}
          </div>
        </li>
      </div>
    </Collapse>
  ));

  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        onExited={() => {
          setSelectedStandard(null);
          setEdit(false);
        }}
        size='lg'
        fullscreen
      >
        {selectedStandard ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>
                <strong>Edit {selectedStandard.key}</strong>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Card className='bg-light-subtle'>
                <Card.Header>
                  <h3>Standard Description</h3>
                </Card.Header>
                <Card.Body>
                  <Form.Label>Standard Name</Form.Label>
                  <Form.Control
                    type='text'
                    defaultValue={selectedStandard.key}
                    id='key'
                  />

                  <Form.Label className='pt-3'>Grade Level</Form.Label>
                  <Form.Control
                    type='text'
                    defaultValue={selectedStandard.grade}
                    id='grade'
                  />

                  <Form.Label className='pt-3'>Category</Form.Label>
                  <Form.Select
                    defaultValue={selectedStandard.category}
                    id='category'
                  >
                    <option value='Math'>Math</option>
                    <option value='Reading'>Reading</option>
                  </Form.Select>

                  <Form.Label className='pt-3'>Sub-Category</Form.Label>
                  <Form.Control
                    type='text'
                    defaultValue={selectedStandard.sub_category}
                    id='sub_category'
                  />

                  <Form.Label className='pt-3'>Description</Form.Label>
                  <Form.Control
                    as='textarea'
                    defaultValue={selectedStandard.description}
                    id='description'
                    style={{ height: "150px" }}
                  />

                  <Form.Label className='pt-3'>Image</Form.Label>
                  <div className='d-flex'>
                    {image !== "" ? (
                      <div className='d-flex flex-column'>
                        <Card className=''>
                          <Card.Header>Image Preview</Card.Header>
                          <Card.Body>
                            <img
                              src={image}
                              alt={selectedStandard.description}
                              style={{ maxHeight: "250px" }}
                            />
                          </Card.Body>
                        </Card>
                        <Button
                          variant='secondary'
                          onClick={() => {
                            setImage("");
                            document.getElementById("image").value = "";
                          }}
                          className='mt-3'
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : null}
                    <div className='d-flex flex-column w-100 mx-3 justify-content-center'>
                      <Form.Select
                        value={imageType}
                        className='mb-3'
                        onChange={(e) => {
                          setImageType(e.target.value);
                        }}
                      >
                        <option value='link'>Link To Image</option>
                        <option value='file'>Upload Image</option>
                      </Form.Select>
                      {imageType === "link" ? (
                        <Form.Control
                          id='image'
                          type='text'
                          placeholder='https://example.image.com'
                          defaultValue={selectedStandard.image}
                          onBlur={(e) => setImage(e.target.value)}
                        />
                      ) : (
                        <Form.Control
                          id='image'
                          type='file'
                          onChange={(e) =>
                            setImage(URL.createObjectURL(e.target.files[0]))
                          }
                        />
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <hr />

              <Card className='bg-light-subtle mt-3'>
                <Card.Header>
                  <h3>Standard Relationships</h3>
                </Card.Header>
                <Card.Body className='d-flex'>
                  <Card className='w-50'>
                    <Card.Header>Prerequisites</Card.Header>
                    <Card.Body className='d-flex flex-column'>
                      {prerequisites.length > 0 && (
                        <ul className='list-group mb-3'>{prerequisitesList}</ul>
                      )}
                      <Button
                        className='mt-auto'
                        variant='secondary'
                        onClick={() => {
                          standards.current = "pre";
                          setShowNewStandardPane(true);
                        }}
                      >
                        Add Prerequisite
                      </Button>
                    </Card.Body>
                  </Card>
                  <Card className='w-50 ms-3'>
                    <Card.Header>Postrequisites</Card.Header>
                    <Card.Body className='d-flex flex-column'>
                      {postrequisites.length > 0 && (
                        <ul className='list-group mb-3'>
                          {postrequisitesList}
                        </ul>
                      )}
                      <Button
                        className='mt-auto'
                        variant='secondary'
                        onClick={() => {
                          standards.current = "post";
                          setShowNewStandardPane(true);
                        }}
                      >
                        Add Postrequisite
                      </Button>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
              <hr />

              <Card className='bg-light-subtle'>
                <Card.Header>
                  <h3>Example Question</h3>
                </Card.Header>
                <Card.Body>
                  <Form.Label>Question</Form.Label>
                  <Form.Control
                    as='textarea'
                    defaultValue={selectedStandard.question}
                    id='question'
                    style={{ height: "150px" }}
                  />

                  <Form.Label className='pt-3'>Answer</Form.Label>
                  <Form.Control
                    as='textarea'
                    defaultValue={selectedStandard.answer}
                    id='answer'
                    style={{ height: "150px" }}
                  />

                  <Form.Label className='pt-3'>Question Image</Form.Label>

                  <div className='d-flex w-100 justify-content-center'>
                    {questionImage !== "" ? (
                      <div className='d-flex flex-column'>
                        <Card className='mt-3'>
                          <Card.Header>Image Preview</Card.Header>
                          <Card.Body>
                            <img
                              src={questionImage}
                              alt={selectedStandard.question}
                              style={{ maxHeight: "250px" }}
                            />
                          </Card.Body>{" "}
                        </Card>
                        <Button
                          variant='secondary'
                          onClick={() => {
                            setQuestionImage("");
                            document.getElementById("question_image").value =
                              "";
                          }}
                          className='mt-3'
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : null}
                    <div className='d-flex flex-column w-100 px-3 align-self-center'>
                      <Form.Select
                        value={questionImageType}
                        onChange={(e) => {
                          setQuestionImageType(e.target.value);
                        }}
                      >
                        <option value='link'>Link To Image</option>
                        <option value='file'>Upload Image</option>
                      </Form.Select>
                      {questionImageType === "link" ? (
                        <Form.Control
                          id='question_image'
                          type='text'
                          placeholder='https://example.image.com'
                          defaultValue={selectedStandard.question_image}
                          onBlur={(e) => setQuestionImage(e.target.value)}
                        />
                      ) : (
                        <Form.Control
                          id='question_image'
                          type='file'
                          onChange={(e) =>
                            setQuestionImage(
                              URL.createObjectURL(e.target.files[0]),
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <div className='d-flex'>
                {selectedStandard.id && (
                  <>
                    <Button
                      type='button'
                      className='mt-3'
                      variant='secondary'
                      onClick={() => setEdit(false)}
                    >
                      Back
                    </Button>
                    <Button
                      type='button'
                      className='mt-3 ms-auto'
                      variant='danger'
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete standard ${selectedStandard.key}?`,
                          )
                        ) {
                          deleteDoc(
                            doc(db, "standards", selectedStandard.id),
                          ).then(() => {
                            getDocs(
                              query(
                                collection(db, "standards"),
                                or(
                                  where(
                                    "prerequisites",
                                    "array-contains",
                                    selectedStandard.id,
                                  ),
                                  where(
                                    "postrequisites",
                                    "array-contains",
                                    selectedStandard.id,
                                  ),
                                ),
                              ),
                            ).then((standards) => {
                              standards.forEach((st) => {
                                updateDoc(doc(db, "standards", st.id), {
                                  prerequisites: arrayRemove(
                                    selectedStandard.id,
                                  ),
                                  postrequisites: arrayRemove(
                                    selectedStandard.id,
                                  ),
                                });
                              });
                            });
                            addToast({
                              header: "Standard Deleted",
                              message: `Standard ${selectedStandard.key} has been deleted`,
                            });
                            setShow(false);
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  type='submit'
                  onClick={handleSubmit}
                  className='ms-3 mt-3'
                  id='submitChanges'
                >
                  Save Changes
                </Button>
              </div>
            </Modal.Body>
          </>
        ) : (
          <></>
        )}
      </Modal>
      <Modal
        show={showNewStandardPane}
        onHide={() => setShowNewStandardPane(false)}
        centered
        size='lg'
        style={{ overflow: "auto" }}
      >
        <PickStandard
          standards={
            standards.current === "pre" ? prerequisites : postrequisites
          }
          setStandards={setStandards}
          close={() => {
            setShowNewStandardPane(false);
          }}
          standardSelector={newStandardSelector.current}
        />
      </Modal>
    </>
  );
};

export default EditStandard;
