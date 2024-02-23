import { Navigate, BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

// import 'bootstrap/dist/css/bootstrap.min.css';
import './css/custom.css'

import Login from './Pages/Login';

import NewStudentEval from './Pages/Eval/NewStudentEval';
import StudentEvalsList from './Pages/Eval/StudentEvalsList';

import NewStudentPage from './Pages/Student/NewStudentPage';
import StudentProfile from './Pages/Student/StudentProfile';
import StudentProfilesList from './Pages/Student/StudentProfilesList';
import StudentProfileEdit from './Pages/Student/StudentProfileEdit';

import TutorProfile from './Pages/Tutor/TutorProfile';
import TutorProfilesList from './Pages/Tutor/TutorProfilesList';
import TutorProfileEdit from './Pages/Tutor/TutorProfileEdit';

import Navbar from './Components/Navbar';

import { AbilityContext } from './Services/can';
import { defineAbilityFor } from "./Services/defineAbility";

import { getDoc, doc } from 'firebase/firestore';

import { auth, db } from './Services/firebase';
import { useState } from 'react';
import StudentEval from './Pages/Eval/StudentEval';
import StudentEvalEdit from './Pages/Eval/StudentEvalEdit';
import NewEval from './Pages/Eval/NewEval';
import Evals from './Pages/Eval/Evals';
import DocSubmissionToast from './Components/DocSumbissionToast';
import { ToastContext } from './Services/toast';
import EvalQuery from './Pages/Eval/EvalQuery';
import StandardsList from './Pages/Standards/StandardsList';
import { Toast, ToastBody, ToastHeader } from 'react-bootstrap';
import AssessmentsList from './Pages/Assessments/AssessmentsList';
import AssessmentEdit from './Pages/Assessments/AssessmentEdit';
import NewStudentAssessment from './Pages/Assessments/NewStudentAssessment';
import StudentAssessment from './Pages/Assessments/StudentAssessment';
import StudentAssessmentEdit from './Pages/Assessments/StudentAssessmentEdit';
import EvalsPendingReview from './Pages/Eval/EvalsPendingReview';
import Footer from './Components/Footer';

function App() {

  // THEME MANAGEMENT
  // const getStoredTheme = () => localStorage.getItem('theme')

  // const getPreferredTheme = () => {
  //   const storedTheme = getStoredTheme()
  //   if (storedTheme) {
  //     return storedTheme
  //   }

  //   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  // }

  const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  setTheme('dark');

  // USER / ABILITY MANAGEMENT
  const [userProfile, setUserProfile] = useState(null);

  auth.onAuthStateChanged((user) => {
    if (user) {
      if (!userProfile) {
        getDoc(doc(db, 'tutors', user.uid))
          .then(userDoc => {
            if (userDoc.exists()) {
              setUserProfile(userDoc);
            }
          }).catch(err => {
            console.error(err);
          })
      }
    } else {
      setUserProfile(null);
    }
  })

  // TOAST MANAGEMENT
  const [toasts, setToasts] = useState([]);
  const [shownToasts, setShownToasts] = useState([]);

  function addToast(newToast) {
    // allows for multiple toasts
    // maintains order while allowing removal and disappear animation
    setToasts(prevToasts => [newToast, ...prevToasts]);
    setShownToasts(prevShownToasts => [...prevShownToasts, newToast]);
  }

  const toastElements = (
    toasts.map((t, i) => {
      return (
        <Toast id="liveToast" key={i} role="alert" aria-live="assertive" aria-atomic="true"
          show={shownToasts.includes(t)} delay={5000} autohide
          onClose={() => { setShownToasts(prevToasts => prevToasts.filter(toast => toast !== t)) }}
          onExited={() => { setToasts(prevToasts => prevToasts.filter(toast => toast !== t)) }}>
          <ToastHeader>
            <strong className="me-auto">{t.header}</strong>
          </ToastHeader>
          <ToastBody>
            {t.message}
          </ToastBody>
        </Toast>
      )
    })
  )

  return (
    <AbilityContext.Provider value={defineAbilityFor(userProfile)}>
      <ToastContext.Provider value={addToast}>
        <Router>
          <Navbar userProfile={userProfile} />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login userProfile={userProfile} setUserProfile={setUserProfile} />} />

            <Route path='/evals' element={<Evals />} />
            <Route path='/eval/new' element={<NewEval />} />
            <Route path='/eval/new/:studentid' element={<NewStudentEval />} />
            <Route path='/eval/:evalid' element={<StudentEval />} />
            <Route path='/evals/:studentid' element={<StudentEvalsList />} />
            <Route path='/eval/edit/:evalid' element={<StudentEvalEdit />} />
            <Route path='/eval/query' element={<EvalQuery />} />
            <Route path="/evals/review" element={<EvalsPendingReview />} />

            <Route path="/newstudent" element={<NewStudentPage />} />
            <Route path="/students" element={<StudentProfilesList />} />
            <Route path="/students/:studentid" element={<StudentProfile />} />
            <Route path="students/edit/:studentid" element={<StudentProfileEdit />} />

            <Route path="/tutors" element={<TutorProfilesList />} />
            <Route path="/tutor/:tutorid" element={<TutorProfile />} />
            <Route path="/tutor/edit/:tutorid" element={<TutorProfileEdit />} />

            <Route path="/standards" element={<StandardsList />} />

            <Route path='/assessments' element={<AssessmentsList />} />
            <Route path='/assessments/edit/:assessmentid' element={<AssessmentEdit />} />
            <Route path='/assessments/new/:studentid' element={<NewStudentAssessment />} />
            <Route path='/assessments/:assessmentid' element={<StudentAssessment />} />
            <Route path='/assessments/student/edit/:assessmentid' element={<StudentAssessmentEdit />} />
          </Routes>
          <Footer />
        </Router>
        <DocSubmissionToast toasts={toastElements} />
      </ToastContext.Provider>
    </AbilityContext.Provider>
  );
}

export default App;
