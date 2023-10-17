import NewStudentForm from '../Components/NewStudentForm';

const NewProfile = () => {
  return (
    <div className='p-3 d-flex flex-column'>
      <div className='d-flex display-1'>
        New Student
      </div>
      <div className='d-flex flex-row justify-content-center'>
        <div className='d-flex p-3 m-3 card w-75 bg-light-subtle'>
          <NewStudentForm />
        </div>
      </div>
    </div>
  );
};

export default NewProfile;