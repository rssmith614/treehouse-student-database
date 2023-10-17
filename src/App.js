import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes, Redirect } from 'react-router-dom';

import NewProfile from './Pages/NewStudentPage';
import StudentEval from './Pages/StudentEval';
import StudentProfile from './Pages/StudentProfile';
import StudentProfilesList from './Pages/StudentProfilesList';
import StudentProfileEdit from './Pages/StudentProfileEdit';
import Login from './Pages/Login';
import TutorProfilesList from './Pages/TutorProfilesList';

import Navbar from './Components/Navbar';

import { AbilityContext } from './Services/can';
import defineAbilityFor from "./Services/defineAbility";

import { collection, query, getDocs, where } from 'firebase/firestore';

import { auth, db } from './Services/firebase';
import { useState } from 'react';
import NewTutorPage from './Pages/NewTutorPage';

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
            setUserProfile(res.docs[0].data());
        });
      }
    } else {
    }
  })

  return (
    <AbilityContext.Provider value={defineAbilityFor(userProfile)}>
      <Router>
        <Navbar userProfile={userProfile} />
        <Routes>
          <Route path="/login" element={<Login userProfile={userProfile} setUserProfile={setUserProfile} />} />

          <Route path='/eval/new/:studentid' element={<StudentEval />} />

          <Route path="/newstudent" element={<NewProfile />} />
          <Route path="/students" element={<StudentProfilesList />} />
          <Route path="/student/:studentid" element={<StudentProfile />} />
          <Route path="student/edit/:studentid" element={<StudentProfileEdit />} />

          <Route path="/newtutor" element={<NewTutorPage />} />
          <Route path="/tutors" element={<TutorProfilesList />} />
        </Routes>
      </Router>
    </AbilityContext.Provider>
  );
}

export default App;
