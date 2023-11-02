import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";
import { Container, Dropdown, Navbar as BsNavbar, Nav, NavDropdown } from "react-bootstrap";


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
    <BsNavbar className="bg-body-tertiary" expand="lg">
      <Container fluid>
        <BsNavbar.Brand aria-expanded="false">Welcome, {userName}</BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation" />
        <BsNavbar.Collapse id="navbarNavAltMarkup">
          <Nav>
            <Nav.Link
              onClick={() => navigate('/students')} style={{ cursor: "pointer" }}>Students</Nav.Link>

            <Can I="read" on="Tutor">
              <Nav.Link
                onClick={() => navigate('/tutors')} style={{ cursor: "pointer" }}>Tutors</Nav.Link>
            </Can>

            <NavDropdown title="Evaluations">
              <NavDropdown.Item onClick={() => navigate(`/evals`)}>Past Evaluations</NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate(`/eval/new`)}>New Session Evaluation</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Options">
              <NavDropdown.Item onClick={() => navigate(`/tutor/${userProfile.id}`)}>View Tutor Profile</NavDropdown.Item>
              <NavDropdown.Item onClick={() => signOut(auth).then(navigate('/login'))}>Log Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}

export default Navbar;