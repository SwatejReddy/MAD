from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime
from uuid import uuid4


db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    active = db.Column(db.Boolean(), default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid4()))
    
    user_type = db.Column(db.String(50), nullable=False, default='user')
    
    roles = db.relationship('Role', backref='users', secondary='user_roles')
    
    __mapper_args__ = {
        'polymorphic_identity': 'user',
        'polymorphic_on': user_type
    }

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False, unique=True)
    description = db.Column(db.String(), nullable=False)

class UserRoles(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    userId = db.Column(db.Integer(), db.ForeignKey('user.id'))
    roleId = db.Column(db.Integer(), db.ForeignKey('role.id'))

class Admin(User):
    id = db.Column(db.Integer(), db.ForeignKey('user.id'), primary_key=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'admin',
    }

class ServiceProfessional(User):
    id = db.Column(db.Integer(), db.ForeignKey('user.id'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    service_id = db.Column(db.Integer(), db.ForeignKey('service.id'), nullable=False)
    experience_years = db.Column(db.Integer(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    description = db.Column(db.String(500), nullable=True)
    approved = db.Column(db.Boolean(), default=False)
    location = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Float(), nullable=True) #TODO: Make it default = 0

    service = db.relationship('Service', back_populates='professionals')
    service_requests = db.relationship('ServiceRequest', back_populates='professional')

    __mapper_args__ = {
        'polymorphic_identity': 'service_professional',
    }

    def serialize(self):
        data ={
            "id": self.id,
            "name": self.name,
            "service_id": self.service_id,
            "experience_years": self.experience_years,
            "created_at": self.created_at.isoformat(),
            "description": self.description if self.description else None,
            "approved": self.approved,
            "location": self.location,
            "rating": self.rating
        }

        return data

class Customer(User):
    id = db.Column(db.Integer(), db.ForeignKey('user.id'), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    contact_number = db.Column(db.String(15), nullable=True)
    approved = db.Column(db.Boolean(), default=True)

    service_requests = db.relationship('ServiceRequest', back_populates='customer')

    __mapper_args__ = {
        'polymorphic_identity': 'customer',
    }

    def serialize(self):
        data ={
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "contact_number": self.contact_number,
            "approved": self.approved,
        }
        return data

class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    base_price = db.Column(db.Float(), nullable=False)
    estimated_time = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    deleted = db.Column(db.Boolean(), default=False)

    service_requests = db.relationship('ServiceRequest', back_populates='service')
    professionals = db.relationship('ServiceProfessional', back_populates='service')

    def serialize(self):
        data = {
            "id" : self.id,
            "name" : self.name,
            "description" : self.description,
            "base_price" : self.base_price,
            "estimated_time" : self.estimated_time,
            "created_at" : self.created_at,
            "deleted" : self.deleted,
        }
        return data



class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer(), db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer(), db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer(), db.ForeignKey('service_professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime(), nullable=False)
    date_of_completion = db.Column(db.DateTime(), nullable=True)
    service_status = db.Column(db.String(50), nullable=False, default='requested')
    remarks = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Integer(), nullable=True)

    service = db.relationship('Service', back_populates='service_requests')
    customer = db.relationship('Customer', back_populates='service_requests')
    professional = db.relationship('ServiceProfessional', back_populates='service_requests')

    def serialize(self, include_service=False, include_customer=False, include_professional=False):
        data = {
            "id": self.id,
            "service_id": self.service_id,
            "customer_id": self.customer_id,
            "professional_id": self.professional_id,
            "date_of_request": self.date_of_request.isoformat() if self.date_of_request else None,
            "date_of_completion": self.date_of_completion.isoformat() if self.date_of_completion else None,
            "service_status": self.service_status,
            "remarks": self.remarks,
            "rating": self.rating
        }

        return data


# from datetime import datetime
# from flask_sqlalchemy import SQLAlchemy
# from flask_security import UserMixin, RoleMixin

# db = SQLAlchemy()

# class User(db.Model, UserMixin):
#     id = db.Column(db.Integer, primary_key = True)
#     email = db.Column(db.String, unique = True, nullable = False)
#     password = db.Column(db.String, nullable = False)
#     # flask-security specific
#     fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
#     active = db.Column(db.Boolean, default = True)
#     roles = db.Relationship('Role', backref = 'bearers', secondary='user_roles')

# class Role(db.Model, RoleMixin):
#     id = db.Column(db.Integer, primary_key = True)
#     name = db.Column(db.String, unique = True, nullable  = False)
#     description = db.Column(db.String, nullable = False)

# class UserRoles(db.Model):
#     id = db.Column(db.Integer, primary_key = True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

# class Blog(db.Model):
#     id = db.Column(db.Integer, primary_key = True)
#     title = db.Column(db.String)
#     caption = db.Column(db.String)
#     image_url = db.Column(db.String)
#     timestamp = db.Column(db.DateTime, index = True, default = datetime.now())
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))