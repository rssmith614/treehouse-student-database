import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { Button, Card } from "react-bootstrap";

const treehouseLogo = require('../images/TreeHouse-Tutoring-Logo-02.svg').default;

const Login = ({ setUserProfile }) => {

  const provider = new GoogleAuthProvider();

  const navigate = useNavigate();

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        // console.log(user);

        getDoc(doc(db, 'tutors', user.uid))
          .then(userDoc => {
            if (userDoc.exists()) {
              if (userDoc.clearance === "held" || userDoc.clearance === 'revoked') {
                window.alert('You do not have access to the Treehouse Student Database. Contact an administrator.');
                signOut(auth);
                return;
              }

              setUserProfile(userDoc);
              navigate(`/tutor/${userDoc.id}`);
            } else {
              const tutorsRef = collection(db, "tutors");

              const q = query(tutorsRef, where("email", "==", user.email));

              getDocs(q).then((res) => {
                if (res.docs.length === 0) {
                  window.alert(`User ${user.displayName}: ${user.email} is not in the database`);
                  signOut(auth);
                } else {
                  let attemptedLoginUser = res.docs[0].data();

                  if (!attemptedLoginUser.activated) {
                    deleteDoc(res.docs[0].ref);
                    let { apiKey: _, ...rest } = { ...JSON.parse(JSON.stringify(user.toJSON())), ...attemptedLoginUser, activated: true };
                    attemptedLoginUser = rest
                    setDoc(doc(db, 'tutors', user.uid), attemptedLoginUser)
                  }

                  setUserProfile(attemptedLoginUser);
                  navigate(`/tutor/${attemptedLoginUser.id}`);
                }
              })
            }
          })

      }).catch((error) => {
        // console.log(error);
      });
  }

  return (
    <div className="d-flex flex-column vh-100 justify-content-center p-3">
      <Card className="d-flex flex-row bg-light-subtle p-3">
        <img src={treehouseLogo} alt="Treehouse Logo"
          style={{
            filter: "invert(69%) sepia(83%) saturate(739%) hue-rotate(359deg) brightness(104%) contrast(105%)",
            height: 200
            }} />
        <div className="d-flex flex-column justify-content-evenly align-items-center">
          <div className="display-1">
            Treehouse Tutoring
          </div>
          <div className="h3">
            Student Database
          </div>
          <Button variant="primary" className="" onClick={handleSignIn}>
            Sign In <i className="bi bi-google" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Login;