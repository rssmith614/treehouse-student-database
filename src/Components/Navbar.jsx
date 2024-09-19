import { signOut } from "firebase/auth";
import { auth } from "../Services/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { Can } from "../Services/can";
import { useEffect, useState } from "react";
import { Navbar as BsNavbar, Nav, Dropdown } from "react-bootstrap";
import MediaQuery from "react-responsive";
import { Parent, Student } from "../Services/defineAbility";

// import treehouseLogo from "../images/Treehouse-Logo-New.svg";
// import blueTreehouseLogo from "../images/Treehouse-Logo-New-Blue.svg";

const Navbar = ({ userProfile }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [userName, setUserName] = useState("");

  const [profileType, setProfileType] = useState("tutor");

  const [shownSubMenu, setShownSubMenu] = useState("");

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (userProfile) setUserName(userProfile.data().displayName);
    else {
      setUserName("");
    }
  }, [userProfile]);

  useEffect(() => {
    if (!auth.currentUser && pathname !== "/login") {
      navigate("/login", { state: { from: pathname } });
    } else {
      if (userProfile?.data().clearance === "admin") {
        setProfileType("admin");
      } else if (userProfile?.data().clearance === "tutor") {
        setProfileType("tutor");
      } else {
        setProfileType("parent");
      }
    }
  }, [navigate, userProfile, pathname]);

  if (pathname === "/login") return <></>;

  return (
    <BsNavbar
      className='bg-body-tertiary'
      sticky='top'
      expand='lg'
      expanded={expanded}
      style={{
        background: `repeating-linear-gradient(
        135deg,
        #000,
        #000 10px,
        #666600 10px,
        #666600 20px
      )`,
      }}
    >
      <BsNavbar.Brand
        aria-expanded='false'
        className='text-wrap ps-3'
        onClick={() => {
          setExpanded(false);
          if (profileType === "tutor" || profileType === "admin")
            navigate(`/tutor/${userProfile.id}`);
          else navigate("/students");
        }}
        style={{ cursor: "pointer" }}
      >
        Welcome, {userName}
        <br />
        <span className='text-danger bg-primary'>Test Site</span>
      </BsNavbar.Brand>
      <BsNavbar.Toggle
        aria-controls='navbarNavAltMarkup'
        aria-expanded='false'
        aria-label='Toggle navigation'
        className='me-3'
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

          <Can I='read' on={Parent}>
            <Nav.Link
              className='d-flex align-items-center'
              onClick={() => {
                setExpanded(false);
                navigate("/parents");
              }}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-person-fill pe-2 fs-4' />
              Parents
            </Nav.Link>
          </Can>

          <Can I='read' on={Student}>
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
          </Can>

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

          <MediaQuery minWidth={992}>
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
          </MediaQuery>

          {profileType === "admin" || profileType === "tutor" ? (
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
          ) : (
            <Nav.Link
              className='d-flex align-items-center'
              onClick={() => {
                signOut(auth);
                navigate("/login");
              }}
              style={{ cursor: "pointer" }}
            >
              <i className='bi bi-box-arrow-right pe-2 fs-4' />
              Log Out
            </Nav.Link>
          )}
        </Nav>
      </BsNavbar.Collapse>
    </BsNavbar>
  );
};

export default Navbar;
