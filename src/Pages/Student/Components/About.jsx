import { useNavigate } from "react-router-dom";
import { Can } from "../../../Services/can";
import { Col, Row, Table } from "react-bootstrap";
import dayjs from "dayjs";
import EmergencyContacts from "./EmergencyContacts";

const About = ({ student, loading }) => {
  const navigate = useNavigate();

  return (
    <div className={(loading && "placeholder-wave") || ""}>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline'>Birthday</div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex text-nowrap'>
              {dayjs(student.student_dob).format("MMMM D, YYYY")}
            </div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline'>Grade</div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.student_grade}</div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline'>School</div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.student_school}</div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline'>Source</div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.student_source}</div>
          )}
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline text-nowrap'>
            Parent Name
          </div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex text-nowrap'>{student.parent_name}</div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline text-nowrap'>
            Parent Phone Number
          </div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.parent_phone}</div>
          )}
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-decoration-underline text-nowrap'>
            Preferred Tutor
          </div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex text-nowrap'>
              {student.preferred_tutor_name}
            </div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column' xs={12} md={6}>
          <div className='d-flex h5 text-decoration-underline'>Classes</div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.classes}</div>
          )}
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column' xs={12} md={6}>
          <div className='d-flex h5 text-decoration-underline text-nowrap'>
            Medical Conditions
          </div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.medical_conditions}</div>
          )}
        </Col>
        <Col className='d-flex p-3 flex-column' xs={12} md={6}>
          <div className='d-flex h5 text-decoration-underline text-nowrap'>
            Other Info
          </div>
          {loading ? (
            <div className='placeholder' />
          ) : (
            <div className='d-flex'>{student.other}</div>
          )}
        </Col>
      </Row>
      <div className='d-flex justify-content-start table-responsive flex-column flex-fill'>
        <div className='d-flex p-3 h5 text-decoration-underline'>
          Emergency Contacts
        </div>
        <div className='d-flex px-3'>
          {loading ? (
            <Table striped className='placeholder-wave'>
              <thead>
                <tr>
                  <th
                    className='placeholder w-100'
                    style={{ height: "2.8rem" }}
                  />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className='placeholder w-100'
                    style={{ height: "2.8rem" }}
                  />
                </tr>
              </tbody>
            </Table>
          ) : (
            <EmergencyContacts emergencyContacts={student.emergency_contacts} />
          )}
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
    </div>
  );
};

export default About;
