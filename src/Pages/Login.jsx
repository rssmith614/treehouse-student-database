import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { collection, getDocs, query, updateDoc, where } from "firebase/firestore";

import { AbilityBuilder } from "@casl/ability";
import { AbilityContext } from "../Services/can";
import { useAbility } from "@casl/react";
import { useContext } from "react";
import { ToastContext } from "../Services/toast";

const Login = ( { setUserProfile }) => {
  
  const provider = new GoogleAuthProvider();
  
  const navigate = useNavigate();
  
  
  const { can, rules } = new AbilityBuilder(AbilityContext);
  
  const ability = useAbility(AbilityContext);
  
  function updateAbility(user) {
    if (user.clearance === 'admin') {
      can('manage', 'all');
    }
    
    ability.update(rules);
  }

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        console.log(user);

        const tutorsRef = collection(db, "tutors");

        const q = query(tutorsRef, where("email", "==", user.email));

        getDocs(q).then((res) => {
          if (res.docs.length === 0) {
            window.alert(`User ${user.displayName}: ${user.email} is not in the database`);
            signOut(auth);
          } else {
            let attemptedLoginUser = res.docs[0].data();

            if (!attemptedLoginUser.activated) {
              attemptedLoginUser['activated'] = true;
              attemptedLoginUser = Object.assign(attemptedLoginUser, JSON.parse(JSON.stringify(user.toJSON())));
              delete attemptedLoginUser.apiKey;
              updateDoc(res.docs[0].ref, attemptedLoginUser);
            }

            if (attemptedLoginUser.clearance === "held" || attemptedLoginUser.clearance === 'revoked') {
              window.alert('You do not have access to the Treehouse Student Database. Contact an administrator.');
              signOut(auth);
              return;
            }

            updateAbility(attemptedLoginUser);
            setUserProfile(res.docs[0]);
            navigate(`/tutor/${res.docs[0].id}`);
          }
        })

        // await addDoc(tutorsRef, JSON.parse(JSON.stringify(user.toJSON())));
        // console.log(JSON.parse(JSON.stringify(user.toJSON())));

      }).catch((error) => {
        console.log(error);
      });
  }

  const setToast = useContext(ToastContext);

  return (
    <div className="position-absolute top-50 start-50">
      <button className="btn btn-primary" onClick={handleSignIn}>Google Sign-In</button>
      <button className="btn btn-secondary" onClick={() => setToast({header: 'hi', message: 'woah'})}>Toast</button>
      <button className="btn btn-secondary" onClick={() => setToast({header: 'other toast', message: 'electric boogaloo'})}>Toast 2</button>
    </div>
  );
}

export default Login;