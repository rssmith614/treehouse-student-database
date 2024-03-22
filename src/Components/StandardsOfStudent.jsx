import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  OverlayTrigger,
  Popover,
  Row,
} from "react-bootstrap";
import { db } from "../Services/firebase";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(duration);
dayjs.extend(relativeTime);

const statuses = {
  None: "Not Yet Tracked",
  1: "1 - Far Below Expectations",
  2: "2 - Below Expectations",
  3: "3 - Meets Expectations",
  4: "4 - Exceeds Expectations",
};

const grades = {
  K: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
};

const StandardsOfStudent = ({
  student,
  setSelectedStandard,
  filter,
  progressFilter,
}) => {
  const [standards, setStandards] = useState([]);
  const [groupedStandards, setGroupedStandards] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeStandards = onSnapshot(
      collection(student, "standards"),
      (res) => {
        setStandards(res.docs);
        setLoading(false);
      },
    );

    return () => unsubscribeStandards();
  }, [student]);

  useEffect(() => {
    let groups = {};
    Promise.all(
      standards.map(async (s) => {
        return getDoc(doc(db, "standards", s.id)).then((standard) => {
          if (
            !(
              standard
                .data()
                .category?.toLowerCase()
                .includes(filter?.toLowerCase()) ||
              standard
                .data()
                .key?.toLowerCase()
                .includes(filter?.toLowerCase()) ||
              standard
                .data()
                .sub_category?.toLowerCase()
                .includes(filter?.toLowerCase()) ||
              standard
                .data()
                .description?.toLowerCase()
                .includes(filter?.toLowerCase())
            )
          )
            return;

          if (!progressFilter[s.data().status]) return;

          let group = `${grades[standard.data().grade]} - ${
            standard.data().sub_category
          }`;
          if (groups[group]) {
            groups[group].push({
              ...s.data(),
              ...standard.data(),
              id: standard.id,
            });
          } else {
            groups[group] = [
              { ...s.data(), ...standard.data(), id: standard.id },
            ];
          }
        });
      }),
    ).then(() => {
      setGroupedStandards(groups);
    });
  }, [filter, standards, progressFilter]);

  function color(standard) {
    let res = "";
    if (dayjs().diff(dayjs.unix(standard.timestamp.seconds), "month") > 0)
      res += "text-decoration-line-through ";

    switch (standard.status) {
      case "1":
        res += "link-danger";
      case "2":
        res += "link-warning";
      case "3":
        res += "link-primary";
      case "4":
        res += "link-success";
      default:
        res += "link-body-emphasis";
    }

    return res;
  }

  if (loading)
    return (
      <>
        <Card className='p-3 my-3 mw-0 placeholder-wave'>
          <div className='h4 placeholder m-3 col-2 bg-primary' />
          <Container>
            <Row xs={{ cols: "auto" }}>
              {[...Array(5).fill(0)].map((_, index) => (
                <div className='placeholder m-3 col-1' key={index} />
              ))}
            </Row>
          </Container>
        </Card>
        <Card className='p-3 my-3 mw-0 placeholder-wave'>
          <div className='h4 placeholder m-3 col-2 bg-primary' />
          <Container>
            <Row xs={{ cols: "auto" }}>
              {[...Array(12).fill(0)].map((_, index) => (
                <div className='placeholder m-3 col-1' key={index} />
              ))}
            </Row>
          </Container>
        </Card>
      </>
    );

  return Object.entries(groupedStandards)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((group, i) => {
      if (group[1].length === 0) return null;

      return (
        <Card className='p-3 my-3' key={i}>
          <Button
            variant='link'
            className='me-auto link-underline link-underline-opacity-0'
            style={{ cursor: "default" }}
          >
            <h5>{group[0]}</h5>
          </Button>

          <Container>
            <Row xs={{ cols: "auto" }}>
              {group[1]
                .sort((a, b) => {
                  return (
                    a.key.split(".")[1].localeCompare(b.key.split(".")[1]) ||
                    a.key.split(".")[2] - b.key.split(".")[2] ||
                    a.key.split(".")[2].localeCompare(b.key.split(".")[2]) ||
                    a.key.localeCompare(b.key)
                  );
                })
                .map((standard, i) => {
                  return (
                    <Col key={i}>
                      <OverlayTrigger
                        placement='right'
                        flip={true}
                        overlay={
                          <Popover className=''>
                            <Popover.Header>{standard.key}</Popover.Header>
                            <Popover.Body>
                              <div className='text-decoration-underline'>
                                Description
                              </div>
                              {standard.description}
                              <hr />
                              <div className='text-decoration-underline'>
                                Progression
                              </div>
                              {statuses[standard.status]}
                              {dayjs().diff(
                                dayjs.unix(standard.timestamp?.seconds || 0),
                                "month",
                              ) > 0 ? (
                                <>
                                  <hr />
                                  Last updated{" "}
                                  {dayjs
                                    .duration(
                                      dayjs().diff(
                                        dayjs.unix(standard.timestamp?.seconds),
                                      ),
                                    )
                                    .humanize()}{" "}
                                  ago
                                </>
                              ) : (
                                <></>
                              )}
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <button
                          className={`btn btn-link ${color(standard)}
                          link-underline-opacity-0 link-underline-opacity-75-hover`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedStandard(standard)}
                        >
                          {standard.key}
                        </button>
                      </OverlayTrigger>
                    </Col>
                  );
                })}
            </Row>
          </Container>
        </Card>
      );
    });
};

export default StandardsOfStudent;
