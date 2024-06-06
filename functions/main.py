# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import firestore_fn, https_fn, options
from firebase_admin import initialize_app, firestore
import google.cloud.firestore
import os

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = initialize_app()

@https_fn.on_call(secrets=["EMAIL_PASSWORD"])
def sendAccessRequestEmail(req: https_fn.CallableRequest) -> any:
    from_email = "rssmith614@gmail.com"
    password = os.environ.get("EMAIL_PASSWORD")

    if req.data is None:
        return { "error": "Missing parameters" }
    
    try:
        to_email = req.data["admin_list"]
    except KeyError:
        return { "error": "Missing admin_list parameter" }
    
    try:
        user_name = req.data["user_name"]
    except KeyError:
        return { "error": "Missing user_name parameter" }
    
    try:
        user_email = req.data["user_email"]
    except KeyError:
        return { "error": "Missing user_email parameter" }
    
    try:
        host = req.data["host"]
    except KeyError:
        return { "error": "Missing host parameter" }

    with open("accessRequest.html", "r") as f:
        html = f.read()
        html = html.format(user_name, user_email, f"\"{host}/tutors\"")

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = to_email
    message["Cc"] = user_email
    message["Subject"] = "Access Request"

    message.attach(MIMEText(html, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(from_email, password)
            server.sendmail(from_email, to_email, message.as_string())
            return { "message": message.as_string() }
    except Exception as e:
        return { "error": str(e) }


@https_fn.on_call(secrets=["EMAIL_PASSWORD"])
def sendAccessGrantedEmail(req: https_fn.CallableRequest) -> any:
    from_email = "rssmith614@gmail.com"
    password = os.environ.get("EMAIL_PASSWORD")

    if req.data is None:
        return { "error": "Missing parameters" }
    
    try:
        cc_email = req.data["admin_list"]
    except KeyError:
        return { "error": "Missing admin_list parameter" }
    
    try:
        user_name = req.data["user_name"]
    except KeyError:
        return { "error": "Missing user_name parameter" }
    
    try:
        user_email = req.data["user_email"]
    except KeyError:
        return { "error": "Missing user_email parameter" }
    
    try:
        host = req.data["host"]
    except KeyError:
        return { "error": "Missing host parameter" }

    with open("accessGranted.html", "r") as f:
        html = f.read()
        html = html.format(user_name, f"\"{host}/login\"")

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = user_email
    message["Cc"] = cc_email
    message["Subject"] = "Access Granted"

    message.attach(MIMEText(html, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(from_email, password)
            server.sendmail(from_email, user_email, message.as_string())
            return { "message": message.as_string() }
    except Exception as e:
        return { "error": str(e) }
