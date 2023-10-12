import { useParams } from "react-router-dom";
import StudentEvalForm from "../Components/StudentEvalForm";

const StudentEval = (props) => {
  const params = useParams();

  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className="p-3 display-1">New Session Evaluation</h1>
      <div className="card p-5 m-3 w-75 bg-light-subtle">
        <StudentEvalForm studentid={params.studentid} />
      </div>
    </div>
  );
};

export default StudentEval;