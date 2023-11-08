import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './Pages/Login';

import NewStudentEval from './Pages/Eval/NewStudentEval';
import StudentEvalsList from './Pages/Eval/StudentEvalsList';

import NewStudentPage from './Pages/Student/NewStudentPage';
import StudentProfile from './Pages/Student/StudentProfile';
import StudentProfilesList from './Pages/Student/StudentProfilesList';
import StudentProfileEdit from './Pages/Student/StudentProfileEdit';

import NewTutorPage from './Pages/Tutor/NewTutorPage';
import TutorProfile from './Pages/Tutor/TutorProfile';
import TutorProfilesList from './Pages/Tutor/TutorProfilesList';
import TutorProfileEdit from './Pages/Tutor/TutorProfileEdit';

import Navbar from './Components/Navbar';

import { AbilityContext } from './Services/can';
import defineAbilityFor from "./Services/defineAbility";

import { collection, query, getDocs, where } from 'firebase/firestore';

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
import TrackStandard from './Pages/Standards/TrackStandard';

function App() {

  // THEME MANAGEMENT
  const getStoredTheme = () => localStorage.getItem('theme')
  
  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  }

  setTheme(getPreferredTheme());

  // USER / ABILITY MANAGEMENT
  const [userProfile, setUserProfile] = useState(null);

  auth.onAuthStateChanged((user) => {
    if (user) {
      if (!userProfile) {
        const tutorsRef = collection(db, "tutors");
        const q = query(tutorsRef, where("email", "==", user.email));
        getDocs(q).then((res) => {
          if (res.docs.length > 0)
            setUserProfile(res.docs[0]);
        });
      }
    } else {
    }
  })

  const [toast, setToast] = useState({header: '', message: ''});

  return (
    <AbilityContext.Provider value={defineAbilityFor(userProfile)}>
      <ToastContext.Provider value={setToast}>
        <Router>
          <Navbar userProfile={userProfile} />
          <Routes>
            <Route path="/login" element={<Login userProfile={userProfile} setUserProfile={setUserProfile} />} />

            <Route path='/evals' element={<Evals />} />
            <Route path='/eval/new' element={<NewEval />} />
            <Route path='/eval/new/:studentid' element={<NewStudentEval />} />
            <Route path='/eval/:evalid' element={<StudentEval />} />
            <Route path='/evals/:studentid' element={<StudentEvalsList />} />
            <Route path='/eval/edit/:evalid' element={<StudentEvalEdit />} />
            <Route path='/eval/query' element={<EvalQuery />} />

            <Route path="/newstudent" element={<NewStudentPage />} />
            <Route path="/students" element={<StudentProfilesList />} />
            <Route path="/student/:studentid" element={<StudentProfile />} />
            <Route path="student/edit/:studentid" element={<StudentProfileEdit />} />

            <Route path="/newtutor" element={<NewTutorPage />} />
            <Route path="/tutors" element={<TutorProfilesList />} />
            <Route path="/tutor/:tutorid" element={<TutorProfile />} />
            <Route path="/tutor/edit/:tutorid" element={<TutorProfileEdit />} />

            <Route path="/standards" element={<StandardsList />} />
            <Route path="/standard/new/:studentid" element={<TrackStandard />} />
          </Routes>
        </Router>
        <DocSubmissionToast toast={toast} />
      </ToastContext.Provider>
    </AbilityContext.Provider>
  );
}

export default App;
