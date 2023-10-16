import { useNavigate } from "react-router-dom";

import { auth, db } from "../Services/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore";

import { AbilityBuilder } from "@casl/ability";
import { AbilityContext } from "../Services/can";
import { useAbility } from "@casl/react";

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
            window.alert(`User ${user.displayName} is not in the database`);
            signOut(auth);
          } else {
            updateAbility(res.docs[0].data());
            setUserProfile(res.docs[0].data());
            navigate('/students');
          }
        })

        // await addDoc(tutorsRef, JSON.parse(JSON.stringify(user.toJSON())));
        // console.log(JSON.parse(JSON.stringify(user.toJSON())));

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