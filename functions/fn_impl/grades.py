from firebase_functions import scheduler_fn, firestore_fn
from firebase_admin import firestore
from google.cloud.firestore_v1 import FieldFilter

import os
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib, ssl

@firestore_fn.on_document_written(document="students/*")
def updateGrades(event: firestore_fn.Change) -> None:
    db = firestore.client()
    if event.data.before._data["student_grade"] != event.data.after._data["student_grade"]:
        ref = db.collection("students").document(event.data.after.id)
        if int(event.data.after._data["student_grade"]) >= 6:
            ref.update({"reminders": True})
        else:
            ref.update({"reminders": False})

@scheduler_fn.on_schedule(schedule="0 12 1 * *", secrets=["EMAIL_PASSWORD"])
def sendGradesEmails(event: scheduler_fn.ScheduledEvent) -> None:
    out_of_date_students = []

    db = firestore.client()
    students = db.collection("students").where(filter=FieldFilter("reminders", "==", True)).stream()
    for student in students:
        most_recent_grade = list(db.collection("grades").where(filter=FieldFilter("student_id", "==", student.id)).order_by("date", "DESCENDING").limit(1).stream())
        if len(most_recent_grade) > 0:
            most_recent_grade = most_recent_grade[0]
            if datetime.fromisoformat(most_recent_grade._data["date"]) < datetime.now() - timedelta(days=30):
                out_of_date_students.append({"student_name": student._data["student_name"], "date": most_recent_grade._data["date"]})
        else:
            out_of_date_students.append({"student_name": student._data["student_name"], "date": "Never"})

    if len(out_of_date_students) > 0:
        from_email = "rssmith614@gmail.com"
        password = os.environ.get("EMAIL_PASSWORD")

        to_email = ""
        admins = db.collection("tutors").where(filter=FieldFilter("clearance", "==", "admin")).stream()
        for admin in admins:
            to_email += admin._data["email"] + ", "

        with open("./email_templates/gradesReminder.html", "r") as f:
            html = f.read()
            formatted_students = ""
            for student in out_of_date_students:
                formatted_students += f"""\
                <tr>
                    <td>{student["student_name"]}</td>
                    <td>{datetime.strftime(datetime.fromisoformat(student["date"]), "%B %-d, %Y") if student["date"] != "Never" else "Never"}</td>
                </tr>\
                """

            html = html.format(formatted_students)

        message = MIMEMultipart()
        message["From"] = from_email
        message["To"] = to_email
        message["Subject"] = "Grades Reminder"

        message.attach(MIMEText(html, "html"))

        try:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
                server.login(from_email, password)
                server.sendmail(from_email, to_email, message.as_string())
                return { "message": message.as_string() }
        except Exception as e:
            return { "error": str(e) }