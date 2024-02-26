import { Button, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RecentStudents = ({ recentStudents }) => {
  const navigate = useNavigate();

  return (
    <Card className='bg-light-subtle m-3 mw-0'>
      <Card.Header>
        <div className='h3 pt-1'>New Evaluation - Recent Students</div>
      </Card.Header>
      <Card.Body>
        <Container className='d-flex justify-content-center'>
          {recentStudents.length === 0 ? (
            <div className='d-flex flex-column'>
              <p className='h5'>No recent students</p>
              <Button onClick={() => navigate("/eval/new")}>
                Find a Student
              </Button>
            </div>
          ) : (
            <div className='d-flex flex-column flex-fill'>
              <ul className='list-group flex-fill mb-3'>
                {recentStudents.map((student, index) => (
                  <li
                    key={index}
                    className='list-group-item list-group-item-action d-flex'
                  >
                    <Button
                      className='flex-fill'
                      onClick={() => navigate(`/eval/new/${student.id}`)}
                      size='lg'
                      variant=''
                    >
                      {student.name}
                    </Button>
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate("/eval/new")}>
                Find another Student
              </Button>
            </div>
          )}
        </Container>
      </Card.Body>
    </Card>
  );
};

export default RecentStudents;
