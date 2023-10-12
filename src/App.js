import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { Route, Routes, Params } from 'react-router-dom';

import NewProfile from './Pages/NewStudentPage';
import StudentEval from './Pages/StudentEval';
import StudentProfile from './Pages/StudentProfile';
import StudentProfilesList from './Pages/StudentProfilesList';
import StudentProfileEdit from './Pages/StudentProfileEdit';

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

  return (
    <Router>
      <Routes>
        <Route path="/newstudent" element={<NewProfile />} />
        <Route path='/eval/new/:studentid' element={<StudentEval />} />
        <Route path="/students" element={<StudentProfilesList />} />
        <Route path="/student/:studentid" element={<StudentProfile />} />
        <Route path="student/edit/:studentid" element={<StudentProfileEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
