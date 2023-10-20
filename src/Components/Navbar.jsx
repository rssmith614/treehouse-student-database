import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";


const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (userProfile)
      setUserName(userProfile.data().displayName);
    else
      setUserName('');
  }, [userProfile])

  if (pathname === '/login')
    return <></>;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button className="btn btn-link navbar-brand" data-bs-toggle="dropdown" aria-expanded="false">Welcome, {userName}</button>  
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav d-flex">
            <button className="nav-link"
              onClick={() => navigate('/students')} style={{ cursor: "pointer" }}>Students</button>
            <Can I="read" on="Tutor">
              <button className="nav-link"
                onClick={() => navigate('/tutors')} style={{ cursor: "pointer" }}>Tutors</button>
            </Can>
            <button className="nav-link"
              onClick={() => navigate(`/evals`)}>Evaluations</button>
            <button className="nav-link"
              onClick={() => navigate(`/eval/new`)}>New Session Evaluation</button>
            <div className="nav-item dropdown">
              <button className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Options</button>
              <div className="dropdown-menu">
                <div><button className="dropdown-item" onClick={() => {navigate(`/tutor/${userProfile.id}`)}}>View Tutor Profile</button></div>
                <div><button className="dropdown-item" onClick={() => signOut(auth).then(navigate('/login'))}>Log Out</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;