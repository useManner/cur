import os
import smtplib
from email.mime.text import MIMEText
import httpx


def send_email(to_email: str, subject: str, html_body: str) -> None:
    host = os.getenv("MAIL_HOST")
    user = os.getenv("MAIL_USER")
    password = os.getenv("MAIL_PASS")
    if not host or not user or not password:
        return
    msg = MIMEText(html_body, "html", "utf-8")
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email
    with smtplib.SMTP(host, 587, timeout=10) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(user, [to_email], msg.as_string())


def post_webhook(url: str, payload: dict) -> None:
    if not url:
        return
    try:
        httpx.post(url, json=payload, timeout=5.0)
    except Exception:
        pass


