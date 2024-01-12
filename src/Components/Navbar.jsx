import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";
import {
  Container,
  Navbar as BsNavbar,
  Nav,
  NavDropdown,
} from "react-bootstrap";

import treehouseLogo from "../images/Treehouse-Logo-New.svg";
import blueTreehouseLogo from "../images/Treehouse-Logo-New-Blue.svg";

const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (userProfile) setUserName(userProfile.data().displayName);
    else {
      setUserName("");
    }
  }, [userProfile]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  if (pathname === "/login") return <></>;

  return (
    <BsNavbar className='bg-body-tertiary sticky-top' expand='lg'>
      <Container fluid>
        <BsNavbar.Brand
          aria-expanded='false'
          onClick={() => navigate(`/tutor/${userProfile.id}`)}
          style={{ cursor: "pointer" }}
        >
          {/* {document.documentElement.getAttribute("data-bs-theme") === "dark" ? (
            <img
              src={treehouseLogo}
              alt='Treehouse Logo'
              className='d-inline-block align-text-top'
              style={{ height: 24 }}
            />
          ) : (
            <img
              src={blueTreehouseLogo}
              alt='Treehouse Logo'
              className='d-inline-block align-text-top'
              style={{ height: 24 }}
            />
          )} */}
          Welcome, {userName}
        </BsNavbar.Brand>
        <BsNavbar.Toggle
          aria-controls='navbarNavAltMarkup'
          aria-expanded='false'
          aria-label='Toggle navigation'
        />
        <BsNavbar.Collapse id='navbarNavAltMarkup'>
          <Nav>
            <Nav.Link
              onClick={() => navigate("/students")}
              style={{ cursor: "pointer" }}
            >
              Students
            </Nav.Link>

            <Can I='read' on='Tutor'>
              <Nav.Link
                onClick={() => navigate("/tutors")}
                style={{ cursor: "pointer" }}
              >
                Tutors
              </Nav.Link>
            </Can>

            <NavDropdown title='Evaluations'>
              <NavDropdown.Item onClick={() => navigate(`/evals`)}>
                Past Evaluations
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => navigate(`/eval/new`)}>
                New Session Evaluation
              </NavDropdown.Item>
              <Can I='query' on='evals'>
                <NavDropdown.Item onClick={() => navigate(`/eval/query`)}>
                  Find Evals
                </NavDropdown.Item>
              </Can>
              <Can I='review' on='evals'>
                <NavDropdown.Item onClick={() => navigate(`/evals/review`)}>
                  Review Evals
                </NavDropdown.Item>
              </Can>
            </NavDropdown>

            <Nav.Link
              onClick={() => navigate("/standards")}
              style={{ cursor: "pointer" }}
            >
              Standards
            </Nav.Link>

            <Can I='manage' on='assessments'>
              <Nav.Link
                onClick={() => navigate("/assessments")}
                style={{ cursor: "pointer" }}
              >
                Assessments
              </Nav.Link>
            </Can>

            <NavDropdown title='Options'>
              <NavDropdown.Item
                onClick={() => navigate(`/tutor/${userProfile.id}`)}
              >
                View Tutor Profile
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => signOut(auth).then(navigate("/login"))}
              >
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
