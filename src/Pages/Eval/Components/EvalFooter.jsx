import { Form, OverlayTrigger, Popover } from "react-bootstrap";

const EvalFooter = ({ evaluation, handleEvalChange }) => {
  return (
    <div className='row my-3'>
      <div className='col-12 col-md-4 pb-3'>
        <label className='form-label h5'>Worksheet</label>
        <Form.Select
          className='mb-2'
          defaultValue='file'
          onChange={(e) => {
            if (e.target.value === "file") {
              document.getElementById("worksheet").type = "file";
              document.getElementById("worksheet").placeholder = "";
            } else {
              document.getElementById("worksheet").type = "url";
              document.getElementById("worksheet").placeholder =
                "Link to Worksheet";
            }
          }}
        >
          <option value='file'>File Upload</option>
          <option value='url'>URL</option>
        </Form.Select>

        <input id='worksheet' className='form-control' type='file' />
        <div className='invalid-feedback'>Please provide a valid URL</div>
      </div>
      <div className='col-12 col-md-4 pb-3'>
        <label className='form-label h5'>Worksheet Completion</label>
        <textarea
          id='worksheet_completion'
          className='form-control'
          type='text'
          value={evaluation?.worksheet_completion || ""}
          onChange={(e) => {
            const newEval = { ...evaluation };
            newEval.worksheet_completion = e.target.value;
            handleEvalChange(newEval);
          }}
        />
      </div>
      <div className='col-12 col-md-4'>
        <div className='d-flex'>
          <label className='form-label h5'>Next Session Plans</label>
          <OverlayTrigger
            placement='top'
            overlay={
              <Popover>
                <Popover.Header>Next Session Plans</Popover.Header>
                <Popover.Body>
                  List any standards or concepts that you would like the student
                  to work on during their next session
                  <hr />
                  <div className='text-decoration-underline'>Example</div>
                  "Continue working on 1.G.2 and move on to 1.G.3, working on
                  subdividing shapes"
                </Popover.Body>
              </Popover>
            }
          >
            <i className='bi bi-info-square ms-auto'></i>
          </OverlayTrigger>
        </div>
        <textarea
          id='next_session'
          className='form-control text-break'
          value={evaluation?.next_session || ""}
          onChange={(e) => {
            const newEval = { ...evaluation };
            newEval.next_session = e.target.value;
            handleEvalChange(newEval);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onMouseEnter={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        <div className='invalid-feedback'>
          Please enter plans for the next session
        </div>
      </div>
    </div>
  );
};

export default EvalFooter;
