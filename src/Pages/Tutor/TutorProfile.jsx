import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../Services/firebase";
import About from "./Components/About";
import RecentEvals from "./Components/RecentEvals";
import RecentStudents from "./Components/RecentStudents";

const TutorProfile = () => {
  const [tutor, setTutor] = useState({});

  const [recentStudents, setRecentStudents] = useState([]);

  const navigate = useNavigate();

  const params = useParams();

  const tutorDocRef = useRef(doc(db, "tutors", params.tutorid));

  useEffect(() => {
    tutorDocRef.current = doc(db, "tutors", params.tutorid);

    const unsubscribeTutor = onSnapshot(tutorDocRef.current, (doc) => {
      setTutor({ ...doc.data(), id: doc.id });
      getDocs(
        query(
          collection(db, "evaluations"),
          where("tutor_id", "==", doc.id),
          orderBy("date", "desc"),
        ),
      ).then((querySnapshot) => {
        let students = [];
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          if (
            students.length < 5 &&
            !students.find((student) => student.id === data.student_id)
          ) {
            students.push({ id: data.student_id, name: data.student_name });
          }
        });
        setRecentStudents(students);
      });
    });

    return () => unsubscribeTutor();
  }, [params.tutorid]);

  async function denyAccess() {
    if (
      !window.confirm(
        `You are about to DENY access to ${tutor.displayName}. Are you sure you want to do this?`,
      )
    ) {
      return;
    }

    await deleteDoc(tutorDocRef.current).then(() => navigate("/tutors"));
  }

  return (
    <div className='p-3 d-flex flex-column'>
      <h1 className='d-flex display-1'>Tutor Profile</h1>
      <div className='d-flex flex-row justify-content-center'>
        <About tutor={tutor} denyAccess={denyAccess} />

        <RecentStudents recentStudents={recentStudents} />
      </div>
      <RecentEvals tutorid={tutorDocRef.current.id} />
    </div>
  );
};

export default TutorProfile;
