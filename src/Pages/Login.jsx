import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

const Login = ( { setUserProfile }) => {
  
  const provider = new GoogleAuthProvider();
  
  const navigate = useNavigate();

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        // console.log(user);

        getDoc(doc(db, 'tutors', user.uid))
          .then(userDoc => {
            if (userDoc.exists()) {
              if (userDoc.clearance === "held" || userDoc.clearance === 'revoked') {
                window.alert('You do not have access to the Treehouse Student Database. Contact an administrator.');
                signOut(auth);
                return;
              }

              setUserProfile(userDoc);
              navigate(`/tutor/${userDoc.id}`);
            } else {
              const tutorsRef = collection(db, "tutors");

              const q = query(tutorsRef, where("email", "==", user.email));
      
              getDocs(q).then(async (res) => {
                if (res.docs.length === 0) {
                  window.alert(`User ${user.displayName}: ${user.email} is not in the database`);
                  signOut(auth);
                } else {
                  let attemptedLoginUser = res.docs[0].data();
                  let userRef = res.docs[0];
      
                  if (!attemptedLoginUser.activated) {
                    deleteDoc(res.docs[0].ref);
                    let {apiKey: _, ...rest} = {...JSON.parse(JSON.stringify(user.toJSON())), ...attemptedLoginUser, activated: true};
                    attemptedLoginUser = rest
                    userRef = await setDoc(doc(db, 'tutors', user.uid), attemptedLoginUser)
                  }
      
                  setUserProfile(userRef);
                  navigate(`/tutor/${userRef.id}`);
                }
              })
            }
          })

      }).catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="position-absolute top-50 start-50">
      <button className="btn btn-primary" onClick={handleSignIn}>Google Sign-In</button>
    </div>
  );
}

export default Login;