import { Table } from "react-bootstrap";


const statuses = {
  '1': '1 - Far Below Expectations',
  '2': '2 - Below Expectations',
  '3': '3 - Meets Expectations',
  '4': '4 - Exceeds Expectations'
}

const StandardsOfStudent = ({ standards, setSelectedStandard }) => {

  const standardsList = () => {
    return standards.sort((a, b) => {
      return a.key.split('.')[1].localeCompare(b.key.split('.')[1]) || a.key.split('.')[2] - b.key.split('.')[2] || a.key.localeCompare(b.key)
    }).map((s, i) => {
      return (
        <tr key={i} style={{ cursor: 'pointer' }}
          onClick={() => setSelectedStandard(s)}>
          <td>{s.key}</td>
          <td>{statuses[s.status]}</td>
          <td>{`${s.category}: ${s.sub_category}`}</td>
          <td>{s.description}</td>
        </tr>
      )
    })
  }

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th>Standard Name</th>
          <th>Status</th>
          <th>Category</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {standardsList()}
      </tbody>
    </Table>
  )
}

export default StandardsOfStudent;