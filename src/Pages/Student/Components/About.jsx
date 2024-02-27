import { useNavigate } from "react-router-dom";
import { Can } from "../../../Services/can";

const About = ({ student }) => {
  const navigate = useNavigate();

  const emergencyContactList = () => {
    if (!student.emergency_contacts) return null;
    return student.emergency_contacts.map((c, i) => {
      return (
        <tr key={i}>
          <td>{c.name}</td>
          <td>{c.relation}</td>
          <td>{c.phone}</td>
        </tr>
      );
    });
  };

  return (
    <>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>Birthday</div>
          <div className='d-flex'>{student.student_dob}</div>
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>Grade</div>
          <div className='d-flex'>{student.student_grade}</div>
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>School</div>
          <div className='d-flex'>{student.student_school}</div>
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>Source</div>
          <div className='d-flex'>{student.student_source}</div>
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>Parent Name</div>
          <div className='d-flex'>{student.parent_name}</div>
        </div>
        <div className='d-flex p-3 flex-column w-50'>
          <div className='d-flex h5 text-decoration-underline'>
            Parent Phone Number
          </div>
          <div className='d-flex'>{student.parent_phone}</div>
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>
            Preferred Tutor
          </div>
          <div className='d-flex'>{student.preferred_tutor_name}</div>
        </div>
        <div className='d-flex p-3 flex-column w-50'>
          <div className='d-flex h5 text-decoration-underline'>Classes</div>
          <div className='d-flex'>{student.classes}</div>
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5 text-decoration-underline'>
            Medical Conditions
          </div>
          <div className='d-flex'>{student.medical_conditions}</div>
        </div>
        <div className='d-flex p-3 flex-column w-50'>
          <div className='d-flex h5 text-decoration-underline'>Other Info</div>
          <div className='d-flex'>{student.other}</div>
        </div>
      </div>
      <div className='d-flex justify-content-start table-responsive flex-column flex-fill'>
        <div className='d-flex p-3 h5 text-decoration-underline'>
          Emergency Contacts
        </div>
        <div className='d-flex px-3'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th scope='col'>Name</th>
                <th scope='col'>Relation</th>
                <th scope='col'>Phone Number</th>
              </tr>
            </thead>
            <tbody>{emergencyContactList()}</tbody>
          </table>
        </div>
      </div>
      <Can do='manage' on='students'>
        <div className='d-flex justify-content-end'>
          <button
            className='btn btn-info m-3'
            onClick={() => navigate(`/students/edit/${student.id}`)}
          >
            Make Changes
          </button>
        </div>
      </Can>
    </>
  );
};

export default About;
