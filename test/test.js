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
        admin = tenv.authenticatedContext('EBZCN1t2wDSXB5DKpLXS9zXGuaZy');
        tutor = tenv.authenticatedContext('bpUJLhK40wK6HMV6TizkKKEeN66x');
        joe = tenv.unauthenticatedContext();
    })
})

describe("Admin", () => {

    let db;

    before(() => {
        db = admin.firestore();
    })

    // admin has full read/write on students
    it("Can read students", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students')))
    })

    it("Can manipulate students", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1'), {}))
    })

    // admin has read/write on students/standards
    it("Can view a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students', 'test1', 'standards')))
    })
    
    it("Can edit a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1', 'standards', 'standard1'), {'key': '1.1.1'}))
    })

    it("Can delete a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.deleteDoc(firestore.doc(db, '/students', 'test1', 'standards', 'standard1')))
    })

    it("Can delete students", async () => {
        await firebaseTest.assertSucceeds(firestore.deleteDoc(firestore.doc(db, '/students', 'test1')))
    })

    // admin has full read/write on tutors, except for their own clearance
    it("Can change other tutors' clearance", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/tutors', 'mhCLQIikN1RXgkqlr5BaxqF0K7kC'), {'clearance': 'held'}))
    })

    it("Cannot change their own clearance", async () => {
        await firebaseTest.assertFails(firestore.updateDoc(firestore.doc(db, '/tutors', 'EBZCN1t2wDSXB5DKpLXS9zXGuaZy'), {'clearance': 'held'}))
    })

    // admin has full read/write on evals
    it("Can read evals", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/evaluations')));
    })

    it("Can create evals", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/evaluations', 'test1'), {'test': 'created by admin'}));
    })

    it("Can edit evals", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/evaluations', 'test1'), {'test': 'edited by admin'}));
    })

    // admin has full read/write on evals/tasks
    it("Can read an eval's tasks", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, 'evaluations', 'test1', 'tasks')));
    })

    it("Can edit an eval's tasks", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, 'evaluations', 'test1', 'tasks', 'task1'), {'test': 'edited by admin'}));
    })

    it("Can delete an eval", async () => {
        await firebaseTest.assertSucceeds(firestore.deleteDoc(firestore.doc(db, '/evaluations', 'test1')));
    })

    // admin has full read/write on standards
    it("Can view standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/standards')))
    })

    it("Can edit standards", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/standards', 'standard1'), {'key': '1.1.1'}))
    })

    // admin has full read/write on assessments
    it("Can read assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/assessments')))
    })

    it("Can edit assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/assessments', 'test1'), {'test': 'edited by admin'}))
    })

    // admin has full read/write on student_assessments
    it("Can read student_assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/student_assessments')))
    })

    it("Can edit student_assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/student_assessments', 'test1'), {'test': 'edited by admin'}))
    })
})

describe("Tutor", () => {

    let db;

    before(() => {
        db = tutor.firestore();
    })

    // tutor has read on students, but not write
    it("Can read students", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students')))
    });

    it("Cannot manipulate students", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/students'), {}))
    })

    // tutor has read on evals and evals/tasks, but only write on evals they own
    it("Can read evals", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/evaluations')));
    })

    it("Can create evals", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/evaluations', 'test2'), {'test': 'created by tutor', 'owner': 'bpUJLhK40wK6HMV6TizkKKEeN66x'}));
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

    // tutor has read on standards, but not write
    it("Can view standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/standards')))
    })

    it("Cannot edit standards", async () => {
        await firebaseTest.assertFails(firestore.setDoc(firestore.doc(db, '/standards', 'standard1'), {'key': '1.1.1'}))
    })

    it("Can delete their own evals", async () => {
        await firebaseTest.assertSucceeds(firestore.deleteDoc(firestore.doc(db, '/evaluations', 'test2')));
    })

    // tutor has read/write on students/standards
    it("Can view a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/students', 'test1', 'standards')))
    })

    it("Can edit a student's standards", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/students', 'test1', 'standards', 'standard1'), {'key': '1.1.1'}))
    })

    // tutor has read on assessments, but not write
    it("Can read assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/assessments')))
    });

    it("Cannot edit assessments", async () => {
        await firebaseTest.assertFails(firestore.setDoc(firestore.doc(db, '/assessments', 'test1'), {'test': 'edited by tutor'}))
    });

    // tutor has read student_assessments, and write on student_assessments they own
    it("Can read student_assessments", async () => {
        await firebaseTest.assertSucceeds(firestore.getDocs(firestore.collection(db, '/student_assessments')))
    });

    it("Can issue an assessment to a student", async () => {
        await firebaseTest.assertSucceeds(firestore.setDoc(firestore.doc(db, '/student_assessments', 'test2'), {'issued_by': 'bpUJLhK40wK6HMV6TizkKKEeN66x'}))
    });

    it("Can edit student_assessments that they own", async () => {
        await firebaseTest.assertSucceeds(firestore.updateDoc(firestore.doc(db, '/student_assessments', 'test2'), {'test': 'edited by tutor'}, {merge: true}))
    });

    it("Cannot edit student_assessments that they don't own", async () => {
        await firebaseTest.assertFails(firestore.setDoc(firestore.doc(db, '/student_assessments', 'test1'), {'test': 'edited by tutor'}))
    });

    it("Can delete student_assessments that they own", async () => {
        await firebaseTest.assertSucceeds(firestore.deleteDoc(firestore.doc(db, '/student_assessments', 'test2')))
    });
})

describe("Unauthenticated User", () => {

    let db;

    before(() => {
        db = joe.firestore();
    })

    // unauthenticated user has no read/write on students
    it("Cannot read students", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/students')))
    });

    it("Cannot manipulate students", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/students'), {}))
    })

    // unauthenticated user has no read/write on tutors
    it("Cannot read tutors", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/tutors')))
    });

    it("Cannot manipulate tutors", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/tutors'), {}))
    });

    // unauthenticated user has no read/write on evals
    it("Cannot read evals", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/evaluations')))
    });

    it("Cannot manipulate evals", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/evaluations'), {}))
    })

    // unauthenticated user has no read/write on standards
    it("Cannot read standards", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/standards')))
    });

    it("Cannot manipulate standards", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/standards'), {}))
    })

    // unauthenticated user has no read/write on assessments
    it("Cannot read assessments", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/assessments')))
    });

    it("Cannot manipulate assessments", async () => {
        await firebaseTest.assertFails(firestore.addDoc(firestore.collection(db, '/assessments'), {}))
    })

    // unauthenticated user has no read/write on student_assessments
    it("Cannot read student_assessments", async () => {
        await firebaseTest.assertFails(firestore.getDocs(firestore.collection(db, '/student_assessments')))
    });
})
