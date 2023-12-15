import { ToastContainer } from "react-bootstrap";

const DocSubmissionToast = ({ toasts }) => {
  // const [show, setShow] = useState(false);

  // useEffect(() => {
  //   if (toast.header !== '')
  //     setShow(true);
  // }, [toast])

  
  
  return (
    <ToastContainer className="position-fixed bottom-0 end-0 p-3">
      {toasts}
    </ToastContainer>
  )
}

export default DocSubmissionToast;