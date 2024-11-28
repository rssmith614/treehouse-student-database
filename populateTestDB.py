from faker import Faker

import random

import os

# os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
# os.environ["GCLOUD_PROJECT"] = "student-database-2aa8d"

# import firebase_admin
# from firebase_admin import credentials, firestore
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter

# cred = credentials.Certificate('student-database-2aa8d-5888003c045e.json')

# app = firebase_admin.initialize_app(credentials.ApplicationDefault(), {
#     'databaseURL': 'https://student-database-test.firebaseio.com'
# })

db = firestore.Client(database="test")

students_ref = db.collection('students')

# agg = aggregation.AggregationQuery(students_ref.where(filter=FieldFilter("student_name", "!=", ""))).count(alias="all")

# results = agg.get()
# for result in results:
#     print(f"Alias of results from query: {result[0].alias}")
#     print(f"Number of results from query: {result[0].value}")

# test = students_ref.document("1ByspLsah3Ji0LhD8VsE")

# print(test.get().to_dict())

fake = Faker(["en_US"])

# for _ in range(5):
#     tutor = {
#         "displayName": fake.name(),
#         "clearance": "tutor",
#         "email": fake.email(),
#         "preferredSubjects": ", ".join([fake.word() for _ in range(random.randint(1, 5))]),
#         "preferredAges": ", ".join([str(fake.random_int(min=1, max=12)) for _ in range(random.randint(1, 5))]),
#     }

#     update_time, ref = db.collection('tutors').add(tutor)
#     # print(f"Added tutor with ID: {ref.id}")

# print("Tutors added")

tutor_ids = [(doc.id, doc.to_dict()["displayName"]) for doc in db.collection('tutors').where(filter=FieldFilter('clearance', 'in', ['admin', 'tutor'])).stream()]
print("Tutor IDs collected:", len(tutor_ids))

print("Generating Students")

for _ in range(20):
    preferred_tutor = random.choice(tutor_ids+[(None, "")])
    student = {
        "parent_name": fake.name(),
        "reminders": fake.boolean(),
        "emergency_contacts": [
            {
                "name": fake.name(),
                "relation": fake.word(),
                "phone": fake.phone_number()
            } for _ in range(random.randint(0, 3))
        ],
        "other": fake.text(),
        "student_source": fake.company(),
        "student_dob": fake.date_of_birth(minimum_age=5, maximum_age=18).isoformat(),
        "student_name": fake.name(),
        "student_grade": str(fake.random_int(min=1, max=12)),
        "parent_phone": fake.phone_number(),
        "student_school": fake.company(),
        "preferred_tutor_name": preferred_tutor[1],
        "preferred_tutor": preferred_tutor[0],
    }

    update_time, ref = students_ref.add(student)

    for topic in [
        {
        "updateDate": fake.date_time_this_year().isoformat(),
        "updatedBy": random.choice(tutor_ids)[1],
        "topic": fake.sentence(),
        "description": fake.text(),
        "priority": str(fake.random_int(min=1, max=3))
        } for _ in range(random.randint(0, 5))
    ]:
        students_ref.document(ref.id).collection('topics').add(topic)


    # print(f"Added student with ID: {ref.id}")
    # print(student)
print("Students added")

print("Collecting standards")
standards = []
for s in db.collection('standards').stream():
    standards.append({**s.to_dict(), "id": s.id})
print("Standards collected:", len(standards))

print("Collecting students")
student_ids = [(doc.id, doc.to_dict()["student_name"]) for doc in students_ref.stream()]
print("Student IDs collected:", len(student_ids))

print("Generating evaluations")
for _ in range(100):
    chosen_student = random.choice(student_ids)
    chosen_tutor = random.choice(tutor_ids)

    evaluation = {
        "date": fake.date_time_this_year().isoformat(),
        "owner": chosen_tutor[0],
        "student_name": chosen_student[1],
        "tutor_id": chosen_tutor[0],
        "tutor_name": chosen_tutor[1],
        "flagged": fake.boolean(),
        "next_session": fake.text(),
        "draft": False,
        "student_id": chosen_student[0],
        "worksheets": [
            {
                "link": fake.url(),
                "completion": fake.text(),
                "type": "url"
            } for _ in range(random.randint(0, 3))
        ]
    }

    update_time, ref = db.collection('evaluations').add(evaluation)

    tasks = [
        {
            "comments": fake.text(),
            "progression": str(fake.random_int(min=1, max=4)),
            "engagement": str(fake.random_int(min=1, max=4)),
            "standards": [
                {
                    "progression": str(fake.random_int(min=1, max=4)),
                    "id": random.choice(standards)["id"],
                } for _ in range(random.choices([0,1,2], weights=[0.6, 0.3, 0.1], k=1)[0])
            ]
        } for _ in range(random.choices([1,2,3,4,5], weights=[0.5, 0.2, 0.2, 0.05, 0.05], k=1)[0])
    ]

    for task in tasks:
        db.collection('evaluations').document(ref.id).collection('tasks').add(task)

    # print(chosen_tutor)

print("Evaluations added")

print("Generating grades")
for student_id, student_name in student_ids:
    chosen_tutor = random.choice(tutor_ids)
    classes = [
        fake.word() for _ in range(random.randint(1, 5))
    ]

    grades = [
        {
            "date": fake.date_time_this_year().isoformat(),
            "student_id": student_id,
            "tutor_id": chosen_tutor[0],
            "tutor_name": chosen_tutor[1],
            "grades": [
                {
                    "subject": c,
                    "grade": str(fake.random_int(min=1, max=100)),
                    "comments": fake.catch_phrase()
                } for c in classes
            ]
        } for _ in range(random.randint(1, 5))
    ]

    for grade in grades:
        update_time, ref = db.collection('grades').add(grade)

        # print(chosen_student)


print("Grades added")


os.unsetenv("FIRESTORE_EMULATOR_HOST")