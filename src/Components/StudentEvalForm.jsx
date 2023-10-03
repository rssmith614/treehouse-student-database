// to be replaced with DB call
let tutors = ["Robert Smith"]

function tutorOptions() {
  return tutors.map((tutor) => {
    return (
      <option value={tutor}>{tutor}</option>
    );
  });
}

const StudentEvalForm = (props) => {
  return (
    <form>
      <h2 className="">{props.eval.student_name}</h2>
      <div className="row my-3">
        <div className="col">
          <label className="form-label h3">Tutor</label>
          <select className="form-control">
            <option selected>Select One</option>
            {tutorOptions()}
          </select>
        </div>
        <div className="col">
          <label className="form-label h3">Date</label>
          <input className="form-control" type="date" />
        </div>
        <div className="col">
          <label className="form-label h3">Subject</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h3">Standard</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h3">Grade Level</label>
          <input className="form-control" type="text" />
        </div>
      </div>
      <div className="row my-3">
        <div className="col">
          <label className="form-label h3">Progression</label>
          <input className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
        </div>
        <div className="col">
          <label className="form-label h3">Engagement</label>
          <input className="form-control" type="number" min="1" max="5" step="1" defaultValue="5" />
        </div>
        <div className="col">
          <label className="form-label h3">Comments</label>
          <textarea className="form-control" />
        </div>
      </div>
      <hr />
      <div className="row my-3">
        <div className="col">
          <label className="form-label h3">Worksheet</label>
          <input className="form-control" type="file" />
        </div>
        <div className="col">
          <label className="form-label h3">Worksheet Completion</label>
          <input className="form-control" type="text" />
        </div>
        <div className="col">
          <label className="form-label h3">Next Session Plans</label>
          <textarea className="form-control" />
        </div>
      </div>

      <button className="btn btn-primary" type="submit">Submit</button>
    </form>
  );
}

export default StudentEvalForm;