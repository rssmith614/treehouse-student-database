import { init, send } from "@emailjs/browser";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "./firebase";

init('EEoUW9pUcXKWuGEY1');

function sendAuthRequestEmail(userName, userEmail) {
    let adminEmails = [];
    getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                adminEmails.push(doc.data().email);
            });
        })
        .then(() => {
            console.log(adminEmails)
            send('service_tb1cwud', 'template_new_access', {
                send_to: adminEmails.join(';'),
                user_name: userName,
                user_email: userEmail,
            });
        })
}

export { sendAuthRequestEmail };