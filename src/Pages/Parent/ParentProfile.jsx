import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";

const ParentProfile = () => {
  const [parent, setParent] = useState({});
  const [students, setStudents] = useState([]);

  const params = useParams();

  const navigate = useNavigate();

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "parents", params.parentid),
      async (parent) => {
        setParent({ id: parent.id, ...parent.data() });
        setStudents(
          await Promise.all(
            (parent.data().students ?? []).map(async (studentId) => {
              const student = await getDoc(doc(db, "students", studentId));
              return { id: student.id, ...student.data() };
            }),
          ),
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [params.parentid]);

  return (
    <div className='m-3'>
      <div className='display-1'>
        Parent Profile {parent?.displayName ? ` - ${parent.displayName}` : ""}
      </div>
      <div className='card p-3 bg-light-subtle'>
        <Row>
          <Col xs={6}>
            <div className='h5'>Email</div>
            <div>{parent?.email}</div>
          </Col>
          <Col xs={6}>
            <div className='h5'>Clearance</div>
            <div>{capitalize(parent?.clearance || "")}</div>
          </Col>
        </Row>
        <Row className='pt-3'>
          <Col xs={6}>
            <div className='h5'>Students</div>
            <ul className='list-group'>
              {students.map((student) => {
                return (
                  <li key={student.id} className='list-group-item'>
                    {student.student_name}
                  </li>
                );
              })}
            </ul>
          </Col>
        </Row>
      </div>
      <div className='d-flex'>
        <Button
          variant='secondary'
          onClick={() => navigate(-1)}
          className='mt-3'
        >
          Back
        </Button>
        <Button
          variant='info'
          onClick={() => navigate(`/parent/edit/${params.parentid}`)}
          className='ms-auto mt-3'
        >
          Make Changes
        </Button>
      </div>
    </div>
  );
};

export default ParentProfile;
