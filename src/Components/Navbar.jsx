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
  Collapse,
} from "react-bootstrap";

// import treehouseLogo from "../images/Treehouse-Logo-New.svg";
// import blueTreehouseLogo from "../images/Treehouse-Logo-New-Blue.svg";

const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState("");

  const [shownSubMenu, setShownSubMenu] = useState("");

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
    <BsNavbar className='bg-body-tertiary flex-column vh-100'>
      <Container fluid>
        <BsNavbar.Brand
          aria-expanded='false'
          className='text-wrap'
          onClick={() => navigate(`/tutor/${userProfile.id}`)}
          style={{ cursor: "pointer" }}
        >
          Welcome, {userName}
        </BsNavbar.Brand>
      </Container>
      <BsNavbar.Toggle
        aria-controls='navbarNavAltMarkup'
        aria-expanded='false'
        aria-label='Toggle navigation'
      />
      <BsNavbar.Collapse
        id='navbarNavAltMarkup'
        className='flex-column justify-content-start w-100'
      >
        <Nav className='flex-column w-100'>
          <Nav.Link
            onClick={() => navigate("/students")}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-people-fill pe-1 fs-4' />
            <span>Students</span>
          </Nav.Link>

          <Can I='read' on='Tutor'>
            <Nav.Link
              onClick={() => navigate("/tutors")}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-person-lines-fill pe-1 fs-4' />
              Tutors
            </Nav.Link>
          </Can>

          {/* <NavDropdown title='Evaluations'>
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
            </NavDropdown> */}

          <Nav.Link
            onClick={() =>
              setShownSubMenu(
                shownSubMenu === "evaluations" ? "" : "evaluations",
              )
            }
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-journal-text pe-1 fs-4' />
            Evaluations
            <i
              className={`bi bi-caret-${shownSubMenu === "evaluations" ? "up" : "down"}-fill float-end`}
            />
          </Nav.Link>
          <Collapse
            in={shownSubMenu === "evaluations"}
            className='bg-light-subtle'
          >
            <div>
              <Nav.Link
                onClick={() => navigate(`/evals`)}
                style={{ cursor: "pointer" }}
              >
                <i className='bi bi-journal-text pe-1 fs-6' />
                Past Evaluations
              </Nav.Link>
              <Nav.Link
                onClick={() => navigate(`/eval/new`)}
                style={{ cursor: "pointer" }}
              >
                <i className='bi bi-journal-plus pe-1 fs-6' />
                New Session Evaluation
              </Nav.Link>
              <Can I='query' on='evals'>
                <Nav.Link
                  onClick={() => navigate(`/eval/query`)}
                  style={{ cursor: "pointer" }}
                >
                  <i className='bi bi-search pe-1 fs-6' />
                  Find Evals
                </Nav.Link>
              </Can>
              <Can I='review' on='evals'>
                <Nav.Link
                  onClick={() => navigate(`/evals/review`)}
                  style={{ cursor: "pointer" }}
                >
                  <i className='bi bi-journal-check pe-1 fs-6' />
                  Review Evals
                </Nav.Link>
              </Can>
            </div>
          </Collapse>

          <Nav.Link
            onClick={() => navigate("/standards")}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-card-list pe-1 fs-4' />
            Standards
          </Nav.Link>

          <Can I='manage' on='assessments'>
            <Nav.Link
              onClick={() => navigate("/assessments")}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-clipboard-data pe-1 fs-4' />
              Assessments
            </Nav.Link>
          </Can>

          {/* <NavDropdown title='Options'>
              <NavDropdown.Item
                onClick={() => navigate(`/tutor/${userProfile.id}`)}
              >
                View Tutor Profile
              </NavDropdown.Item>
              <NavDropdown.Item
                onClick={() => {
                  signOut(auth);
                  navigate("/login");
                }}
              >
                Log Out
              </NavDropdown.Item>
            </NavDropdown> */}
          <Nav.Link
            onClick={() =>
              setShownSubMenu(shownSubMenu === "options" ? "" : "options")
            }
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-gear-fill pe-1 fs-4' />
            Options
            <i
              className={`bi bi-caret-${shownSubMenu === "options" ? "up" : "down"}-fill float-end`}
            />
          </Nav.Link>
          <Collapse in={shownSubMenu === "options"} className='bg-light-subtle'>
            <div>
              <Nav.Link
                onClick={() => navigate(`/tutor/${userProfile.id}`)}
                style={{ cursor: "pointer" }}
              >
                View Tutor Profile
              </Nav.Link>
              <Nav.Link
                onClick={() => {
                  signOut(auth);
                  navigate("/login");
                }}
                style={{ cursor: "pointer" }}
              >
                Log Out
              </Nav.Link>
            </div>
          </Collapse>
        </Nav>
      </BsNavbar.Collapse>
    </BsNavbar>
  );
};

export default Navbar;
