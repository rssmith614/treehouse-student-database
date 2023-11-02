import { useEffect, useState } from "react";
import { Toast, ToastBody, ToastContainer, ToastHeader } from "react-bootstrap";

const DocSubmissionToast = ({ toast }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (toast.header !== '')
      setShow(true);
  }, [toast])
  
  return (
    <ToastContainer className="position-fixed bottom-0 end-0 p-3">
      <Toast id="liveToast" role="alert" aria-live="assertive" aria-atomic="true"
        show={show} delay={5000} autohide onClose={() => setShow(false)}>
        <ToastHeader>
          <strong className="me-auto">{toast.header}</strong>
        </ToastHeader>
        <ToastBody>
          {toast.message}
        </ToastBody>
      </Toast>
    </ToastContainer>
  )
}

export default DocSubmissionToast;