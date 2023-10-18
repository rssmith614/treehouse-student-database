import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { AbilityContext, Can } from "../Services/can";
import { useContext, useEffect, useState } from "react";


const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState('');

  const ability = useContext(AbilityContext);

  useEffect(() => {
    if (userProfile)
      setUserName(userProfile.displayName);
    else
      setUserName('');
  }, [userProfile])

  if (pathname === '/login')
    return <></>;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button className="btn btn-link navbar-brand"
          onClick={() => navigate('/students')} style={{ cursor: "pointer" }}>Welcome, {userName}</button>
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
          </div>
          <button className="btn btn-secondary ms-auto align-self-end" onClick={() => signOut(auth).then(navigate('/login'))}>Log Out</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;