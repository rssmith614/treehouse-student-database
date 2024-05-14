import { Button, Card, Col, Form, Row } from "react-bootstrap";

const EmergencyContacts = ({ emergencyContacts, setEmergencyContacts }) => {
  const emergencyContactsList = emergencyContacts.map((contact, index) => {
    return (
      <Col md={3} key={index}>
        <Card className='mb-3'>
          <Card.Header>
            <Card.Title>{contact.name}</Card.Title>
            <Card.Subtitle>{contact.relation}</Card.Subtitle>
          </Card.Header>
          <Card.Body>
            <Card.Text>Phone: {contact.phone}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  const emergencyContactsListEditable = emergencyContacts.map(
    (contact, index) => {
      return (
        <Col md={3} key={index}>
          <Card className='mb-3'>
            <Card.Header className='d-flex'>
              <div className='pe-3'>
                <Card.Title>
                  <Form.Control
                    id={`contact${index}name`}
                    type='text'
                    value={contact.name}
                    onChange={(e) => {
                      const newContacts = [...emergencyContacts];
                      newContacts[index].name = e.target.value;
                      setEmergencyContacts(newContacts);
                    }}
                    placeholder='Name'
                  />
                </Card.Title>
                <Card.Subtitle>
                  <Form.Control
                    id={`contact${index}relation`}
                    type='text'
                    value={contact.relation}
                    onChange={(e) => {
                      const newContacts = [...emergencyContacts];
                      newContacts[index].relation = e.target.value;
                      setEmergencyContacts(newContacts);
                    }}
                    placeholder='Relation'
                  />
                </Card.Subtitle>
              </div>
              <Button
                variant='danger'
                className='ms-auto'
                disabled={emergencyContacts.length === 1}
                onClick={() => {
                  setEmergencyContacts(
                    emergencyContacts.filter((_, i) => i !== index),
                  );
                }}
              >
                <i className='bi bi-trash-fill' />
              </Button>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <Form.Control
                  id={`contact${index}phone`}
                  type='text'
                  value={contact.phone}
                  onChange={(e) => {
                    const newContacts = [...emergencyContacts];
                    newContacts[index].phone = e.target.value;
                    setEmergencyContacts(newContacts);
                  }}
                  placeholder='Phone'
                />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      );
    },
  );

  return (
    <Row className='w-100'>
      {setEmergencyContacts ? (
        <>
          {emergencyContactsListEditable}
          <Col md={3} className='d-flex flex-column justify-content-center'>
            <Button
              variant='primary'
              onClick={() => {
                setEmergencyContacts([
                  ...emergencyContacts,
                  { name: "", relation: "", phone: "" },
                ]);
              }}
            >
              Add Contact
            </Button>
          </Col>
        </>
      ) : (
        emergencyContactsList
      )}
    </Row>
  );
};

export default EmergencyContacts;
