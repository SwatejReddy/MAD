from celery import shared_task
import flask_excel as excel

from ..models import User, ServiceRequest
from .mail_service import send_email

@shared_task(ignore_result = False)
def service_requests_csv():
    service_requests = ServiceRequest.query.all()
    if len(service_requests)>0:
        column_names = [column.name for column in ServiceRequest.__table__.columns]
        csv_ouput = excel.make_response_from_query_sets(service_requests, column_names=column_names, file_type='csv')
        file_name = f"./backend/celery/user_downloads/all_service_requests.csv"
        with open(file_name, 'wb') as f:
            f.write(csv_ouput.data)
        return file_name
    
@shared_task(ignore_result = False)
def daily_mails():
    all_users = User.query.all()
    for user in all_users:
        send_email(f"{user.username}@gmail.com", "Daily Emails", f"""
            <h1> Hello User -> {user.username} </h1>
            <p> Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum, iste labore aspernatur illo ducimus laboriosam dignissimos eos quam earum sapiente incidunt quisquam cupiditate ut aliquid sit id quibusdam. Cum obcaecati soluta ea voluptatum ipsa tenetur, reprehenderit voluptatem quia nam officiis! Quibusdam, excepturi doloremque fuga nihil veritatis id expedita facere deleniti.</p>
        """
        )
    return "daily mails sent successfully"

@shared_task(ignore_result= False)
def monthly_report_mails():
    # query tables 
    # looop through the list 
    # use conditions to check user roles 
    # store whatever data you want to store in variables 
    # use the send email function to send email to users (first parameter will be to whom you are sending mail i.e. user.email)
    #                                                    (second parameter will be the subeject of the email it can be anything)
    #                                                    (the thrid parameter will be formatted string of the body use html tags)
    # see the daily mails function above to get some clarity 
    all_users = User.query.all()
    for user in all_users:
        send_email(f"{user.username}@gmail.com", "Daily Emails", f"""
            <h1> Hello User -> {user.username} </h1>
            <p> Lorem, ipsum dolor sit amet consectetur adipisicing elit. Harum, iste labore aspernatur illo ducimus laboriosam dignissimos eos quam earum sapiente incidunt quisquam cupiditate ut aliquid sit id quibusdam. Cum obcaecati soluta ea voluptatum ipsa tenetur, reprehenderit voluptatem quia nam officiis! Quibusdam, excepturi doloremque fuga nihil veritatis id expedita facere deleniti.</p>
        """
        )
    return "monthly report mails sent successfully"