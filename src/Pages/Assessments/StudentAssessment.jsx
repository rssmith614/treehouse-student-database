import { useNavigate, useParams } from "react-router-dom";
import { AbilityContext, Can } from "../../Services/can";
import { Button, Col, Row, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, storage } from "../../Services/firebase";
import { getDownloadURL, ref } from "firebase/storage";
import { Assessment } from "../../Services/defineAbility";
import { useAbility } from "@casl/react";
import dayjs from "dayjs";
import StandardInfo from "../Standards/Components/StandardInfo";
import { useMediaQuery } from "react-responsive";

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

const StudentAssessment = () => {
  const [assessment, setAssessment] = useState({});

  const [selectedStandard, setSelectedStandard] = useState(null);

  const [blankFileURL, setBlankFileURL] = useState("");
  const [completedFileURL, setCompletedFileURL] = useState("");

  const params = useParams();
  const ability = useAbility(AbilityContext);

  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ query: "(min-width: 992px)" });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "student_assessments", params.assessmentid),
      async (snapshot) => {
        let newQuestions = {};

        await Promise.all(
          Object.keys(snapshot.data().questions).map(async (key) => {
            if ((snapshot.data().questions[key].standard ?? "") === "") return;
            return getDoc(
              doc(db, "standards", snapshot.data().questions[key].standard),
            ).then((doc) => {
              return { ...doc.data(), id: doc.id };
            });
          }),
        ).then((standards) => {
          Object.keys(snapshot.data().questions).forEach((key, index) => {
            newQuestions[key] = {
              ...snapshot.data().questions[key],
              standard: standards[index],
            };
          });
        });

        setAssessment({
          ...snapshot.data(),
          id: snapshot.id,
          questions: newQuestions,
        });

        if ((snapshot.data()?.file ?? "") !== "") {
          getDownloadURL(ref(storage, snapshot.data().file))
            .then((url) => {
              setBlankFileURL(url);
            })
            .catch((error) => {
              setBlankFileURL("");
              console.error("Error getting file URL: ", error);
            });
        }
        if ((snapshot.data()?.completed_file ?? "") !== "") {
          getDownloadURL(ref(storage, snapshot.data().completed_file))
            .then((url) => {
              setCompletedFileURL(url);
            })
            .catch((error) => {
              setCompletedFileURL("");
              console.error("Error getting completed file URL: ", error);
            });
        }
      },
    );

    return () => unsubscribe();
  }, [params.assessmentid]);

  function questionList() {
    if (!assessment?.questions)
      return (
        <tr>
          <td colSpan='5'>No questions found</td>
        </tr>
      );
    const list = Object.entries(assessment?.questions).map(
      ([num, question]) => {
        return (
          <tr key={num}>
            <td>{num}</td>
            <td>{question.question}</td>
            <td>{question.sample_answer}</td>
            <td>{question.student_answer}</td>
            <td>{question.score}</td>
            <td>
              {(question.standard?.key ?? "") === "" ? (
                <div className='text-muted'>No Standard</div>
              ) : (
                <Button
                  variant='link'
                  onClick={() => setSelectedStandard(question.standard)}
                >
                  {question.standard?.key}
                </Button>
              )}
            </td>
          </tr>
        );
      },
    );
    return list;
  }

  let amtInstance = new Assessment(assessment);

  if (!isDesktop) {
    return (
      <div className='p-3 d-flex flex-column'>
        <h1 className='display-1'>Student Assessment</h1>
        <div className='d-flex flex-fill card p-3 bg-light-subtle'>
          This page is not available on mobile devices. Please use a desktop
          device to view this page.
        </div>
        <Button
          variant='secondary'
          className='m-3'
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className='p-3 d-flex flex-column'>
        <h1 className='display-1'>Student Assessment</h1>
        <div className='d-flex flex-fill card p-3 bg-light-subtle'>
          <label className='form-label h5'>Student</label>
          <button
            className='btn btn-link h3 link-underline link-underline-opacity-0 link-underline-opacity-75-hover me-auto'
            data-toggle='tooltip'
            title={"View " + assessment.student_name + "'s Profile"}
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/students/${assessment.student_id}`)}
          >
            {assessment.student_name}
          </button>
          <div className='row my-3'>
            <div className='col'>
              <label className='form-label h5'>Issuer</label>
              <br />
              {ability.can("view", "Tutor") && assessment.issued_by !== "" ? (
                <button
                  id='tutor'
                  className='btn btn-link h6 link-underline link-underline-opacity-0 link-underline-opacity-75-hover'
                  data-toggle='tooltip'
                  title={"View " + assessment.issued_by_name + "'s Profile"}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/tutor/${assessment.issued_by}`)}
                >
                  {assessment.issued_by_name}
                </button>
              ) : (
                <div id='tutor' className='h6'>
                  {assessment.issued_by_name}
                </div>
              )}
            </div>
            <div className='col'>
              <label className='form-label h5'>Date</label>
              <div id='date' className=''>
                {dayjs(assessment.date).format("MMMM D, YYYY")}
              </div>
            </div>
          </div>
          <hr />
          <div className='h5'>
            Assessment - {grades[assessment.grade]} {assessment.category}
          </div>
          <Row>
            {blankFileURL !== "" ? (
              <Col className='d-flex flex-column justify-content-center'>
                <Button
                  href={blankFileURL}
                  className=''
                  target='_blank'
                  rel='noreferrer'
                >
                  Download Blank Assessment
                </Button>
              </Col>
            ) : (
              <Col className='h6 text-center'>
                No file for the selected assessment
              </Col>
            )}
            {completedFileURL !== "" ? (
              <Col className='d-flex flex-column justify-content-center'>
                <Button
                  href={completedFileURL}
                  className=''
                  target='_blank'
                  rel='noreferrer'
                >
                  Download Completed Assessment
                </Button>
              </Col>
            ) : (
              <Col className='h6 text-center'>
                No completed file for the selected assessment
              </Col>
            )}
          </Row>
          <hr />
          <div className='h5'>Questions and Answers</div>
          <Row className='d-flex px-3'>
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Correct Answer</th>
                  <th>Student Answer</th>
                  <th>Score</th>
                  <th>Standard</th>
                </tr>
              </thead>
              <tbody>{questionList()}</tbody>
            </Table>
          </Row>
        </div>
        <div className='d-flex'>
          <Button
            variant='secondary'
            className='m-3'
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Can I='edit' this={amtInstance}>
            <Button
              variant='info'
              className='m-3 ms-auto'
              onClick={() =>
                navigate(`/assessments/student/edit/${assessment.id}`)
              }
            >
              Make Changes
            </Button>
          </Can>
        </div>
      </div>
      <StandardInfo
        selectedStandard={selectedStandard}
        setSelectedStandard={setSelectedStandard}
        show={selectedStandard !== null}
        setShow={() => setSelectedStandard(null)}
      />
    </>
  );
};

export default StudentAssessment;
