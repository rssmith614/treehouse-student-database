import NewStudentForm from '../Components/NewStudentForm';

const NewProfile = () => {
  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <div className='d-flex display-1'>
        New Student
      </div>
      <div className='d-flex p-3 card w-75 bg-light-subtle'>
        <NewStudentForm />
      </div>
    </div>
  );
};

export default NewProfile;