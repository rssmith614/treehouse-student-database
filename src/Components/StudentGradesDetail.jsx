import dayjs from "dayjs";
import { Button, Card, Table } from "react-bootstrap";

const StudentGradesDetail = ({ gradeEntry, setEdit }) => {
  return (
    <div>
      <div className='d-flex mb-3 row'>
        <div className='d-flex flex-column col'>
          <h5>Date Recorded</h5>
          <p>{dayjs(gradeEntry.date).format("MMMM DD, YYYY")}</p>
        </div>
        <div className='d-flex flex-column ms-3 col'>
          <h5>Recorded By</h5>
          <p>{gradeEntry.tutor_name}</p>
        </div>
      </div>
      <div className='mb-3'>
        <Card className='bg-light-subtle'>
          <Card.Body>
            <Card.Title>Grades</Card.Title>
            <Table striped>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {(gradeEntry.grades ?? []).map((grade, index) => {
                  return (
                    <tr key={index}>
                      <td className='align-middle'>
                        <p>{grade.subject}</p>
                      </td>
                      <td className='align-middle'>
                        <p>{grade.grade}</p>
                      </td>
                      <td>
                        <p>{grade.comments}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
      <div className='d-flex'>
        <Button
          variant='info'
          className='ms-auto'
          onClick={() => {
            setEdit(true);
          }}
        >
          Make Changes to this Record
        </Button>
      </div>
    </div>
  );
};

export default StudentGradesDetail;
