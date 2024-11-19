import { doc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Collapse, Form, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { storage } from "../../../Services/firebase";

const WorksheetItem = ({ idx, worksheet, handleWorksheetChange }) => {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  const [worksheetType, setWorksheetType] = useState(worksheet.type || "file");
  const [completion, setCompletion] = useState(worksheet.completion || "");
  const [worksheetFileDownloadLink, setWorksheetFileDownloadLink] =
    useState(null);

  const [show, setShow] = useState(true);

  useEffect(() => {
    if (worksheetType === "file") {
      if (worksheet.path) {
        try {
          let worksheetRef = ref(storage, worksheet.path);
          getDownloadURL(worksheetRef).then((url) => {
            setWorksheetFileDownloadLink(url);
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  }, [worksheetType]);

  return (
    <Collapse in={show} appear onExited={() => handleWorksheetChange(null)}>
      <Row className='mb-2'>
        <Col xs={12} md={6}>
          <div className='d-flex'>
            <Button
              className={`mb-2 ${isDesktop ? "me-2 order-1" : "ms-2 order-3"}`}
              variant='danger'
              onClick={() => {
                setShow(false);
              }}
            >
              <i className='bi-trash-fill'></i>
            </Button>
            <Form.Select
              className={`mb-2 order-2`}
              value={worksheetType || "file"}
              onChange={(e) => {
                setWorksheetType(e.target.value);
                let newWorksheet = { ...worksheet, type: e.target.value };
                handleWorksheetChange(newWorksheet);
              }}
            >
              <option value='file'>File Upload</option>
              <option value='url'>URL</option>
            </Form.Select>
          </div>

          {worksheetType === "file" ? (
            <input
              id={`worksheet_${idx}`}
              className='form-control mb-2'
              type='file'
              // value=''
              onChange={(e) => {
                if (!e) return;
                let newWorksheet = { ...worksheet };
                newWorksheet.file = e.target.files[0];
                handleWorksheetChange(newWorksheet);
              }}
            />
          ) : (
            <input
              id={`worksheet_${idx}`}
              className='form-control mb-2'
              type='url'
              placeholder='Link to Worksheet'
              value={worksheet.link}
              onChange={(e) => {
                if (!e) return;
                let newWorksheet = { ...worksheet };
                newWorksheet.link = e.target.value;
                handleWorksheetChange(newWorksheet);
              }}
            />
          )}
          <div className='invalid-feedback'>Please provide a worksheet.</div>

          {worksheetFileDownloadLink && (
            <a
              href={worksheetFileDownloadLink}
              target='_blank'
              rel='noreferrer'
              className='text-end'
            >
              View Current Worksheet
            </a>
          )}
        </Col>
        <Col xs={12} md={6} className='pb-2'>
          <textarea
            className='form-control h-100 mb-2'
            placeholder='Comments'
            type='text'
            value={completion || ""}
            onChange={(e) => {
              let newWorksheet = { ...worksheet };
              newWorksheet.completion = e.target.value;
              handleWorksheetChange(newWorksheet);
              setCompletion(e.target.value);
            }}
          />
        </Col>
      </Row>
    </Collapse>
  );
};

const Worksheets = ({ evaluation, handleEvalChange }) => {
  const [worksheets, setWorksheets] = useState(evaluation?.worksheets || []);

  useEffect(() => {
    setWorksheets(evaluation?.worksheets || []);
  }, [evaluation]);

  useEffect(() => {
    if (evaluation?.worksheet || "" !== "") {
      let oldWorksheet = {};
      try {
        let worksheetRef = ref(storage, evaluation.worksheet);
        getDownloadURL(worksheetRef).then((url) => {
          oldWorksheet.link = "";
          oldWorksheet.path = evaluation.worksheet;
          oldWorksheet.type = "file";
          oldWorksheet.completion = evaluation.worksheet_completion;
        });
      } catch (err) {
        console.log(err);
        oldWorksheet.link = evaluation.worksheet;
        oldWorksheet.path = "";
        oldWorksheet.type = "url";
        oldWorksheet.completion = evaluation.worksheet_completion;
      }
      const newEval = {
        ...evaluation,
        worksheets: [oldWorksheet],
        worksheet: "",
        worksheet_completion: "",
      };
      handleEvalChange(newEval);
      setWorksheets([oldWorksheet]);
    }
  }, [evaluation.worksheet, evaluation.worksheet_completion]);

  return (
    <div>
      <h5>Worksheets</h5>
      <div id='worksheetsContainer' className='card p-3'>
        {worksheets.map((worksheet, index) => (
          <WorksheetItem
            key={index}
            idx={index}
            worksheet={worksheet}
            handleWorksheetChange={(newWorksheet) => {
              const newWorksheets = [...worksheets];
              if (newWorksheet === null) {
                newWorksheets.splice(index, 1);
                const newEval = { ...evaluation, worksheets: newWorksheets };
                setWorksheets(newWorksheets);
                handleEvalChange(newEval);
                return;
              }
              newWorksheets[index] = newWorksheet;
              const newEval = { ...evaluation, worksheets: newWorksheets };
              setWorksheets(newWorksheets);
              handleEvalChange(newEval);
            }}
          />
        ))}
        <Button
          variant='secondary'
          onClick={() => {
            const newWorksheets = [
              ...worksheets,
              { link: "", path: "", type: "file" },
            ];
            const newEval = {
              ...evaluation,
              worksheets: newWorksheets,
            };
            setWorksheets(newWorksheets);
            handleEvalChange(newEval);
          }}
        >
          Add Worksheet <i className='bi-plus ms-1'></i>
        </Button>
      </div>
    </div>
  );
};

export default Worksheets;
