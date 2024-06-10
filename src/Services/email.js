import { getDocs, query, collection, where } from "firebase/firestore";
import { db, functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

const sendAccessRequest = httpsCallable(functions, 'sendAccessRequestEmail');
const sendAccessGranted = httpsCallable(functions, 'sendAccessGrantedEmail');
const sendEvalOwnershipRequest = httpsCallable(functions, 'sendEvalOwnershipRequestEmail');

async function sendAuthRequestEmail(userName, userEmail) {
    let adminEmails = (await getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))).docs;
    
    try {
        let result = await sendAccessRequest({
            admin_list: adminEmails.map((doc) => doc.data().email).join(";"),
            user_name: userName,
            user_email: userEmail,
        });
        if (result.data.error) {
            throw new Error(result.error);
        } else {
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

async function sendAuthApprovedEmail(userName, userEmail) {
    let adminEmails = (await getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))).docs;

    try {
        let result = await sendAccessGranted({
            admin_list: adminEmails.map((doc) => doc.data().email).join(";"),
            user_name: userName,
            user_email: userEmail,
        });
        if (result.data.error) {
            throw new Error(result.error);
        } else {
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

async function sendEvalOwnershipRequestEmail(userName, evalUrl, evalTutor, evalStudent, evalDate) {
    let adminEmails = (await getDocs(query(collection(db, 'tutors'), where('clearance', '==', 'admin')))).docs;

    try {
        let result = await sendEvalOwnershipRequest({
            admin_list: adminEmails.map((doc) => doc.data().email).join(";"),
            user_name: userName,
            eval_url: evalUrl,
            eval_tutor: evalTutor,
            eval_student: evalStudent,
            eval_date: evalDate,
        });
        if (result.data.error) {
            throw new Error(result.error);
        } else {
            return result;
        }
    } catch (error) {
        throw new Error(error);
    }
}

export { sendAuthRequestEmail, sendAuthApprovedEmail, sendEvalOwnershipRequestEmail };