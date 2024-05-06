import { Modal } from "react-bootstrap";

const ASCIIMathTip = ({ show, setShow }) => {
  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Typesetting Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Typesetting is the process of converting mathematical notation into a
          format that can be displayed on a computer screen or printed.
        </p>
        <p>
          To enable typesetting using AsciiMath, wrap your mathematical notation
          in <code>`backticks`</code>.
        </p>
        <p>
          <span className='text-decoration-underline'>Examples</span>
          <br />
          <code>`f(x) = x^2`</code> {`\`-> f(x) = x^2\``}
          <br />
          <br />
          <code>{`\`1/2 + 2/3\``}</code> {`\`-> 1/2 + 2/3\``}
          <br />
          <br />
          <code>{`\`sqrt 2\``}</code> {`\`-> sqrt 2\``}
        </p>
        <p>And many, many more...</p>
        <p>
          For more information, check out the{" "}
          <a
            href='https://asciimath.org/#syntax'
            target='_blank'
            rel='noreferrer'
          >
            AsciiMath Docs
          </a>
          .
        </p>
      </Modal.Body>
    </Modal>
  );
};

export default ASCIIMathTip;
