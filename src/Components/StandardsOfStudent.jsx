import { Table } from "react-bootstrap";


const StandardsOfStudent = ({ standards, setSelectedStandard }) => {

  const standardsList = () => {
    return standards.map((s, i) => {
      return (
        <tr key={i}
          onClick={() => setSelectedStandard(s)}>
          <td>{s.key}</td>
          <td>{s.status}</td>
          <td>{s.description}</td>
          <td>{`${s.category}: ${s.sub_category}`}</td>
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
          <th>Description</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {standardsList()}
      </tbody>
    </Table>
  )
}

export default StandardsOfStudent;