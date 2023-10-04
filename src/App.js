import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { Route, Routes, Params } from 'react-router-dom';

import NewProfile from './Pages/NewStudentPage';
import StudentEval from './Pages/StudentEval';
import StudentProfile from './Pages/StudentProfile';
import StudentProfilesList from './Pages/StudentProfilesList';

function App() {
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

  let temp = {
    student_name: "Student A",
    tutor_name: "Robert",
    date: "",
    subject: "",
    standard: "",
    grade: 4,
    progression_standard: "",
    comments: "",
    engagement: "",
    worksheet: "",
    completion: "",
    next_session: "",
  }

  return (
    <Router>
      <Routes>
        <Route path="/newstudent" element={<NewProfile />} />
        {/* <Route path='/' element={<StudentEval eval={temp}/>} /> */}
        <Route path="/students" element={<StudentProfilesList />} />
        <Route path="/student/:studentid" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
