// to be replaced with DB call
let tutors = ["Robert Smith"]

function tutorOptions() {
  return tutors.map((tutor) => {
    return (
      <option value={tutor}>{tutor}</option>
    );
  });
}

const NewStudentForm = () => {
  return (
    <form>
      <div className="row">
        <div class="col mb-3">
          <label for="studentName" class="form-label">Student Name</label>
          <input type="text" class="form-control" id="studentName" />
        </div>
        <div class="col mb-3">
        <label for="birthday" class="form-label">Student DOB</label>
        <input type="date" class="form-control" id="birthday" />
      </div>
      </div>
      <div className="row">
        <div class="col mb-3">
          <label for="parentName" class="form-label">Parent Name</label>
          <input type="text" class="form-control" id="parentName" />
        </div>
        <div class="col mb-3">
          <label for="parentPhone" class="form-label">Parent Phone</label>
          <input type="tel" class="form-control" id="parentPhone" />
        </div>
      </div>
      <div className="row">
        <div class="col mb-3">
          <label for="studentGrade" class="form-label">Student Grade</label>
          <input type="text" class="form-control" id="studentGrade" />
        </div>
        <div class="col mb-3">
          <label for="studentSchool" class="form-label">Student School</label>
          <input type="text" class="form-control" id="studentSchool" />
        </div>
      </div>
      <div class="mb-3">
        <label for="studentSource" class="form-label">Student Source</label>
        <input type="text" class="form-control" id="studentSource" />
      </div>

      <div class="mb-3">
        <label for="preferredTutor" class="form-label">Preferred Tutor</label>
        <select type="text" class="form-control" id="preferredTutor">
          <option selected>Select One</option>
          {tutorOptions()}
        </select>
      </div>
      
      <div class="mb-3">
        <label for="extraInfo" class="form-label">Other Info</label>
        <textarea class="form-control" id="extraInfo" />
      </div>
      <div class="mb-3">
        <label for="medicalConditions" class="form-label">Medical Conditions</label>
        <textarea class="form-control" id="medicalConditions" />
      </div>
      <div class="mb-3">
        <label for="Emergency Contacts" class="form-label">Emergency Contacts</label>
        <textarea class="form-control" id="Emergency Contacts" />
      </div>

      <button type="submit" class="btn btn-primary position-end">Submit</button>
    </form>
  );
}

export default NewStudentForm;