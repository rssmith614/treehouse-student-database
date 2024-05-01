import os

# os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
# os.environ["GCLOUD_PROJECT"] = "student-database-2aa8d"

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('student-database-2aa8d-5888003c045e.json')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

evaluations = db.collection('evaluations').stream()

for e in evaluations:
    e.reference.update({'draft': False})
    # print(e.to_dict())
    # break

os.unsetenv("FIRESTORE_EMULATOR_HOST")
os.unsetenv("GCLOUD_PROJECT")

print('done')