import { getDocs, query, collection, where } from "firebase/firestore";
import { db, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

const sendAccessRequest = httpsCallable(functions, 'sendAccessRequestEmail');
const sendAccessGranted = httpsCallable(functions, 'sendAccessGrantedEmail');

function sendAuthRequestEmail(userName, userEmail) {
    let adminEmails = [];
    getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                adminEmails.push(doc.data().email);
            });
        })
        .then(() => {
            sendAccessRequest({
                admin_list: adminEmails.join(";"),
                user_name: userName,
                user_email: userEmail,
                host: location.host,
            }).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.error(error);
            });
        })
}

function sendAuthApprovedEmail(userName, userEmail) {
    let adminEmails = [];
    getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                adminEmails.push(doc.data().email);
            });
        })
        .then(() => {
            sendAccessGranted({
                admin_list: adminEmails.join(";"),
                user_name: userName,
                user_email: userEmail,
                host: location.host,
            }).then((result) => {
                console.log(result);
            }).catch((error) => {
                console.error(error);
            });
        })
}

export { sendAuthRequestEmail, sendAuthApprovedEmail };