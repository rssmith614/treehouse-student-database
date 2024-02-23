import { Button, Dropdown, Form, InputGroup } from "react-bootstrap";

const StudentParameters = ({ studentConditions, setStudentConditions }) => {
  const studentConditionFields = (index) => (
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_name";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Name
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_school";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        School
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_source";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Source
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_grade";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Grade
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newStudentConditions = [...studentConditions];
          newStudentConditions[index].name = "student_dob";
          newStudentConditions[index].value = "";
          setStudentConditions(newStudentConditions);
        }}
      >
        Date of Birth
      </Dropdown.Item>
    </Dropdown.Menu>
  );

  const studentNameCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Name
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const schoolCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            School
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const sourceCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Source
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  const gradeCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Grade
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Button variant='secondary'>Is</Button>
        <Form.Control
          type='text'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  function dateConditionLabel(condition) {
    switch (condition) {
      case "==":
        return "On";
      case "<=":
        return "On or Before";
      case ">=":
        return "On or After";
      default:
        return "On";
    }
  }

  const dobCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Date of Birth
          </Dropdown.Toggle>
          {studentConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {dateConditionLabel(condition.condition)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = "==";
                setStudentConditions(newStudentConditions);
              }}
            >
              On
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = "<=";
                setStudentConditions(newStudentConditions);
              }}
            >
              On or Before
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newStudentConditions = [...studentConditions];
                newStudentConditions[index].condition = ">=";
                setStudentConditions(newStudentConditions);
              }}
            >
              On or After
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Form.Control
          type='date'
          value={condition.value}
          onChange={(e) => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions[index].value = e.target.value;
            setStudentConditions(newStudentConditions);
          }}
        />
      </InputGroup>
    );
  };

  function studentConditionType(condition) {
    switch (condition.name) {
      case "student_name":
        return studentNameCondition;
      case "student_school":
        return schoolCondition;
      case "student_source":
        return sourceCondition;
      case "student_grade":
        return gradeCondition;
      case "student_dob":
        return dobCondition;
      default:
        return studentNameCondition;
    }
  }

  const studentConditionsList = studentConditions.map((condition, index) => {
    return (
      <div className='d-flex' key={index}>
        {index === 0 ? null : (
          <Button variant='secondary' className='me-3 my-3' disabled>
            AND
          </Button>
        )}
        {studentConditionType(condition)(condition, index)}
        <Button
          variant='danger'
          className='ms-3 my-3'
          onClick={() => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions.splice(index, 1);
            setStudentConditions(newStudentConditions);
          }}
        >
          Remove
        </Button>
      </div>
    );
  });

  return (
    <>
      {studentConditionsList}
      <div className='d-flex py-3'>
        <Button
          variant='secondary'
          className=''
          onClick={() => {
            const newStudentConditions = [...studentConditions];
            newStudentConditions.push({
              name: "student_name",
              condition: "==",
              value: "",
            });
            setStudentConditions(newStudentConditions);
          }}
        >
          Add Condition
        </Button>
      </div>
    </>
  );
};

export default StudentParameters;
