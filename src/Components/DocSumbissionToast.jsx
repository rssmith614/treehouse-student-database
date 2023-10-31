// import { Toast } from "bootstrap"; 
import { useEffect } from "react";

const DocSubmissionToast = ({ toast }) => {

  useEffect(() => {
    if (toast.header !== '')
      // bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast')).show();
      document.getElementById('liveToast').dispatchEvent('show.bs.toast')
  }, [toast])
  
  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div id="liveToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="toast-header">
          <strong className="me-auto">{toast.header}</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div className="toast-body">
          {toast.message}
        </div>
      </div>
    </div>
  )
}

export default DocSubmissionToast;