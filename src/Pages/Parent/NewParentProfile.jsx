import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { db } from "../../Services/firebase";
import { useNavigate } from "react-router-dom";
import StudentDropdown from "./Components/StudentDropdown";

const NewParentProfile = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      setStudents(
        snapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        }),
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleSubmit() {
    document.querySelectorAll(".is-invalid").forEach((el) => {
      el.classList.remove("is-invalid");
    });

    let email = document.getElementById("email").value;
    if (email === "" || !email.includes("@") || !email.includes(".")) {
      document.getElementById("email").classList.add("is-invalid");
      return;
    }
    if (selectedStudents.length === 0) {
      document
        .getElementById("selectedStudentList")
        .classList.add("is-invalid");
      return;
    }

    // Add parent to database
    // Add parent to students' parent list
    if (
      (
        await getDocs(
          query(collection(db, "parents"), where("email", "==", email)),
        )
      ).size > 0
    ) {
      document.getElementById("email").classList.add("is-invalid");
      alert("Parent with email already exists");
      return;
    }

    if (
      (
        await getDocs(
          query(collection(db, "tutors"), where("email", "==", email)),
        )
      ).size > 0
    ) {
      document.getElementById("email").classList.add("is-invalid");
      alert("Email already associated with a tutor");
      return;
    }

    let parentRef = doc(collection(db, "parents"));
    setDoc(parentRef, {
      email: email,
      students: selectedStudents.map((s) => s.id),
      clearance: "pending",
    }).then((result) => {
      navigate(`/parent/${result.id}`);
    });
  }

  return (
    <div className='d-flex flex-column m-3'>
      <div className='d-flex display-1'>New Parent</div>
      <Card className='d-flex p-3 bg-light-subtle'>
        <Row>
          <Col xs={6}>
            <Form.Label className='h5'>Email</Form.Label>
            <Form.Control type='email' id='email' />
            <div className='invalid-feedback'>Please provide a valid email</div>
          </Col>
          <Col>
            <Form.Label className='h5'>Clearance</Form.Label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Popover>
                  <Popover.Body>
                    Account will remain pending until the user logs in for the
                    first time
                  </Popover.Body>
                </Popover>
              }
            >
              <Form.Control as='select' disabled>
                <option value='pending'>Pending</option>
              </Form.Control>
            </OverlayTrigger>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <h5 className='mt-3'>Students</h5>
            <ul className='list-group' id='selectedStudentList'>
              {selectedStudents.map((student, i) => {
                return (
                  <li
                    key={i}
                    className='list-group-item d-flex align-items-center'
                  >
                    <div className=''>{student.student_name}</div>
                    <Button
                      className='ms-auto'
                      variant='danger'
                      onClick={() => {
                        setSelectedStudents(
                          selectedStudents.filter((s) => s !== student),
                        );
                      }}
                      size='sm'
                    >
                      <i className='bi bi-trash-fill'></i>
                    </Button>
                  </li>
                );
              })}
              <li className='list-group-item list-group-item-action'>
                <Dropdown>
                  <Dropdown.Toggle variant='' className='w-100'>
                    Add Student
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    as={StudentDropdown}
                    selectedStudents={selectedStudents}
                    setSelectedStudents={setSelectedStudents}
                    allStudents={students}
                  />
                </Dropdown>
              </li>
            </ul>
            <div className='invalid-feedback'>
              Please select at least one student
            </div>
          </Col>
        </Row>
      </Card>
      <div className='d-flex'>
        <Button
          onClick={() => navigate(-1)}
          className='mt-3'
          variant='secondary'
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} className='ms-auto mt-3'>
          Register Parent
        </Button>
      </div>
    </div>
  );
};

export default NewParentProfile;
