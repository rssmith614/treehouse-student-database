import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import aggregation

import pandas as pd
import numpy as np

import re

import os

# os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
# os.environ["GCLOUD_PROJECT"] = "student-database-2aa8d"

# Use a service account.
cred = credentials.Certificate('student-database-2aa8d-5888003c045e.json')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

standards_ref = db.collection('standards')

GRADE_FOLDERS = [
    '1st Grade',
    '2nd Grade',
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    'Kindergarten'
]

errors = []

def update_standard(row):
    key_broken = str(row.iloc[3]).split('.')
    key_broken[-1] = key_broken[-1].lower()
    # key_broken[0], key_broken[1] = key_broken[1], key_broken[0]
    key = '.'.join(key_broken)
    # print(key, '->', row.iloc[2])
    standard = {
        'grade': str(row.iloc[0]),
        'category': 'Math' if row.iloc[1] == 'Math' else 'Reading',
        'sub_category': row.iloc[2],
        'key': row.iloc[3],
        'extended_description': row.iloc[4],
        'description': row.iloc[5],
        'question': row.iloc[6],
        'answer': row.iloc[7],
    }
    res = list(standards_ref.where(filter=FieldFilter('key', '==', key)).stream())
    if len(res) == 0:
        if type(key_broken[-1]) == str:
            print(key, 'not found in Firestore, looking instead for', str(row.iloc[3]))
            res = list(standards_ref.where(filter=FieldFilter('key', '==', str(row.iloc[3]))).stream())
            if len(res) == 0:
                print(str(row.iloc[3]), 'not found in Firestore, forcefully pushing')
                standards_ref.add(standard)
            else:
                print('updating', row.iloc[3])
                res[0].reference.update(standard)
        else:
            print(key, 'not found in Firestore, forcefully pushing')
            standards_ref.add(standard)
    else:
        print('updating', key, f'({row.iloc[3]})')
        res[0].reference.update(standard)
        
    return
    
def push_standard(row, grade, cat):
    standard = {
        'key': row['Standard'],
        'description': row['Simplified Description'],
        'extended_description': row['Description'],
        'grade': grade,
        'category': cat,
        'sub_category': row['Category'],
        'question': row['Example Question'],
        'answer': row['Example Answer']
    }
    
    res = list(standards_ref.where(filter=FieldFilter('key', '==', row['Standard'])).stream())
    if len(res) == 0:
        standards_ref.add(standard)
    else:
        res[0].reference.update(standard)
    

# for folder in GRADE_FOLDERS:
#     print('Reading from folder:', folder)
#     print('Parsing ELA Standards')
#     ela_standards = pd.read_excel(os.path.join('Worksheets', folder, f'{folder} ELA Standards.xlsx'), sheet_name='Sheet1', header=0)
    
#     print('Updating Firestore')
#     # ela_standards.apply(push_standard, grade=folder[0], cat='Reading', axis=1)
#     for idx, row in ela_standards.iterrows():
#         push_standard(row, folder[0], 'Reading')
        
#     print('Parsing Math Standards')
#     math_standards = pd.read_excel(os.path.join('Worksheets', folder, f'{folder} Math Standards.xlsx'), sheet_name='Sheet1', header=None)
    
#     print('Updating Firestore')
#     # math_standards.apply(push_standard, grade=folder[0], cat='Math', axis=1)
#     for idx, row in math_standards.iterrows():
#         push_standard(row, folder[0], 'Math')
    
#     break
    
all_standards = pd.read_excel('Master Standards Sheet(1).xlsx', sheet_name='Sheet1', header=0)
all_standards['Example Answer'] = all_standards['Example Answer'].astype(str)

all_standards.apply(update_standard, axis=1)
    
# errors_df = pd.DataFrame(errors)
# errors_df.to_excel('errors.xlsx')

os.unsetenv("FIRESTORE_EMULATOR_HOST")
os.unsetenv("GCLOUD_PROJECT")
