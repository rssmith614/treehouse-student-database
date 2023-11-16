import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { db } from "../Services/firebase";


const statuses = {
  '1': '1 - Far Below Expectations',
  '2': '2 - Below Expectations',
  '3': '3 - Meets Expectations',
  '4': '4 - Exceeds Expectations'
}

const StandardsOfStudent = ({ standards, setSelectedStandard }) => {

  const [standardsDocs, setStandardsDocs] = useState(null);

  useEffect(() => {
    Promise.all(standards.map(async (s) => {
      return {
        ...(await getDocs(query(collection(db, 'standards'), where('key', '==', s.key)))).docs[0].data(),
        status: s.status
      }
    })).then(res => setStandardsDocs(res))

  }, [standards])

  const standardsList = () => {
    if (!standardsDocs)
      return <></>
    
    return standardsDocs.sort((a, b) => {
      return (
        a.key.split('.')[0].localeCompare(b.key.split('.')[0]) ||
        a.key.split('.')[1].localeCompare(b.key.split('.')[1]) ||
        a.key.split('.')[2].localeCompare(b.key.split('.')[2]) ||
        a.key.localeCompare(b.key)
      )
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