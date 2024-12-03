from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = "admin@householdservices.com"
SENDER_PASSWORD = ""

def send_email(to, subject, body):
    email = MIMEMultipart()
    email['To'] = to
    email['Subject'] = subject
    email['From'] = SENDER_EMAIL
    email.attach(MIMEText(body, 'html'))
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=email)
    client.quit()