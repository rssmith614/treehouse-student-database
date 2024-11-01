import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../../Services/firebase";
import {
  Button,
  Card,
  Fade,
  InputGroup,
  Modal,
  Tab,
  Table,
  Tabs,
} from "react-bootstrap";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "../../Services/toast";
import PickStandard from "../Standards/Components/PickStandard";

import csv from "csvtojson";

const grades = {
  K: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

const AssessmentEdit = () => {
  const [assessment, setAssessment] = useState({});
  const [questions, setQuestions] = useState([]);

  const [questionsDirty, setQuestionsDirty] = useState(false);

  const [assessmentFile, setAssessmentFile] = useState();

  const [show, setShow] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const [updatingFile, setUpdatingFile] = useState(false);

  const [answerKeyTab, setAnswerKeyTab] = useState("manual-entry");

  const [showStandardSelector, setShowStandardSelector] = useState(false);
  const standardSelector = useRef();

  const assessmentFileRef = useRef();

  const addToast = useContext(ToastContext);

  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams();

  useEffect(() => {
    onSnapshot(doc(db, "assessments", params.assessmentid), async (res) => {
      setAssessment(res.data());
      setQuestions(
        await Promise.all(
          Object.keys(res.data().questions).map(async (key) => {
            if (res.data().questions[key].standard !== "") {
              const standard = await getDoc(
                doc(db, "standards", res.data().questions[key].standard),
              );
              return {
                ...res.data().questions[key],
                num: key,
                standard: standard.data().key,
              };
            } else {
              return { ...res.data().questions[key], num: key };
            }
          }),
        ),
      );

      if (res.data().file === "" || res.data().file === undefined) return;

      if (/^standards\/.*/.test(res.data().file)) {
        assessmentFileRef.current = ref(storage, res.data().file);
        getDownloadURL(assessmentFileRef.current).then((url) =>
          setAssessmentFile(url),
        );
      } else {
        setAssessmentFile("");
      }
    });
  }, [params.assessmentid]);

  useEffect(() => {
    if (questionsDirty) {
      document.getElementById("save-q-changes").removeAttribute("disabled");
      document.getElementById("save-q-changes").innerHTML = "Save Changes";
    } else {
      document.getElementById("save-q-changes").setAttribute("disabled", true);
      document.getElementById("save-q-changes").innerHTML = "Changes Saved";
    }
  }, [questionsDirty]);

  async function handleFileSubmit(e) {
    e.preventDefault();

    setUpdatingFile(true);

    document.getElementById("save-new-file").setAttribute("disabled", true);
    document.getElementById("save-new-file").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    let amtFile = document.getElementById("amt-file").files[0];

    if (amtFile) {
      let amtCatRef = ref(
        storage,
        `/assessments/${assessment.grade}/${assessment.category}/`,
      );

      let res = await listAll(amtCatRef);
      let fileNameList = res.items.map((f) => f.name);

      if (fileNameList.includes(amtFile.name)) {
        window.alert(
          "Multiple versions of the same file are not supported. Please rename the new file and try again.",
        );
        document.getElementById("save-new-file").removeAttribute("disabled");
        document.getElementById("save-new-file").innerHTML = "Submit";

        setUpdatingFile(false);
        return;
      }

      setShow(true);
      setShowFileUpload(false);
    } else {
      window.alert("Please select a file first");
      document.getElementById("save-new-file").removeAttribute("disabled");
      document.getElementById("save-new-file").innerHTML = "Submit";
      setUpdatingFile(false);
      return;
    }

    document.getElementById("save-new-file").removeAttribute("disabled");
    document.getElementById("save-new-file").innerHTML = "Submit";
  }

  async function handleAnswerKeySubmit(e) {
    e.preventDefault();

    e.target.setAttribute("disabled", true);
    e.target.innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    if (e.target.id === "submit-csv") {
      let amtFileRef;
      if (updatingFile) {
        let amtFile = document.getElementById("amt-file").files[0];
        amtFileRef = ref(
          storage,
          `/assessments/${assessment.grade}/${assessment.category}/${amtFile.name}`,
        );
        await uploadBytes(amtFileRef, amtFile);
      } else {
        amtFileRef = assessmentFileRef.current;
      }

      let answerKeyText = await document
        .getElementById("answer-key")
        .files[0]?.text();

      if (answerKeyText) {
        let newQuestions = await csv().fromString(answerKeyText);

        newQuestions = await Promise.all(
          newQuestions.map(async (item) => {
            if (item["Standard"] === "")
              return {
                num: item["Question #"],
                question: item["Question"],
                sample_answer: item["Sample Answer"],
                standard: "",
              };
            if (item["Standard"] === undefined) {
              throw new Error(
                `Standard on question ${item["Question #"]} is missing. Ensure the CSV file has header ["Question #", "Question", "Sample Answer", "Standard"]`,
              );
            }

            let res = await getDocs(
              query(
                collection(db, "standards"),
                where("key", "==", item["Standard"]),
              ),
            );

            if (res.docs.length === 0) {
              addToast({
                header: "Standard Not Found",
                message: `Standard '${item["Standard"]}' found on question ${item["Question #"]} doesn't exist`,
              });
              return {
                num: item["Question #"],
                question: item["Question"],
                sample_answer: item["Sample Answer"],
                standard: "",
              };
            }

            return {
              num: item["Question #"],
              question: item["Question"],
              sample_answer: item["Sample Answer"],
              standard: res.docs[0].id,
            };
          }),
        ).catch((err) => {
          window.alert(err);
          e.target.removeAttribute("disabled");
          e.target.innerHTML = "Submit";
          return [];
        });

        if (newQuestions.length === 0) {
          if (!window.confirm("Do you want to remove all answers?")) return;
        }

        newQuestions = Object.assign(
          {},
          ...newQuestions.map((q) => ({
            [q.num]: {
              question: q.question,
              sample_answer: q.sample_answer,
              standard: q.standard,
            },
          })),
        );

        await updateDoc(doc(db, "assessments", params.assessmentid), {
          questions: newQuestions,
          file: amtFileRef.fullPath,
        });

        let updatedDoc;

        if (updatingFile) {
          updatedDoc = {
            questions: newQuestions,
            file: amtFileRef.fullPath,
          };
        } else {
          updatedDoc = {
            questions: newQuestions,
          };
        }

        await updateDoc(
          doc(db, "assessments", params.assessmentid),
          updatedDoc,
        );

        if (updatingFile) {
          addToast({
            header: "Assessment File Updated",
            message: `${grades[assessment.grade]} ${
              assessment.category
            } Assessment's file has been updated, and answer key has been reset.`,
          });
        } else {
          addToast({
            header: "Answer Key Updated",
            message: `Questions, Answers, and Standards for ${
              grades[assessment.grade]
            } ${assessment.category} assessment have been updated`,
          });
        }
        setShow(false);
        setUpdatingFile(false);
      } else {
        window.alert("Please select a file first");
      }
    } else if (e.target.id === "submit-q-num") {
      let amtFileRef;
      if (updatingFile) {
        let amtFile = document.getElementById("amt-file").files[0];
        amtFileRef = ref(
          storage,
          `/assessments/${assessment.grade}/${assessment.category}/${amtFile.name}`,
        );
        await uploadBytes(amtFileRef, amtFile);
      } else {
        amtFileRef = assessmentFileRef.current;
      }

      let numOfQuestions = parseInt(document.getElementById("q-num").value);
      let newQuestions = Object.assign(
        {},
        ...[...Array(numOfQuestions).keys()].map((x) => ({
          [x + 1]: { question: "", sample_answer: "", standard: "" },
        })),
      );

      let updatedDoc;

      if (updatingFile) {
        updatedDoc = {
          questions: newQuestions,
          file: amtFileRef.fullPath,
        };
      } else {
        updatedDoc = {
          questions: newQuestions,
        };
      }

      await updateDoc(doc(db, "assessments", params.assessmentid), updatedDoc);

      if (updatingFile) {
        addToast({
          header: "Assessment File Updated",
          message: `${grades[assessment.grade]} ${
            assessment.category
          } Assessment's file has been updated, and answer key has been reset.`,
        });
      } else {
        addToast({
          header: "Answer Key Updated",
          message: `Questions, Answers, and Standards for ${
            grades[assessment.grade]
          } ${assessment.category} assessment have been updated`,
        });
      }

      setShow(false);
      setUpdatingFile(false);
    }

    e.target.removeAttribute("disabled");
    e.target.innerHTML = "Submit";
  }

  async function handleQuestionChanges(e) {
    e.preventDefault();

    document.getElementById("save-q-changes").setAttribute("disabled", true);
    document.getElementById("save-q-changes").innerHTML =
      "Save Changes <span class='spinner-border spinner-border-sm' />";

    let newQuestions = await Promise.all(
      questions.map(async (q) => {
        if (q.standard !== "") {
          let res = await getDocs(
            query(collection(db, "standards"), where("key", "==", q.standard)),
          );

          if (res.docs.length === 0) {
            window.alert(
              `Standard '${q.standard}' found on question ${q.num} doesn't exist`,
            );
            setQuestions((prev) => {
              return prev.map((item) => {
                if (item.num !== q.num) return item;
                else return { ...item, standard: "" };
              });
            });
            return { ...q, standard: "" };
          } else {
            return { ...q, standard: res.docs[0].id };
          }
        } else {
          return q;
        }
      }),
    );

    newQuestions = Object.assign(
      {},
      ...newQuestions.map((q) => ({
        [q.num]: {
          question: q.question,
          sample_answer: q.sample_answer,
          standard: q.standard,
        },
      })),
    );

    await updateDoc(doc(db, "assessments", params.assessmentid), {
      questions: newQuestions,
    });

    addToast({
      header: "Answer Key Updated",
      message: `Questions, Answers, and Standards for ${
        grades[assessment.grade]
      } ${assessment.category} assessment have been updated`,
    });

    setQuestionsDirty(false);
  }

  return (
    <div className='d-flex flex-column p-3'>
      <div className='display-1'>Edit Assessment</div>
      <h3>
        {grades[assessment.grade]} {assessment.category}
      </h3>
      <Card className='bg-light-subtle p-3'>
        <div className='h3'>File</div>
        <div className='p-3 mx-3 d-flex row'>
          <Card className='col-6'>
            <Card.Body className='d-flex flex-column justify-content-between'>
              <div className='h5'>Current File</div>
              {(assessmentFile ?? "") === "" ? (
                <div>No file</div>
              ) : (
                <div>
                  <a
                    id='file'
                    className=''
                    href={assessmentFile}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {assessment.file}
                  </a>
                </div>
              )}
              <hr />
              <Button
                onClick={() => {
                  setShowFileUpload(true);
                }}
                disabled={showFileUpload}
              >
                {assessmentFile ? "Replace" : "Upload New"} Assessment File
              </Button>
            </Card.Body>
          </Card>

          <div className='col-6'>
            <Fade in={showFileUpload}>
              <div className={showFileUpload ? "" : "d-none"}>
                <Card className=''>
                  <Card.Body className='d-flex flex-column justify-content-between'>
                    <div className='h5 text-nowrap'>
                      Upload New Assessment File
                    </div>
                    <div className='d-flex flex-column py-1'>
                      <input
                        id='amt-file'
                        type='file'
                        className='form-control'
                      />
                      <hr />
                      <div className='d-flex flex-row justify-content-between'>
                        <Button
                          variant='secondary'
                          className=''
                          onClick={() => {
                            setShowFileUpload(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button id='save-new-file' onClick={handleFileSubmit}>
                          Submit
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Fade>
          </div>
        </div>
        <hr />
        <div className='h3'>Answer Key and Standards</div>
        <Table striped>
          <thead>
            <tr>
              {/* <th></th> */}
              <th>Question #</th>
              <th>Question</th>
              <th>Sample Answer</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              return (
                <tr key={i}>
                  <td className='text-center align-middle'>{q.num}</td>
                  <td>
                    <textarea
                      className='form-control align-middle'
                      value={q.question}
                      onChange={(e) => {
                        setQuestions(
                          questions.map((item) => {
                            if (item.num !== q.num) return item;
                            else return { ...item, question: e.target.value };
                          }),
                        );
                        setQuestionsDirty(true);
                      }}
                    />
                  </td>
                  <td>
                    <textarea
                      className='form-control align-middle'
                      value={q.sample_answer}
                      onChange={(e) => {
                        setQuestions(
                          questions.map((item) => {
                            if (item.num !== q.num) return item;
                            else
                              return { ...item, sample_answer: e.target.value };
                          }),
                        );
                        setQuestionsDirty(true);
                      }}
                    />
                  </td>
                  <td className='align-middle'>
                    <InputGroup>
                      <input
                        className='form-control'
                        value={q.standard}
                        onChange={(e) => {
                          setQuestions(
                            questions.map((item) => {
                              if (item.num !== q.num) return item;
                              else return { ...item, standard: e.target.value };
                            }),
                          );
                          setQuestionsDirty(true);
                        }}
                      />
                      <Button
                        variant='secondary'
                        onClick={() => {
                          standardSelector.current = (standard) => {
                            setQuestions(
                              questions.map((item) => {
                                if (item.num !== q.num) return item;
                                else return { ...item, standard: standard.key };
                              }),
                            );
                            setQuestionsDirty(true);
                          };
                          setShowStandardSelector(true);
                        }}
                      >
                        <i className='bi bi-box-arrow-up-right'></i>
                      </Button>
                    </InputGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Button
          className='d-flex ms-auto'
          onClick={() => setShow(true)}
          variant='secondary'
        >
          Change Answer Key
        </Button>
      </Card>
      <div className='d-flex mt-3'>
        <Button
          variant='secondary'
          className=''
          onClick={() => {
            if (questionsDirty) {
              if (
                !window.confirm(
                  "You have unsaved changes. Are you sure you want to leave?",
                )
              )
                return;
            }
            navigate(-1);
          }}
        >
          Back
        </Button>
        <Button
          id='save-q-changes'
          className='ms-auto'
          onClick={handleQuestionChanges}
        >
          Changes Saved
        </Button>
      </div>
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header>
          <Modal.Title>
            New Assessment File for {grades[assessment.grade]}{" "}
            {assessment.category}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs activeKey={answerKeyTab} onSelect={(k) => setAnswerKeyTab(k)}>
            <Tab eventKey='manual-entry' title='Manual Entry'>
              <div className='d-flex flex-column pt-5'>
                <div className='flex-row justify-content-between'>
                  <div className='h6'>Enter number of questions:</div>
                  <input
                    id='q-num'
                    type='number'
                    min={1}
                    defaultValue={1}
                    className='form-control'
                  />
                </div>
                <div className='pt-3'>
                  Type Questions, Answers, and Standards on the Edit Screen
                  after submitting
                  <p className='text-danger'>
                    This will overwrite any existing answer key
                  </p>
                </div>
                <Button
                  id='submit-q-num'
                  className='ms-auto'
                  onClick={handleAnswerKeySubmit}
                >
                  Submit
                </Button>
              </div>
            </Tab>
            <Tab eventKey='csv-upload' title='Upload CSV'>
              <div className='d-flex flex-column pt-5'>
                <div className='h6'>
                  Upload .csv file with Questions, Answers, and Standards
                </div>
                <input
                  type='file'
                  id='answer-key'
                  className='form-control'
                  accept='csv'
                />
                <p className='text-muted pt-1'>
                  "Question #", "Question", "Sample Answer", "Standard"
                </p>
                <p className='text-danger'>
                  This will overwrite any existing answer key
                </p>
                <div className='d-flex flex-row pt-3'>
                  <Button
                    id='submit-csv'
                    className='ms-auto'
                    onClick={handleAnswerKeySubmit}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>
      <Modal
        show={showStandardSelector}
        onHide={() => setShowStandardSelector(false)}
        centered
        size='lg'
      >
        <PickStandard
          close={() => setShowStandardSelector(false)}
          standardSelector={standardSelector.current}
        />
      </Modal>
    </div>
  );
};

export default AssessmentEdit;
