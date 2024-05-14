import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../Services/firebase";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContext } from "../../Services/toast";
import dayjs from "dayjs";
import { Col, Row } from "react-bootstrap";
import EmergencyContacts from "./Components/EmergencyContacts";

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const StudentProfileEdit = () => {
  const [student, setStudent] = useState({});
  const [tutors, setTutors] = useState([]);

  const [selectedTutor, setSelectedTutor] = useState("");

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentRef = useRef();

  const addToast = useContext(ToastContext);

  const navigate = useNavigate();

  const params = useParams();

  studentRef.current = doc(db, "students", params.studentid);

  useEffect(() => {
    const unsubscribeStudents = onSnapshot(studentRef.current, (docs) => {
      setStudent(docs.data() || {});
      setEmergencyContacts(docs.data()?.emergency_contacts || []);
      setSelectedTutor(docs.data()?.preferred_tutor || "");
      setLoading(false);
    });

    const unsubscribeTutors = onSnapshot(collection(db, "tutors"), (res) =>
      setTutors(res.docs),
    );

    return () => {
      unsubscribeStudents();
      unsubscribeTutors();
    };
  }, [params.studentid]);

  async function studentRemoval() {
    if (
      !window.confirm(
        "Are you sure you want to PERMANENTLY REMOVE the record for this student? This will also delete all evaluations and assessments associated with this student.",
      )
    ) {
      return;
    }

    // cascade delete evaluations and tasks
    await getDocs(
      query(
        collection(db, "evaluations"),
        where("student_id", "==", studentRef.current.id),
      ),
    ).then((res) => {
      addToast({
        header: "Evaluations Deleted",
        message: `${res.size} evaluations have been deleted`,
      });
      res.docs.forEach((doc) => {
        getDocs(collection(doc.ref, "tasks")).then((tasks) => {
          tasks.forEach((t) => {
            deleteDoc(t.ref);
          });
        });
        deleteDoc(doc.ref);
      });
    });
    // cascade delete assessments
    await getDocs(
      query(
        collection(db, "student_assessments"),
        where("student_id", "==", studentRef.current.id),
      ),
    ).then((res) => {
      addToast({
        header: "Assessments Deleted",
        message: `${res.size} assessments have been deleted`,
      });
      res.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    });
    // cascade delete standards
    await getDocs(collection(studentRef.current, "standards")).then((res) => {
      addToast({
        header: "Standards Deleted",
        message: `${res.size} standards have been deleted`,
      });
      res.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    });
    // delete student
    await deleteDoc(studentRef.current).then(() => {
      navigate("/students");
      addToast({
        header: "Student Deleted",
        message: `${student.student_name}'s profile has been deleted along with associated documents`,
      });
    });
  }

  async function updateStudent(e) {
    e.preventDefault();

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }
    let clean = true;

    if (dayjs().isBefore(dayjs(student.student_dob))) {
      document.getElementById("studentDOB").classList.add("is-invalid");
      // console.log(dayjs(), dayjs(student.student_dob));
      addToast({
        header: "Invalid Date",
        message: "Student birthday must be in the past",
      });
      clean = false;
    }

    if (
      student.parent_phone !== "" &&
      phoneRegex.test(student.parent_phone) === false
    ) {
      document.getElementById("parentPhone").classList.add("is-invalid");
      addToast({
        header: "Invalid Phone Number",
        message: "Parent phone number must be a valid phone number",
      });
      clean = false;
    }

    emergencyContacts.forEach((eContact, i) => {
      if (eContact.name === "") {
        document.getElementById(`contact${i}name`).classList.add("is-invalid");
        addToast({
          header: "Missing Emergency Contact",
          message: `Emergency contact ${i + 1} is missing a name`,
        });
        clean = false;
      }
      if (eContact.phone === "") {
        document.getElementById(`contact${i}phone`).classList.add("is-invalid");
        addToast({
          header: "Missing Emergency Contact",
          message: `Emergency contact ${i + 1} is missing a phone number`,
        });
        clean = false;
      } else if (phoneRegex.test(eContact.phone) === false) {
        document.getElementById(`contact${i}phone`).classList.add("is-invalid");
        addToast({
          header: "Invalid Phone Number",
          message: `Emergency contact ${i + 1} must have a valid phone number`,
        });
        clean = false;
      }
    });

    if (!clean) return;

    document.getElementById("saveChanges").disabled = true;

    document.getElementById("saveChanges").innerHTML =
      "Save Changes <span class='spinner-border spinner-border-sm' />";

    let preferredTutorName = "";
    if (selectedTutor !== "") {
      preferredTutorName = tutors
        .find(
          (tutor) =>
            tutor.id === document.getElementById("preferredTutor").value,
        )
        .data().displayName;
    }

    updateDoc(studentRef.current, {
      ...student,
      preferred_tutor_name: preferredTutorName,
      emergency_contacts: emergencyContacts,
    })
      .then(() =>
        addToast({
          header: "Changes Saved",
          message: `Student ${student.student_name}'s profile has been updated`,
        }),
      )
      .then(() => navigate(-1));
  }

  function tutorOptions() {
    return tutors.map((tutor) => {
      return (
        <option value={tutor.id} key={tutor.id}>
          {tutor.data().displayName}
        </option>
      );
    });
  }

  const innerForm = (
    <>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5'>Birthday</div>
          <input
            type='date'
            id='studentDOB'
            className='form-control'
            value={student.student_dob}
            onChange={(e) =>
              setStudent({ ...student, student_dob: e.target.value })
            }
          />
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5'>Grade</div>
          <input
            type='text'
            id='studentGrade'
            className='form-control'
            value={student.student_grade}
            onChange={(e) =>
              setStudent({ ...student, student_grade: e.target.value })
            }
          />
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5'>School</div>
          <input
            type='text'
            id='studentSchool'
            className='form-control'
            value={student.student_school}
            onChange={(e) =>
              setStudent({ ...student, student_school: e.target.value })
            }
          />
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5'>Source</div>
          <input
            type='text'
            id='studentSource'
            className='form-control'
            value={student.student_source}
            onChange={(e) =>
              setStudent({ ...student, student_source: e.target.value })
            }
          />
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-nowrap'>Parent Name</div>
          <input
            type='text'
            id='parentName'
            className='form-control'
            value={student.parent_name}
            onChange={(e) =>
              setStudent({ ...student, parent_name: e.target.value })
            }
          />
        </Col>
        <Col className='d-flex p-3 flex-column'>
          <div className='d-flex h5 text-nowrap'>Parent Phone Number</div>
          <input
            type='tel'
            id='parentPhone'
            className='form-control'
            value={student.parent_phone}
            onChange={(e) =>
              setStudent({ ...student, parent_phone: e.target.value })
            }
          />
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5'>Preferred Tutor</div>
          <select
            type='text'
            className='form-control'
            id='preferredTutor'
            value={selectedTutor}
            onChange={(e) => setSelectedTutor(e.target.value)}
          >
            <option disabled value=''>
              Select One
            </option>
            {tutorOptions()}
          </select>
        </Col>
      </Row>
      <Row className='d-flex'>
        <Col className='p-3'>
          <div className='d-flex h5'>Classes</div>
          <textarea
            className='d-flex form-control'
            id='medicalConditions'
            value={student.classes}
            onChange={(e) =>
              setStudent({ ...student, classes: e.target.value })
            }
          />
        </Col>
      </Row>
      <Row className='d-flex justify-content-start'>
        <Col className='d-flex p-3 flex-column' xs={12} md={6}>
          <div className='d-flex h5'>Medical Conditions</div>
          <textarea
            className='d-flex form-control'
            id='medicalConditions'
            value={student.medical_conditions}
            onChange={(e) => {
              setStudent({ ...student, medical_conditions: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onMouseEnter={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        </Col>
        <Col className='d-flex p-3 flex-column' xs={12} md={6}>
          <div className='d-flex h5'>Other Info</div>
          <textarea
            className='d-flex form-control'
            id='extraInfo'
            value={student.other}
            onChange={(e) => {
              setStudent({ ...student, other: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onMouseEnter={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
        </Col>
      </Row>
      <div className='d-flex py-3 h5'>Emergency Contacts</div>
      <div className='d-flex flex-column align-items-center'>
        <EmergencyContacts
          emergencyContacts={emergencyContacts}
          setEmergencyContacts={setEmergencyContacts}
        />
      </div>
    </>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Edit Student - {student.student_name}
      </h1>
      <form onSubmit={updateStudent}>
        <div className='d-flex p-3 card bg-light-subtle'>
          {loading ? (
            <div className='spinner-border align-self-center' />
          ) : (
            innerForm
          )}
        </div>
        <Row className='d-flex justify-content-end'>
          <button
            type='button'
            className='btn btn-secondary m-3 col text-nowrap'
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type='button'
            className='btn btn-danger m-3 col text-nowrap'
            onClick={studentRemoval}
          >
            Delete Student
          </button>
          <button
            type='submit'
            className='btn btn-primary m-3 col text-nowrap'
            id='saveChanges'
          >
            Save Changes
          </button>
        </Row>
      </form>
    </div>
  );
};

export default StudentProfileEdit;
