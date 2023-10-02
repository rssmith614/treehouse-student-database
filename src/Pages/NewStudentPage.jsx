import NewStudentForm from '../Components/NewStudentForm';

const NewProfile = () => {
  return (
    <div className='p-3 d-flex flex-column align-items-start'>
      <h1 className='d-flex'>
        New Student
      </h1>
      <div className='d-flex p-3 card w-75 bg-light-subtle'>
        <NewStudentForm />
      </div>
    </div>
  );
};

export default NewProfile;