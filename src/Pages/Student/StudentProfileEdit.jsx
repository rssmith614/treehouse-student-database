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

    if (dayjs().isBefore(dayjs(student.student_dob))) {
      // console.log(dayjs(), dayjs(student.student_dob));
      addToast({
        header: "Invalid Date",
        message: "Student birthday must be in the past",
      });
      return;
    }

    if (
      student.parent_phone !== "" &&
      phoneRegex.test(student.parent_phone) === false
    ) {
      addToast({
        header: "Invalid Phone Number",
        message: "Parent phone number must be a valid phone number",
      });
      return;
    }

    try {
      emergencyContacts.forEach((eContact, i) => {
        // console.log(eContact);
        if (eContact.name === "") {
          addToast({
            header: "Missing Emergency Contact",
            message: `Emergency contact ${i + 1} is missing a name`,
          });
          throw new Error();
        }
        if (eContact.phone === "") {
          addToast({
            header: "Missing Emergency Contact",
            message: `Emergency contact ${i + 1} is missing a phone number`,
          });
          throw new Error();
        } else if (phoneRegex.test(eContact.phone) === false) {
          addToast({
            header: "Invalid Phone Number",
            message: `Emergency contact ${
              i + 1
            } must have a valid phone number`,
          });
          throw new Error();
        }
      });
    } catch (e) {
      return;
    }

    document.getElementById("saveChanges").disabled = true;

    document.getElementById("saveChanges").innerHTML =
      "Save Changes <span class='spinner-border spinner-border-sm' />";

    let preferredTutorName = "";
    if (student.preferred_tutor !== "") {
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

  function addEContact() {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: "", relation: "", phone: "" },
    ]);
  }

  function updateEContacts() {
    let newList = emergencyContacts.map((e) => {
      return e;
    });
    newList.forEach((eContact, i) => {
      eContact.name = document.getElementById(`contact${i}name`).value;
      eContact.relation = document.getElementById(`contact${i}rel`).value;
      eContact.phone = document.getElementById(`contact${i}phone`).value;
    });

    setEmergencyContacts(newList);
  }

  function removeEContact(idx) {
    if (typeof idx === "object") idx.preventDefault();
    let newList = emergencyContacts.map((e) => {
      return e;
    });

    newList.forEach((eContact, i) => {
      document.getElementById(`contact${i}name`).value = "";
      document.getElementById(`contact${i}rel`).value = "";
      document.getElementById(`contact${i}phone`).value = "";
    });

    newList.splice(idx, 1);

    newList.forEach((eContact, i) => {
      document.getElementById(`contact${i}name`).value = eContact.name;
      document.getElementById(`contact${i}rel`).value = eContact.relation;
      document.getElementById(`contact${i}phone`).value = eContact.phone;
    });

    setEmergencyContacts(newList);
  }

  const emergencyContactList = () => {
    if (Object.keys(student).length === 0) return null;
    return emergencyContacts.map((c, i) => {
      let rowid = "contact" + i;
      return (
        <tr key={i}>
          <td>
            <button
              id={rowid + "del"}
              type='button'
              className='btn btn-danger'
              onClick={() => {
                removeEContact(i);
              }}
              disabled={emergencyContacts.length === 1}
            >
              <i className='bi bi-trash-fill' />
            </button>
          </td>
          <td>
            <input
              id={rowid + "name"}
              className='form-control'
              defaultValue={c.name}
              onBlur={updateEContacts}
            />
          </td>
          <td>
            <input
              id={rowid + "rel"}
              className='form-control'
              defaultValue={c.relation}
              onBlur={updateEContacts}
            />
          </td>
          <td>
            <input
              id={rowid + "phone"}
              className='form-control'
              defaultValue={c.phone}
              onBlur={updateEContacts}
            />
          </td>
        </tr>
      );
    });
  };

  const innerForm = (
    <>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
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
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
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
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
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
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
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
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5'>Parent Name</div>
          <input
            type='text'
            id='parentName'
            className='form-control'
            value={student.parent_name}
            onChange={(e) =>
              setStudent({ ...student, parent_name: e.target.value })
            }
          />
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5'>Parent Phone Number</div>
          <input
            type='tel'
            id='parentPhone'
            className='form-control'
            value={student.parent_phone}
            onChange={(e) =>
              setStudent({ ...student, parent_phone: e.target.value })
            }
          />
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
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
        </div>
      </div>
      <div className='d-flex justify-content-start'>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5'>Medical Conditions</div>
          <textarea
            className='d-flex form-control'
            id='medicalConditions'
            value={student.medical_conditions}
            onChange={(e) =>
              setStudent({ ...student, medical_conditions: e.target.value })
            }
          />
        </div>
        <div className='d-flex p-3 flex-column flex-fill'>
          <div className='d-flex h5'>Other Info</div>
          <textarea
            className='d-flex form-control'
            id='extraInfo'
            value={student.other}
            onChange={(e) => setStudent({ ...student, other: e.target.value })}
          />
        </div>
      </div>
      <div className='d-flex p-3 h5'>Emergency Contacts</div>
      <div className='d-flex flex-column px-5'>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Relation</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>{emergencyContactList()}</tbody>
        </table>
        <button
          type='button'
          className='btn btn-secondary me-auto'
          onClick={addEContact}
        >
          Add New Emergency Contact
        </button>
      </div>
    </>
  );

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>
        Edit Student - {student.student_name}
      </h1>
      <form onSubmit={updateStudent}>
        <div className='d-flex p-3 m-3 card bg-light-subtle'>
          {loading ? (
            <div className='spinner-border align-self-center' />
          ) : (
            innerForm
          )}
        </div>
        <div className='d-flex justify-content-end'>
          <button
            type='button'
            className='btn btn-secondary m-3 me-auto'
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type='button'
            className='btn btn-danger m-3'
            onClick={studentRemoval}
          >
            Delete Student
          </button>
          <button
            type='submit'
            className='btn btn-primary m-3'
            id='saveChanges'
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfileEdit;
