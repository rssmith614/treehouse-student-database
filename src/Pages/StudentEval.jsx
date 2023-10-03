import StudentEvalForm from "../Components/StudentEvalForm";

const StudentEval = (props) => {
  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className="p-3">Student Evaluation</h1>
      <div className="card p-5 m-3 w-75 bg-light-subtle">
        <StudentEvalForm eval={props.eval} />
      </div>
    </div>
  );
};

export default StudentEval;