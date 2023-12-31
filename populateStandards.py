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

standards_ref = db.collection('standards')
docs = standards_ref.stream()

# print(standards_ref.document('standard1').get().to_dict())
# docs = standards_ref.where(filter=FieldFilter('description', '==', '')).stream()

for d in docs:
    data = d.to_dict()
    if 'description' not in data:
        d.reference.delete()
        print(data['key'])

# all_standards = pd.read_excel('Standards K-8.xlsx', sheet_name='ALL', header=None)

# all_standards.iloc[0:2] = all_standards.iloc[0:2].ffill(axis='columns')
# all_standards.loc[2:] = all_standards.loc[2:].fillna('')

# 83
# for i in range(len(all_standards.columns)):
# # for i in range(35,40):
#     cur_col = all_standards[i]
#     grade = cur_col[0][0]
#     category = cur_col[1]
#     sub_category = cur_col[2]
#     j = 3
#     while cur_col[j] != '':
#         standard = {
#             'grade': grade,
#             'category': category,
#             'sub_category': sub_category,
#             'key': re.sub(r"^([K1-8\.]{2})\1", r"\1", cur_col[j])
#         }
#         print(standard)
#         standards_ref.add(standard)
#         j += 1
#         if j == len(cur_col): break


# k_math = pd.read_excel('Standards K-8.xlsx', sheet_name='7th grade - Math', header=None)

# k_math = k_math.fillna('')

# duplicate grade removal
# re.sub(r"^([K1-8\.]{2})\1", r"\1", str)

# category before grade swapper
# re.sub(r"^(\w+\.)([K1-8]+\.)", r"\2\1", str)

# print(k_math)
# for i in range(len(k_math.index)):
#     row = k_math.loc[i]
#     desc = ''
#     if i == len(k_math.index) - 1:
#         desc = row[1] if row[1] != '' else row[2]

#     elif row[1] == '':
#         if row[2] != '': desc = row[2]
#         else: continue
#     else:
#         # if k_math.loc[i+1][2] != '': continue
#         # else: 
#             desc = row[1]

#     desc = re.sub(r"^([K1-8\.]{2})\1", r"\1", desc) # duplicate grade
#     desc = re.sub(r"^(\w+\.)([K1-8]+\.)", r"\2\1", desc) # cat/grade swap

#     key, desc = desc.split(' ', 1)
#     # print(key)
#     # print(desc)

#     # query_res = standards_ref.where(filter=FieldFilter('key', '==', key)).stream()

#     # for doc in query_res:
#     #     doc.reference.update({'description': desc})

#     res = aggregation.AggregationQuery(standards_ref.where(filter=FieldFilter('key', '==', key))).count(alias='all').get()

#     for r in res:
#         if r[0].value == 0:
#             print("==========================")
#             print("Key:", key)
#             print("Description:", desc)
#             grade = key[0]
#             print("Grade:", grade)
#             cat = 'Math'
#             # cat = 'Reading'
#             print("Category:", cat)
#             subcat = input("Subcategory: ")
#             if subcat == 's':
#                 print('Skipped')
#                 break

#             new_standard = {
#                 'key': key,
#                 'description': desc,
#                 'grade': grade,
#                 'category': cat,
#                 'sub_category': subcat
#             }

#             standards_ref.add(new_standard)
#             print('Added', key)
    
print("All done!")