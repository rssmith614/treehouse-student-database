import { doc, updateDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import { Button, Card, Form, Modal } from "react-bootstrap";
import { db, storage } from "../../../Services/firebase";
import { ToastContext } from "../../../Services/toast";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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

  const addToast = useContext(ToastContext);

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
    };

    updateDoc(doc(db, "standards", selectedStandard.id), newStandard)
      .then(
        addToast({
          header: "Changes Saved",
          message: `Standard ${newStandard.key} has been updated (Refresh to see)`,
        }),
      )
      .then(() => {
        // setEdit(false);
        setShow(false);
      });
  }

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      onExited={() => {
        setSelectedStandard(null);
        setEdit(false);
      }}
      size='lg'
    >
      {selectedStandard ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              <strong>Edit {selectedStandard.key}</strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Standard Description</h3>
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
            <Form.Select defaultValue={selectedStandard.category} id='category'>
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
            <Form.Select
              value={imageType}
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
            {image !== "" ? (
              <>
                <Card className='mt-3'>
                  <Card.Header>Image Preview</Card.Header>
                  <Card.Img src={image} />
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
              </>
            ) : null}

            <hr />

            <h3>Example Question</h3>

            <Form.Label className='pt-3'>Question</Form.Label>
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
                  setQuestionImage(URL.createObjectURL(e.target.files[0]))
                }
              />
            )}
            {questionImage !== "" ? (
              <>
                <Card className='mt-3'>
                  <Card.Header>Image Preview</Card.Header>
                  <Card.Img src={questionImage} />
                </Card>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setQuestionImage("");
                    document.getElementById("question_image").value = "";
                  }}
                  className='mt-3'
                >
                  Remove Image
                </Button>
              </>
            ) : null}

            <div className='d-flex'>
              <Button
                type='button'
                className='mt-3'
                variant='secondary'
                onClick={() => setEdit(false)}
              >
                Back
              </Button>
              <Button
                type='submit'
                onClick={handleSubmit}
                className='ms-auto mt-3'
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
  );
};

export default EditStandard;
