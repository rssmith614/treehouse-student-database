from firebase_functions import https_fn
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib, ssl

@https_fn.on_call(secrets=["EMAIL_PASSWORD"])
def sendAccessRequestEmail(req: https_fn.CallableRequest) -> any:
    from_email = "rssmith614@gmail.com"
    password = os.environ.get("EMAIL_PASSWORD")

    if req.data is None:
        return { "error": "Missing parameters" }
    
    try:
        to_email = req.data["admin_list"]
        user_name = req.data["user_name"]
        user_email = req.data["user_email"]
        host = req.data["host"]
    except KeyError:
        return { "error": "Missing parameter" }

    with open("./email_templates/accessRequest.html", "r") as f:
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
        user_name = req.data["user_name"]
        user_email = req.data["user_email"]
        host = req.data["host"]
    except KeyError:
        return { "error": "Missing parameter" }

    with open("./email_templates/accessGranted.html", "r") as f:
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

@https_fn.on_call(secrets=["EMAIL_PASSWORD"])
def sendEvalOwnershipRequestEmail(req: https_fn.CallableRequest) -> any:
    from_email = "rssmith614@gmail.com"
    password = os.environ.get("EMAIL_PASSWORD")

    if req.data is None:
        return { "error": "Missing parameters" }
    
    try:
        to_email = req.data.get("admin_list")
        user_name = req.data["user_name"]
        eval_url = req.data["eval_url"]
        eval_tutor = req.data["eval_tutor"]
        eval_student = req.data["eval_student"]
        eval_date = req.data["eval_date"]
    except KeyError:
        return { "error": "Missing admin_list parameter" }
    
    with open("./email_templates/ownershipRequest.html", "r") as f:
        html = f.read()
        html = html.format(user_name, eval_url, eval_url, eval_tutor, eval_student, eval_date)

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = "Eval Ownership Request"

    message.attach(MIMEText(html, "html"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(from_email, password)
            server.sendmail(from_email, to_email, message.as_string())
            return { "message": message.as_string() }
    except Exception as e:
        return { "error": str(e) }