import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../Services/firebase";

const ParentProfilesList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const parentCollRef = collection(db, "parents");

    const unsubscribeParents = onSnapshot(parentCollRef, (snapshot) => {
      setParents(snapshot.docs);
      setLoading(false);
    });

    return () => {
      unsubscribeParents();
    };
  }, []);

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const pendingTable = (
    <Table striped>
      <thead>
        <tr>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {parents
          .filter((parent) => {
            return parent.data().clearance === "pending";
          })
          .map((parent) => {
            return (
              <tr
                key={parent.id}
                onClick={() => navigate(`/parent/${parent.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{parent.data().email}</td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );

  const loadingTable = (
    <div className='placeholder-wave'>
      <Table striped>
        <thead>
          <tr>
            <th className='placeholder w-100' style={{ height: "3rem" }}></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i}>
              <td
                className='placeholder w-100 placeholder-lg'
                style={{ height: "4.8rem" }}
              />
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className='d-flex flex-column m-3'>
      <div className='d-flex display-1'>Parents</div>
      <div className='d-flex card pt-3 px-3 bg-light-subtle'>
        {loading ? (
          loadingTable
        ) : (
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Clearance</th>
              </tr>
            </thead>
            <tbody>
              {parents
                .filter((parent) => {
                  return parent.data().clearance !== "pending";
                })
                .map((parent) => {
                  return (
                    <tr
                      key={parent.id}
                      onClick={() => navigate(`/parent/${parent.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{parent.data().displayName}</td>
                      <td>{parent.data().email}</td>
                      <td>{capitalize(parent.data().clearance)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        )}
      </div>
      <div className='d-flex'>
        <Button
          onClick={() => navigate("/parent/new")}
          className='ms-auto mt-3'
        >
          Add Parent
        </Button>
      </div>
      {parents.filter((parent) => {
        return parent.data().clearance === "pending";
      }).length === 0 ? (
        <></>
      ) : (
        <>
          <hr />
          <div>
            <div className='d-flex display-1'>Pending Parent Accounts</div>
            <Card className='d-flex pt-3 px-3 bg-light-subtle'>
              {pendingTable}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentProfilesList;
