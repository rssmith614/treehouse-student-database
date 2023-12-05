import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import aggregation

import pandas as pd
import numpy as np

import re

# Use a service account.
cred = credentials.Certificate('student-database-2aa8d-5888003c045e.json')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

assessments_ref = db.collection('assessments')

grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8']
categories = ['Reading', 'Math']

# for grade in grades:
#     for category in categories:
#         new_assessment = {
#             'grade': grade,
#             'category': category,
#             'file': '',
#         }
#         _, new_ref = assessments_ref.add(new_assessment)

assessments = assessments_ref.stream()

for a in assessments:
    for i in range(10):
        q = {
            'num': i+1,
            'question': '',
            'sample_answer': '',
            'standard': '',
        }
        db.collection('assessments').document(a.id).collection('questions').add(q)