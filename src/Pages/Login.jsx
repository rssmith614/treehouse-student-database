import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore";
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
              if (userDoc.data().clearance === "held" || userDoc.data().clearance === 'revoked') {
                window.alert('You do not have access to the Treehouse Student Database. Contact an administrator.');
                signOut(auth);
              } else if (userDoc.data().clearance === 'pending') {
                window.alert('Your access to the Treehouse Student Database is pending. You will be notified when your access has been granted.');
                signOut(auth);
              } else {
                setUserProfile(userDoc);
                navigate(`/tutor/${userDoc.id}`);
              }
            } else {
              if (!window.confirm('You are not registered in the database. Would you like to request access?')) {
                signOut(auth);
              } else {
                let { apiKey: _, ...rest } = { ...JSON.parse(JSON.stringify(user.toJSON())), activated: false, clearance: 'pending' };
                setDoc(doc(db, 'tutors', user.uid), rest)
                  .then(() => {
                    window.alert('Your request has been sent. You will be notified when your account is activated.');
                    signOut(auth);
                  })
              }
            }
          })

      }).catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center p-3">
      <Card className="d-flex flex-row bg-light-subtle p-3 w-75">
        <img src={treehouseLogo} alt="Treehouse Logo"
          style={{
            filter: "invert(69%) sepia(83%) saturate(739%) hue-rotate(359deg) brightness(104%) contrast(105%)",
            height: 250
            }} />
        <div className="d-flex flex-column justify-content-evenly align-items-center text-center">
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