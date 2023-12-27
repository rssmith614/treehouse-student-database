import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Services/firebase";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ToastContext } from "../../Services/toast";

const NewTutorPage = () => {
  const navigate = useNavigate();

  const addToast = useContext(ToastContext);

  function handleSubmit(e) {
    e.preventDefault();

    let clearance = document.getElementById("tutorclearance").value;
    let email = document.getElementById("tutoremail").value;

    const tutorCollRef = collection(db, "tutors");
    const q = query(tutorCollRef, where("email", "==", email));

    getDocs(q).then((res) => {
      if (res.docs.length !== 0) {
        window.alert(
          `The email ${email} is already registered to a Tutor account.`,
        );
        return;
      }
      if (clearance === "admin") {
        if (
          !window.confirm(
            `You are about to GRANT admin permissions to a new user: ${email}. They will have full read, write, and edit permissions on all data. Are you sure you want to do this?`,
          )
        ) {
          return;
        }
      } else if (clearance === "held" || clearance === "revoked") {
        if (
          !window.confirm(
            `You have assigned the new user ${email} '${clearance}' permissions. They will not have access to the system. Are you sure you want to do this?`,
          )
        ) {
          return;
        }
      }

      addDoc(tutorCollRef, {
        email: document.getElementById("tutoremail").value,
        clearance: document.getElementById("tutorclearance").value,
        activated: false,
      })
        .then(() =>
          addToast({
            header: "Registration Complete",
            message: `${email} has been registered with ${clearance} clearance. They need to sign in to finish activation`,
          }),
        )
        .then(() => navigate("/tutors"));
    });
  }

  return (
    <div className='d-flex flex-column vh-100 justify-content-evenly'>
      <div className='d-flex justify-content-center'>
        <div className='d-flex card p-3 m-3 bg-light-subtle w-50'>
          <form className='d-flex flex-column p-1' onSubmit={handleSubmit}>
            <span>
              Enter the new tutor's email, associated with a Google Account. The
              next time they attempt to log in, the system will grant them
              access.
            </span>
            <input
              id='tutoremail'
              className='form-control m-1'
              type='email'
              placeholder='Email'
              required
            />
            <select id='tutorclearance' className='form-control m-1' required>
              <option value='' disabled>
                Assign Clearance
              </option>
              <option value='admin'>Admin</option>
              <option value='tutor'>Tutor</option>
              <option value='held'>Held</option>
              <option value='revoked'>Revoked</option>
            </select>
            <button className='btn btn-primary m-1' type='submit'>
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className='p-5'></div>
    </div>
  );
};

export default NewTutorPage;
