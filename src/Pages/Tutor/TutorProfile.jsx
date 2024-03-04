import { useParams } from "react-router-dom";

import About from "./Components/About";
import RecentEvals from "./Components/RecentEvals";
import RecentStudents from "./Components/RecentStudents";

const TutorProfile = () => {
  const params = useParams();

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>Tutor Profile</h1>
      <div className='d-flex flex-row justify-content-center'>
        <About tutorid={params.tutorid} />

        <RecentStudents tutorid={params.tutorid} />
      </div>
      <RecentEvals tutorid={params.tutorid} />
    </div>
  );
};

export default TutorProfile;
