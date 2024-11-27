import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../Services/firebase";
import {
  Button,
  Col,
  Dropdown,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import StudentDropdown from "./Components/StudentDropdown";

const ParentProfileEdit = () => {
  const [parent, setParent] = useState({});
  const [followedStudents, setFollowedStudents] = useState([]);

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
        setFollowedStudents(
          await Promise.all(
            (parent.data()?.students ?? []).map(async (studentId) => {
              const student = await getDoc(doc(db, "students", studentId));
              return { ...student.data(), id: student.id };
            }),
          ),
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [params.parentid]);

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

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      // Delete parent from database
      deleteDoc(doc(db, "parents", params.parentid)).then(() => {
        navigate(-2);
      });
    }
  }

  function handleSubmit() {
    // Update parent in database
    updateDoc(doc(db, "parents", params.parentid), {
      clearance: parent.clearance,
      students: followedStudents.map((s) => s.id),
    }).then(() => {
      navigate(-1);
    });
  }

  return (
    <div className='m-3'>
      <div className='display-1'>Parent Profile Edit</div>
      <div className='card p-3 bg-light-subtle'>
        <Row>
          <Col xs={6}>
            <div className='h5'>Email</div>
            <OverlayTrigger
              placement='top'
              overlay={
                <Popover>
                  <Popover.Body>Email cannot be changed</Popover.Body>
                </Popover>
              }
            >
              <input
                className='form-control'
                disabled
                defaultValue={parent?.email}
              />
            </OverlayTrigger>
          </Col>
          <Col xs={6}>
            <div className='h5'>Clearance</div>
            {parent?.clearance === "pending" ? (
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
                <input
                  className='form-control'
                  disabled
                  defaultValue={capitalize(parent?.clearance || "")}
                />
              </OverlayTrigger>
            ) : (
              <select
                className='form-control'
                value={parent?.clearance}
                onChange={(e) => {
                  setParent({ ...parent, clearance: e.target.value });
                }}
              >
                <option value='active'>Active</option>
                <option value='held'>Held</option>
              </select>
            )}
          </Col>
        </Row>
        <Row className='pt-3'>
          <Col xs={6}>
            <div className='h5'>Students</div>
            <ul className='list-group'>
              {followedStudents.map((student) => {
                return (
                  <li key={student.id} className='list-group-item'>
                    <div className='d-flex align-items-center'>
                      <div className='flex-fill'>{student?.student_name}</div>
                      <Button
                        className='ms-3'
                        variant='danger'
                        size='sm'
                        onClick={() => {
                          setFollowedStudents(
                            followedStudents.filter((s) => s !== student),
                          );
                        }}
                      >
                        <i className='bi bi-trash-fill'></i>
                      </Button>
                    </div>
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
                    selectedStudents={followedStudents}
                    setSelectedStudents={setFollowedStudents}
                    allStudents={students}
                  />
                </Dropdown>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
      <div className='d-flex'>
        <Button
          onClick={() => navigate(-1)}
          className='mt-3'
          variant='secondary'
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          className='ms-auto mt-3'
          variant='danger'
        >
          Delete Parent
        </Button>
        <Button onClick={handleSubmit} className='ms-3 mt-3'>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ParentProfileEdit;
