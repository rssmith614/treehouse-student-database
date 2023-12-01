const firebaseTest = require('@firebase/rules-unit-testing');
const firestore = require('@firebase/firestore');

const fs = require('fs');

const PROJECT_ID = 'student-database-2aa8d';

// const testEnv = firebaseTest.initializeTestEnvironment({
//     projectId: PROJECT_ID,
//     firestore: {
//         rules: fs.readFileSync("../firestore.rules", "utf8"),
//         host: '127.0.0.1',
//         port: 8080,
//     },
// });

let admin;
let tutor;
let joe;

before(async () => {
    await firebaseTest.initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            rules: fs.readFileSync("../firestore.rules", "utf8"),
            host: '127.0.0.1',
            port: 8080,
        },
    }).then((tenv) => {
        admin = tenv.authenticatedContext('admin');
        tutor = tenv.authenticatedContext('tutor');
        joe = tenv.unauthenticatedContext();
    })
})

describe("Admin", () => {

    let db;

    before(() => {
        db = admin.firestore();
    })

    it("Can read students", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students')))
    })

    it("Can manipulate students", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1'), {}))
    })

    it("Can change other tutors' clearance", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/tutors', 'dummy'), {'clearance': 'held'}))
    })

    it("Cannot change their own clearance", async () => {
        await firebaseTest.assertFails(firestore.updateDoc(firestore.doc(db, '/tutors', 'admin'), {'clearance': 'held'}))
    })

    it("Can read evals", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/evaluations')));
    })

    it("Can read an eval's tasks", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, 'evaluations', 'test1', 'tasks')));
    })

    it("Can edit evals", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/evaluations', 'test1'), {'test': 'edited by admin'}));
    })

    it("Can edit an eval's tasks", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, 'evaluations', 'test1', 'tasks', 'task1'), {'test': 'edited by admin'}));
    })

    it("Can view standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/standards')))
    })

    it("Can edit standards", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/standards', 'standard1'), {'key': '1.1.1'}))
    })

    it("Can view a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students', 'test1', 'standards')))
    })

    it("Can edit a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1', 'standards', 'standard1'), {'key': '1.1.1'}))
    })
})

describe("Tutor", () => {

    let db;

    before(() => {
        db = tutor.firestore();
    })

    it("Can read students", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students')))
    });

    it("Cannot manipulate students", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/students'), {}))
    })

    it("Can read evals", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/evaluations')));
    })

    it("Can read an eval's tasks", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, 'evaluations', 'test1', 'tasks')));
    })

    it("Can edit their own evals", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/evaluations', 'test2'), {'test': 'edited by tutor'}));
    })

    it("Cannot edit evals not owned by them", async () => {
        await firebaseTest.assertFails(firestore.updateDoc(firestore.doc(db, '/evaluations', 'test1'), {'test': 'edited by tutor'}));
    })

    it("Can view standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/standards')))
    })

    it("Cannot edit standards", async () => {
        await firebaseTest.assertFails(firestore.setDoc(firestore.doc(db, '/standards', 'standard1'), {'key': '1.1.1'}))
    })

    it("Can view a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students', 'test1', 'standards')))
    })

    it("Can edit a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1', 'standards', 'standard1'), {'key': '1.1.1'}))
    })
})

describe("Unauthenticated User", () => {

    let db;

    before(() => {
        db = joe.firestore();
    })

    it("Cannot read students", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/students')))
    });

    it("Cannot manipulate students", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/students'), {}))
    })

    it("Cannot read evals", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/evaluations')))
    });

    it("Cannot manipulate evals", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/evaluations'), {}))
    })

    it("Cannot read standards", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/standards')))
    });

    it("Cannot manipulate standards", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/standards'), {}))
    })
})
