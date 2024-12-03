from flask import Flask
from flask_login import login_required
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from backend.sec import datastore
from backend.cache import cache
from backend.resources import api
import flask_excel as excel
from celery.schedules import crontab
from backend.celery.celery_factory import celery_init_app
from backend.celery.tasks import daily_mails, monthly_report_mails, service_requests_csv




def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)
    cache.init_app(app)

    # excel init
    excel.init_excel(app)

    # model init
    db.init_app(app)
    
    # flask-restful init
    api.init_app(app)

    #flask security
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    app.app_context().push()

    return app

app = createApp()
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def celery_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=23, minute=19), #This task will get executed every day at 12:30 PM it uses 24 hour format
        daily_mails.s() #This function will get executed you have to write funtion name and add ".s()" after it and that function will get executed
        )
    sender.add_periodic_task(
        crontab(hour=12, minute=30, day_of_month=15), # this task will get executed every month at 12:30 PM 
        monthly_report_mails.s() # this function will get executed every month
    )
    # you can add multiple tasks by using "sender.add_periodic_task()" and pass the crontab and the function to be executed in it 


import backend.create_initial_data

import backend.routes


if (__name__ == '__main__'):
    app.run()