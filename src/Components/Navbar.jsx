import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";
import { Navbar as BsNavbar, Nav, Button, Collapse } from "react-bootstrap";

import treehouseLogo from "../images/Treehouse-Logo-New.svg";
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
    <BsNavbar className='bg-body-tertiary flex-column vh-100 sticky-top'>
      <BsNavbar.Brand
        aria-expanded='false'
        className='ps-3 d-flex'
        onClick={() => navigate(`/tutor/${userProfile.id}`)}
        style={{ cursor: "pointer" }}
      >
        <span className='text-wrap'>Welcome, {userName}</span>
        <img
          src={treehouseLogo}
          alt='Treehouse Logo'
          className='d-inline-block align-text-top ms-auto p-3'
          style={{ height: 100 }}
        />
      </BsNavbar.Brand>
      <Nav className='flex-column w-100 px-3'>
        <Nav.Link
          onClick={() => navigate("/students")}
          style={{ cursor: "pointer" }}
        >
          <i className='bi bi-people-fill pe-2 fs-4' />
          <span>Students</span>
        </Nav.Link>

        <Can I='read' on='Tutor'>
          <Nav.Link
            className='d-flex align-items-center'
            onClick={() => navigate("/tutors")}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-person-lines-fill pe-2 fs-4' />
            Tutors
          </Nav.Link>
        </Can>

        <Nav.Link
          className='d-flex align-items-center'
          onClick={() =>
            setShownSubMenu(shownSubMenu === "evals" ? "" : "evals")
          }
          style={{ cursor: "pointer" }}
        >
          <i className='bi bi-journal-text pe-2 fs-4' />
          Evaluations
          <i
            className={`bi bi-caret-${shownSubMenu === "evals" ? "up" : "down"}-fill ps-2 fs-6`}
          />
        </Nav.Link>
        <Collapse in={shownSubMenu === "evals"}>
          <div className='bg-light-subtle'>
            <Nav.Link
              onClick={() => navigate(`/evals`)}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-journal-text pe-2 ps-4 fs-6' />
              Past Evaluations
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate(`/eval/new`)}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-journal-plus pe-2 ps-4 fs-6' />
              New Evaluation
            </Nav.Link>
            <Can I='query' on='evals'>
              <Nav.Link
                onClick={() => navigate(`/eval/query`)}
                style={{ cursor: "pointer" }}
              >
                <i className='bi bi-search pe-2 ps-4 fs-6' />
                Query Evals
              </Nav.Link>
            </Can>
            <Can I='review' on='evals'>
              <Nav.Link
                onClick={() => navigate(`/evals/review`)}
                style={{ cursor: "pointer" }}
              >
                <i className='bi bi-journal-check pe-2 ps-4 fs-6' />
                Pending Review
              </Nav.Link>
            </Can>
          </div>
        </Collapse>

        <Nav.Link
          className='d-flex align-items-center'
          onClick={() => navigate("/standards")}
          style={{ cursor: "pointer" }}
        >
          <i className='bi bi-card-list pe-2 fs-4' />
          Standards
        </Nav.Link>

        <Can I='manage' on='assessments'>
          <Nav.Link
            className='d-flex align-items-center'
            onClick={() => navigate("/assessments")}
            style={{ cursor: "pointer" }}
          >
            <i className='bi bi-clipboard-data pe-2 fs-4' />
            Assessments
          </Nav.Link>
        </Can>

        <Nav.Link
          className='d-flex align-items-center'
          onClick={() =>
            setShownSubMenu(shownSubMenu === "options" ? "" : "options")
          }
          style={{ cursor: "pointer" }}
        >
          <i className='bi bi-gear-fill pe-2 fs-4' />
          Options
          <i
            className={`bi bi-caret-${shownSubMenu === "options" ? "up" : "down"}-fill ps-2 fs-6`}
          />
        </Nav.Link>
        <Collapse in={shownSubMenu === "options"}>
          <div className='bg-light-subtle'>
            <Nav.Link
              onClick={() => navigate(`/tutor/${userProfile.id}`)}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-person-circle pe-2 ps-4 fs-6' />
              Profile
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                signOut(auth);
                navigate("/login");
              }}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-box-arrow-right pe-2 ps-4 fs-6' />
              Logout
            </Nav.Link>
          </div>
        </Collapse>
      </Nav>
    </BsNavbar>
  );
};

export default Navbar;
