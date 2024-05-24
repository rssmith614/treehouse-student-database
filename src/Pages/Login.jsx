import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Button,
  Card,
  Col,
  Collapse,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useEffect, useState } from "react";

import { sendAuthRequestEmail } from "../Services/email";

import history from "history/browser";

const treehouseLogo = require("../images/Treehouse-Logo-New.svg").default;

const Login = ({ setUserProfile }) => {
  const provider = new GoogleAuthProvider();

  const navigate = useNavigate();

  const [showEmailLogin, setShowEmailLogin] = useState(false);

  useEffect(() => {
    if (auth.currentUser && history.location.key !== "default") {
      history.back();
    }
  });

  const handleSignIn = () => {
    if (!auth.currentUser) {
      signInWithPopup(auth, provider)
        .then(async (result) => {
          const user = result.user;
          // console.log(user);

          // Check if user is in the database
          getDoc(doc(db, "tutors", user.uid)).then((userDoc) => {
            if (userDoc.exists()) {
              if (
                userDoc.data().clearance === "held" ||
                userDoc.data().clearance === "revoked"
              ) {
                // deny access based on clearance
                window.alert(
                  "You do not have access to the Treehouse Student Database. Contact an administrator.",
                );
                signOut(auth);
              } else if (userDoc.data().clearance === "pending") {
                // special case for pending clearance
                window.alert(
                  "Your access to the Treehouse Student Database is pending. You will be notified when your access has been granted.",
                );
                signOut(auth);
              } else {
                // successful login
                setUserProfile(userDoc);
                navigate(`/tutor/${userDoc.id}`);
              }
            } else {
              // unrecognized user
              if (
                !window.confirm(
                  "You are not registered in the database. Would you like to request access?",
                )
              ) {
                signOut(auth);
              } else {
                // auth request
                let { apiKey: _, ...rest } = {
                  ...JSON.parse(JSON.stringify(user.toJSON())),
                  activated: false,
                  clearance: "pending",
                };
                setDoc(doc(db, "tutors", user.uid), rest)
                  .then(() => {
                    sendAuthRequestEmail(user.displayName, user.email);
                  })
                  .then(() => {
                    window.alert(
                      "Your request has been sent. You will be notified when your account is activated.",
                    );
                    signOut(auth);
                  });
              }
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      navigate(`/tutor/${auth.currentUser.uid}`);
    }
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      const email = document.querySelector('input[type="email"]').value;
      const password = document.querySelector('input[type="password"]').value;
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          getDoc(doc(db, "tutors", user.uid)).then((userDoc) => {
            if (userDoc.exists()) {
              setUserProfile(userDoc);
              navigate("/students");
            } else {
              setDoc(doc(db, "tutors", user.uid), {
                ...JSON.parse(JSON.stringify(user.toJSON())),
                clearance: "admin",
                activated: true,
              }).then((res) => {
                setUserProfile(res);
                navigate("/students");
              });
            }
          });
        })
        .catch((error) => {
          console.log(error);
          if (error.code === "auth/user-not-found") {
            window.alert(
              "User not found. Please sign in with Google or try again later.",
            );
          } else if (error.code === "auth/wrong-password") {
            window.alert("Incorrect password.");
          } else if (error.code === "auth/invalid-email") {
            window.alert("Invalid email.");
          } else {
            window.alert("An error occurred. Please try again later.");
          }
        });
    } else {
      navigate(`/students`);
    }
  };

  return (
    <div className='d-flex flex-column vh-100 justify-content-center align-items-center p-3'>
      <Card className='bg-light-subtle p-3 w-75'>
        <Container className=''>
          <Row
            className='d-flex flex-row justify-content-evenly align-items-center '
            xs={{ cols: "auto" }}
          >
            <Col xs={12} sm={4}>
              <div className='h-100 p-2'>
                <img
                  src={treehouseLogo}
                  alt='Treehouse Logo'
                  className='h-100'
                />
              </div>
            </Col>
            <Col>
              <div className='d-flex flex-column justify-content-evenly align-items-center text-center'>
                <div className='display-1'>TEST Tutoring</div>
                <div className='h3'>Student Database</div>
                <div className='d-flex'>
                  <Button variant='primary' className='' onClick={handleSignIn}>
                    Sign In <i className='bi bi-google' />
                  </Button>
                  <Button
                    variant={showEmailLogin ? "outline-primary" : "primary"}
                    className='ms-3'
                    onClick={() => setShowEmailLogin(!showEmailLogin)}
                  >
                    Sign In <i className='bi bi-envelope-fill' />
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </Card>
      <Collapse in={showEmailLogin}>
        <div>
          <Card className='bg-light-subtle p-3 mt-3'>
            <Form onSubmit={handleEmailSignIn}>
              <div className='d-flex flex-column align-items-center'>
                <Form.Control
                  type='email'
                  placeholder='Email'
                  className='mb-3 w-auto'
                />
                <Form.Control
                  type='password'
                  placeholder='Password'
                  className='mb-3'
                />
                <Button variant='primary' type='submit'>
                  Sign In <i className='bi bi-envelope-fill' />
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default Login;
