import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";
import { Navbar as BsNavbar, Nav, Dropdown } from "react-bootstrap";

import treehouseLogo from "../images/Treehouse-Logo-New.svg";
// import blueTreehouseLogo from "../images/Treehouse-Logo-New-Blue.svg";

const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState("");

  const [shownSubMenu, setShownSubMenu] = useState("");

  const [expanded, setExpanded] = useState(false);

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
    <BsNavbar
      className='bg-body-tertiary'
      sticky='top'
      expand='lg'
      expanded={expanded}
    >
      <BsNavbar.Brand
        aria-expanded='false'
        className='text-wrap ps-3'
        onClick={() => {
          setExpanded(false);
          navigate(`/tutor/${userProfile.id}`);
        }}
        style={{ cursor: "pointer" }}
      >
        Welcome, {userName}
      </BsNavbar.Brand>
      <BsNavbar.Toggle
        aria-controls='navbarNavAltMarkup'
        aria-expanded='false'
        aria-label='Toggle navigation'
        onClick={() => setExpanded(!expanded)}
      />
      <BsNavbar.Collapse
        id='navbarNavAltMarkup'
        className='justify-content-start'
      >
        <Nav className='px-3'>
          <Nav.Link
            className='d-flex align-items-center'
            onClick={() => {
              setExpanded(false);
              navigate("/students");
            }}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-people-fill pe-2 fs-4' />
            Students
          </Nav.Link>

          <Can I='read' on='Tutor'>
            <Nav.Link
              className='d-flex align-items-center'
              onClick={() => {
                setExpanded(false);
                navigate("/tutors");
              }}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-person-lines-fill pe-2 fs-4' />
              Tutors
            </Nav.Link>
          </Can>

          <Dropdown
            show={shownSubMenu === "evals"}
            onToggle={(e) => setShownSubMenu(e ? "evals" : "")}
          >
            <Dropdown.Toggle
              as={Nav.Link}
              className='d-flex align-items-center'
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-journal-text pe-2 fs-4' />
              Evaluations
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setExpanded(false);
                  navigate("/evals");
                }}
                className='d-flex'
              >
                <i className='bi bi-journal-text pe-2 fs-6' />
                <span className='align-self-center'>Past Evaluations</span>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setExpanded(false);
                  navigate("/eval/new");
                }}
                className='d-flex'
              >
                <i className='bi bi-journal-plus pe-2 fs-6' />
                <span className='align-self-center'>New Evaluation</span>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setExpanded(false);
                  navigate("/evals/drafts");
                }}
                className='d-flex'
              >
                <i className='bi bi-journal-x pe-2 fs-6' />
                <span className='align-self-center'>Drafts</span>
              </Dropdown.Item>
              <Can I='query' on='evals'>
                <Dropdown.Item
                  onClick={() => {
                    setExpanded(false);
                    navigate("/eval/query");
                  }}
                  className='d-flex'
                >
                  <i className='bi bi-search pe-2 fs-6' />
                  <span className='align-self-center'>Query Evals</span>
                </Dropdown.Item>
              </Can>
              <Can I='review' on='evals'>
                <Dropdown.Item
                  onClick={() => {
                    setExpanded(false);
                    navigate("/evals/review");
                  }}
                  className='d-flex'
                >
                  <i className='bi bi-journal-check pe-2 fs-6' />
                  <span className='align-self-center'>Pending Review</span>
                </Dropdown.Item>
              </Can>
            </Dropdown.Menu>
          </Dropdown>

          <Nav.Link
            className='d-flex align-items-center'
            onClick={() => {
              setExpanded(false);
              navigate("/standards");
            }}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-card-list pe-2 fs-4' />
            Standards
          </Nav.Link>

          <Can I='manage' on='assessments'>
            <Nav.Link
              className='d-flex align-items-center'
              onClick={() => {
                setExpanded(false);
                navigate("/assessments");
              }}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-clipboard-data pe-2 fs-4' />
              Assessments
            </Nav.Link>
          </Can>

          <Dropdown
            show={shownSubMenu === "options"}
            onToggle={(e) => setShownSubMenu(e ? "options" : "")}
          >
            <Dropdown.Toggle
              as={Nav.Link}
              className='d-flex align-items-center'
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-gear-fill pe-2 fs-4' />
              Options
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setExpanded(false);
                  navigate(`/tutor/${userProfile.id}`);
                }}
                className='d-flex'
              >
                <i className='bi bi-person-circle pe-2 fs-6' />
                <span className='align-self-center'>Profile</span>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  signOut(auth);
                  navigate("/login");
                }}
                className='d-flex'
              >
                <i className='bi bi-box-arrow-right pe-2 fs-6' />
                <span className='align-self-center'>Logout</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </BsNavbar.Collapse>
    </BsNavbar>
  );
};

export default Navbar;
