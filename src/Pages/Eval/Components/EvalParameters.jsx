import { Button, Dropdown, Form, InputGroup } from "react-bootstrap";

const EvalParameters = ({ evalConditions, setEvalConditions }) => {
  const evalConditionFields = (index) => (
    <Dropdown.Menu>
      <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "date";
          newEvalConditions[index].value = "";
          setEvalConditions(newEvalConditions);
        }}
      >
        Date
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => {
          const newEvalConditions = [...evalConditions];
          newEvalConditions[index].name = "flagged";
          newEvalConditions[index].value = true;
          setEvalConditions(newEvalConditions);
        }}
      >
        Flagged for Review
      </Dropdown.Item>
    </Dropdown.Menu>
  );

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

  const dateCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Date
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {dateConditionLabel(condition.condition)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = "==";
                setEvalConditions(newEvalConditions);
              }}
            >
              On
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = "<=";
                setEvalConditions(newEvalConditions);
              }}
            >
              On or Before
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].condition = ">=";
                setEvalConditions(newEvalConditions);
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
            const newEvalConditions = [...evalConditions];
            newEvalConditions[index].value = e.target.value;
            setEvalConditions(newEvalConditions);
          }}
        />
      </InputGroup>
    );
  };

  const flaggedCondition = (condition, index) => {
    return (
      <InputGroup key={index} className='py-3'>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            Is Flagged
          </Dropdown.Toggle>
          {evalConditionFields(index)}
        </Dropdown>
        <Dropdown>
          <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
            {condition.value ? "Yes" : "No"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = true;
                setEvalConditions(newEvalConditions);
              }}
            >
              Yes
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                const newEvalConditions = [...evalConditions];
                newEvalConditions[index].value = false;
                setEvalConditions(newEvalConditions);
              }}
            >
              No
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </InputGroup>
    );
  };

  function evalConditionType(condition) {
    switch (condition.name) {
      case "date":
        return dateCondition;
      case "flagged":
        return flaggedCondition;
      default:
        return dateCondition;
    }
  }

  const evalConditionsList = evalConditions.map((condition, index) => {
    return (
      <div className='d-flex' key={index}>
        {index === 0 ? null : (
          <Button variant='secondary' className='me-3 my-3' disabled>
            AND
          </Button>
        )}
        {evalConditionType(condition)(condition, index)}
        <Button
          variant='danger'
          className='ms-3 my-3'
          onClick={() => {
            const newEvalConditions = [...evalConditions];
            newEvalConditions.splice(index, 1);
            setEvalConditions(newEvalConditions);
          }}
        >
          Remove
        </Button>
      </div>
    );
  });

  return (
    <>
      {evalConditionsList}
      <div className='d-flex py-3'>
        <Button
          variant='secondary'
          className=''
          onClick={() => {
            const newEvalConditions = [...evalConditions];
            newEvalConditions.push({
              name: "date",
              condition: "==",
              value: "",
            });
            setEvalConditions(newEvalConditions);
          }}
        >
          Add Condition
        </Button>
      </div>
    </>
  );
};

export default EvalParameters;
