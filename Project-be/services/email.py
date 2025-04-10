from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Union
from dotenv import dotenv_values

class EmailSendingService():
    def sendMail(to_email, subj, msg):
        config = dotenv_values(".env")
        port = 587
        host = "smtp.gmail.com"

        my_email = config["email"]
        password = config["password"]

        receiver_email = to_email
        subject = subj
        body = msg

        message = MIMEMultipart()
        message["From"] = my_email
        message["To"] = receiver_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        try:
            server = smtplib.SMTP(host, port)
            server.connect(host, port)
            server.ehlo()
            server.starttls()
            server.login(my_email, password)
            server.sendmail(my_email, receiver_email, message.as_string())
            server.quit()
        except Exception as e:
            print(f"Error: {e}")

    def sendNewAppointment(to_email):
        subj = "Appointment request received"
        msg = "Thank you for requesting a new appointment. " \
        "We will send you an appointment shortly depending on the details."
        EmailSendingService.sendMail(to_email, subj, msg)

    
    def appointmentUpdated(to_email: str, time_of_appointment: Union[datetime, None]):
        if (isinstance(time_of_appointment, datetime)):
            day = time_of_appointment.strftime("%Y-%m-%d")
            time = time_of_appointment.strftime("%H:%M")
            subj = "Appointment received"
            msg = f"New appointment received {day}. Time: {time}"
            EmailSendingService.sendMail(to_email, subj, msg)
        else:
            subj = "Appointment updated"
            msg = "Your appointment changed. Please consider our last appointment invalid." \
            "We will send you soon a new appointment time."
            EmailSendingService.sendMail(to_email, subj, msg)


