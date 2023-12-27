import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useEffect } from "react";

import { sendEmail } from "../Services/email";

import history from "history/browser"

const treehouseLogo = require('../images/Treehouse-Logo-New.svg').default;

const Login = ({ setUserProfile }) => {

  const provider = new GoogleAuthProvider();

  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser && history.location.key !== 'default') {
      history.back();
    }
  })

  const handleSignIn = () => {
    if (!auth.currentUser) {
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
    } else {
      navigate(`/tutor/${auth.currentUser.uid}`);
    }
  }

  return (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center p-3">
      <Card className="bg-light-subtle p-3 w-75">
        <Container className="">
          <Row className="d-flex flex-row justify-content-evenly align-items-center " xs={{ cols: 'auto' }}>
            <Col className="w-25">
              <div className="bg-secondary h-100 p-2">
                <img src={treehouseLogo} alt="Treehouse Logo" className="h-100" />
              </div>
            </Col>
            <Col>
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
                <Button variant="secondary" className="" onClick={sendEmail}>
                  Test
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </Card>
    </div>
  );
}

export default Login;