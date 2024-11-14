import { doc } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Collapse, Form, Row } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { storage } from "../../../Services/firebase";

const WorksheetItem = ({ worksheet, handleWorksheetChange }) => {
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  const worksheetFileDownloadLink = useRef(null);

  const [show, setShow] = useState(true);

  useEffect(() => {
    if (worksheet.type === "file" && worksheet.path) {
      try {
        let worksheetRef = doc(storage, worksheet.path);
        getDownloadURL(worksheetRef).then((url) => {
          worksheetFileDownloadLink.current = url;
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [worksheet]);

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
              value={worksheet?.type || "file"}
              onChange={(e) => {
                let newWorksheet = { ...worksheet };
                if (e.target.value === "file") {
                  newWorksheet.type = "file";

                  document.getElementById("worksheet").type = "file";
                  document.getElementById("worksheet").onchange = (e) => {
                    let newWorksheet = { ...worksheet };
                    newWorksheet.path = e.target.files[0];
                    handleWorksheetChange(newWorksheet);
                  };
                } else {
                  newWorksheet.type = "url";

                  document.getElementById("worksheet").type = "url";
                  document.getElementById("worksheet").placeholder =
                    "Link to Worksheet";
                  document.getElementById("worksheet").value = worksheet.link;
                  document.getElementById("worksheet").onchange = (e) => {
                    let newWorksheet = { ...worksheet };
                    newWorksheet.link = e.target.value;
                    handleWorksheetChange(newWorksheet);
                  };
                }
                handleWorksheetChange(newWorksheet);
              }}
            >
              <option value='file'>File Upload</option>
              <option value='url'>URL</option>
            </Form.Select>
          </div>

          <input id='worksheet' className='form-control mb-2' type='file' />

          {worksheetFileDownloadLink.current && (
            <a
              href={worksheetFileDownloadLink.current}
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
            value={worksheet.completion || ""}
            onChange={(e) => {
              let newWorksheet = { ...worksheet };
              newWorksheet.completion = e.target.value;
              handleWorksheetChange(newWorksheet);
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

  // if (evaluation.worksheet !== "") {
  //   let oldWorksheet = {};
  //   try {
  //     let worksheetRef = ref(storage, evaluation.worksheet);
  //     getDownloadURL(worksheetRef).then((url) => {
  //       oldWorksheet.link = url;
  //       oldWorksheet.type = "file";
  //     });
  //   } catch (err) {
  //     oldWorksheet.link = evaluation.worksheet;
  //     oldWorksheet.type = "url";
  //   }
  //   setWorksheets([oldWorksheet]);
  // }

  return (
    <div>
      <h5>Worksheets</h5>
      <div id='worksheetsContainer' className='card p-3'>
        {worksheets.map((worksheet, index) => (
          <WorksheetItem
            key={index}
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
