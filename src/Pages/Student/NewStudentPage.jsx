import { useContext, useEffect, useState } from "react";
import { db } from "../../Services/firebase";

import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../Services/toast";
import dayjs from "dayjs";
import EmergencyContacts from "./Components/EmergencyContacts";

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const NewProfile = () => {
  const [student, setStudent] = useState(
    localStorage.getItem("student")
      ? JSON.parse(localStorage.getItem("student"))
      : {
          student_name: "",
          student_dob: "",
          parent_name: "",
          parent_phone: "",
          student_grade: "",
          student_school: "",
          student_source: "",
          preferred_tutor: "",
          classes: "",
          reminders: false,
          other: "",
          medical_conditions: "",
        },
  );

  const [tutors, setTutors] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState(
    localStorage.getItem("eContacts")
      ? JSON.parse(localStorage.getItem("eContacts"))
      : [
          {
            name: "",
            relation: "",
            phone: "",
          },
        ],
  );

  const addToast = useContext(ToastContext);

  const navigate = useNavigate();

  // scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tutors"), (res) =>
      setTutors(res.docs),
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("student", JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem("eContacts", JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  async function addStudent(e) {
    e.preventDefault();

    const elements = document.getElementsByClassName("is-invalid");
    if (elements.length > 0) {
      Array.from(elements).forEach((el) => {
        el.classList.remove("is-invalid");
      });
    }
    let clean = true;

    if (student.student_name === "") {
      document.getElementById("studentName").classList.add("is-invalid");
      addToast({
        header: "Invalid Student Name",
        message: "Student Name cannot be empty",
      });
      clean = false;
    }

    if (student.student_dob === "") {
      document.getElementById("studentDOB").classList.add("is-invalid");
      addToast({
        header: "Invalid Date of Birth",
        message: "Date of Birth cannot be empty",
      });
      clean = false;
    }

    if (dayjs().isBefore(dayjs(student.student_dob))) {
      document.getElementById("studentDOB").classList.add("is-invalid");
      addToast({
        header: "Invalid Date of Birth",
        message: "Date of Birth cannot be in the future",
      });
      clean = false;
    }

    emergencyContacts.forEach((eContact, i) => {
      if (eContact.name === "") {
        document.getElementById(`contact${i}name`).classList.add("is-invalid");
        addToast({
          header: "Invalid Emergency Contact Name",
          message: `Emergency Contact ${i + 1} Name cannot be empty`,
        });
        clean = false;
      }
      if (eContact.phone === "") {
        document.getElementById(`contact${i}phone`).classList.add("is-invalid");
        addToast({
          header: "Invalid Emergency Contact Phone Number",
          message: `Emergency Contact ${i + 1} Phone Number cannot be empty`,
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

    document.getElementById("submit").innerHTML =
      "Submit <span class='spinner-border spinner-border-sm' />";

    let preferredTutorName =
      tutors.find((tutor) => tutor.id === student.preferred_tutor)?.data()
        .displayName || "";

    const studentCollRef = collection(db, "students");
    addDoc(studentCollRef, {
      ...student,
      preferred_tutor_name: preferredTutorName,
      emergency_contacts: emergencyContacts,
    })
      .then(() => {
        localStorage.removeItem("student");
        localStorage.removeItem("eContacts");
      })
      .then(() =>
        addToast({
          header: "Registration Complete",
          message: `Student ${student.student_name} has been registered`,
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

  return (
    <div className='p-3 d-flex flex-column'>
      <div className='d-flex display-1'>New Student</div>
      <div className='d-flex flex-column'>
        {/* <form onSubmit={addStudent}> */}
        <div className='d-flex p-3 card bg-light-subtle'>
          <div className='row'>
            <div className='col mb-3'>
              <label htmlFor='studentName' className='form-label h5'>
                Student Name
              </label>
              <input
                type='text'
                className='form-control'
                id='studentName'
                required
                value={student.student_name}
                onChange={(e) =>
                  setStudent({ ...student, student_name: e.target.value })
                }
              />
            </div>
            <div className='col mb-3'>
              <label htmlFor='studentDOB' className='form-label h5'>
                Student DOB
              </label>
              <input
                type='date'
                className='form-control'
                id='studentDOB'
                required
                value={student.student_dob}
                onChange={(e) =>
                  setStudent({ ...student, student_dob: e.target.value })
                }
              />
            </div>
          </div>
          <div className='row'>
            <div className='col mb-3'>
              <label htmlFor='parentName' className='form-label h5 text-nowrap'>
                Parent Name
              </label>
              <input
                type='text'
                className='form-control'
                id='parentName'
                value={student.parent_name}
                onChange={(e) =>
                  setStudent({ ...student, parent_name: e.target.value })
                }
              />
            </div>
            <div className='col mb-3'>
              <label
                htmlFor='parentPhone'
                className='form-label h5 text-nowrap'
              >
                Parent Phone Number
              </label>
              <input
                type='tel'
                className='form-control'
                id='parentPhone'
                value={student.parent_phone}
                onChange={(e) =>
                  setStudent({ ...student, parent_phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className='row'>
            <div className='col mb-3'>
              <label htmlFor='studentGrade' className='form-label h5'>
                Student Grade
              </label>
              <input
                type='text'
                className='form-control'
                id='studentGrade'
                value={student.student_grade}
                onChange={(e) =>
                  setStudent({ ...student, student_grade: e.target.value })
                }
              />
            </div>
            <div className='col mb-3'>
              <label htmlFor='studentSchool' className='form-label h5'>
                Student School
              </label>
              <input
                type='text'
                className='form-control'
                id='studentSchool'
                value={student.student_school}
                onChange={(e) =>
                  setStudent({ ...student, student_school: e.target.value })
                }
              />
            </div>
          </div>
          <div className='mb-3'>
            <label htmlFor='studentSource' className='form-label h5'>
              Student Source
            </label>
            <input
              type='text'
              className='form-control'
              id='studentSource'
              value={student.student_source}
              onChange={(e) =>
                setStudent({ ...student, student_source: e.target.value })
              }
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='preferredTutor' className='form-label h5'>
              Preferred Tutor
            </label>
            <select
              type='text'
              className='form-control'
              id='preferredTutor'
              value={student.preferred_tutor}
              onChange={(e) =>
                setStudent({ ...student, preferred_tutor: e.target.value })
              }
            >
              <option disabled value=''>
                Select One
              </option>
              {tutorOptions()}
            </select>
          </div>

          <div className='mb-3'>
            <label htmlFor='classes' className='form-label h5'>
              Classes
            </label>
            <textarea
              className='form-control'
              id='classes'
              value={student.classes}
              onChange={(e) =>
                setStudent({ ...student, classes: e.target.value })
              }
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='extraInfo' className='form-label h5'>
              Other Info
            </label>
            <textarea
              className='form-control'
              id='extraInfo'
              value={student.other}
              onChange={(e) =>
                setStudent({ ...student, other: e.target.value })
              }
            />
          </div>
          <div className='mb-3'>
            <label htmlFor='medicalConditions' className='form-label h5'>
              Medical Conditions
            </label>
            <textarea
              className='form-control'
              id='medicalConditions'
              value={student.medical_conditions}
              onChange={(e) =>
                setStudent({ ...student, medical_conditions: e.target.value })
              }
            />
          </div>
          <div className='mb-3 h5'>Emergency Contacts</div>
          <div className='d-flex flex-column mx-3 mb-3' id='emergencyContacts'>
            <EmergencyContacts
              emergencyContacts={emergencyContacts}
              setEmergencyContacts={setEmergencyContacts}
            />
          </div>
        </div>
        <div className='d-flex'>
          <button
            type='button'
            className='btn btn-secondary m-3'
            onClick={() => {
              localStorage.removeItem("student");
              localStorage.removeItem("eContacts");
              navigate(-1);
            }}
          >
            Back
          </button>
          <button
            onClick={addStudent}
            className='btn btn-primary m-3 ms-auto'
            id='submit'
          >
            Submit
          </button>
        </div>
        {/* </form> */}
      </div>
    </div>
  );
};

export default NewProfile;
