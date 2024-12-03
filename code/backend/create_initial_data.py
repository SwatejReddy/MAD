from flask import current_app as app
from backend.models import *
from flask_security import SQLAlchemyUserDatastore, hash_password
from backend.sec import datastore

with app.app_context():
    db.create_all()

    # Create roles
    datastore.find_or_create_role(name='admin', description='The user is admin')
    datastore.find_or_create_role(name='customer', description='The user is customer')
    datastore.find_or_create_role(name='professional', description='The user is service professional')

    # Check and create users explicitly as their subclasses
    if not User.query.filter_by(username='admin').first():
        admin = Admin(
            username='admin',
            password=hash_password('admin'),
            roles=[datastore.find_or_create_role('admin')]
        )
        db.session.add(admin)

    if not User.query.filter_by(username='customer').first():
        customer = Customer(
            username='customer',
            password=hash_password('customer'),
            roles=[datastore.find_or_create_role('customer')],
            name="John Customer",
            address="123 Main St",
            contact_number="1234567890"
        )
        db.session.add(customer)

    if not User.query.filter_by(username='professional').first():
        professional = ServiceProfessional(
            username='professional',
            password=hash_password('professional'),
            roles=[datastore.find_or_create_role('professional')],
            name="Jane Professional",
            service_id=1,
            experience_years=5,
            location="New York"
        )
        db.session.add(professional)

    db.session.commit()