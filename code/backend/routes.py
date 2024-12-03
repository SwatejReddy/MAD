from flask import current_app as app, jsonify, render_template, request, send_file
from flask_security import auth_required, roles_required, hash_password, verify_password, roles_accepted, current_user
from .models import *
from .sec import datastore
from backend.cache import cache
from celery.result import AsyncResult
from .celery.tasks import service_requests_csv


# datastore = app.security.datastore

@app.route('/')
def home():
    return render_template('index.html')

@app.get('/protected')
@auth_required('token')
def protected():
    return '<h1> only accessible by auth user</h1>'

@app.post('/login')
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(username, password)
    if not username or not password:
        print(1)
        return jsonify({"message" : "invalid inputs"}), 404
    user = datastore.find_user(username = username)
    if not user:
        print(2)
        return jsonify({"message" : "invalid username"}), 404
    if verify_password(password, user.password):
        print(3)
        return jsonify({'token' : user.get_auth_token(), 'username' : user.username, 'role' : user.roles[0].name, 'id' : user.id, 'approved': user.approved})
    print(4)
    return jsonify({'message' : 'password wrong'}), 400

@app.post('/admin/login')
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message" : "invalid inputs"}), 404
    user = datastore.find_user(username = username)
    if not user:
        return jsonify({"message" : "invalid username"}), 404
    if verify_password(password, user.password) and user.roles[0].name == 'admin':
        return jsonify({'token' : user.get_auth_token(), 'username' : user.username, 'role' : user.roles[0].name, 'id' : user.id})
    return jsonify({'message' : 'password wrong'}), 400

@app.post('/customer/register')
def customer_register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    address = data.get('address')
    contact_number = data.get('contact_number')
    if not username or not password or not name or not address or not contact_number:
        return jsonify({"message" : "invalid inputs"}), 404
    if datastore.find_user(username = username):
        return jsonify({"message" : "username already exists"}), 404
    user = Customer(
        name = name,
        username = username,
        password = hash_password(password),
        roles = [datastore.find_or_create_role('customer')],
        address = address,
        contact_number = contact_number,
        user_type = 'customer'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message" : "customer created"}), 200

@app.post('/professional/register')
def professional_register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    service_id = data.get('service_id')
    experience_years = data.get('experience_years')
    location = data.get('location')
    description = data.get('description')
    if not username or not password or not name or not service_id or not experience_years or not location:
        return jsonify({"message" : "invalid inputs"}), 404
    if datastore.find_user(username = username):
        return jsonify({"message" : "username already exists" }), 404
    user = ServiceProfessional(
        name = name,
        username = username,
        password = hash_password(password),
        roles = [datastore.find_or_create_role('professional')],
        service_id = service_id,
        description = description,
        approved = False,
        experience_years = experience_years,
        location = location,
        user_type = 'service_professional'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message" : "professional created"}), 200

@app.post('/admin/service/new')
@roles_required('admin')
@auth_required('token')
def create_service():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    base_price = data.get('base_price')
    estimated_time = data.get('estimated_time')
    if not name or not base_price or not estimated_time:
        return jsonify({"message" : "invalid inputs"}), 404
    service = Service(
        name = name,
        description = description,
        base_price = base_price,
        estimated_time = estimated_time,
        created_at = datetime.now()
    )
    db.session.add(service)
    db.session.commit()
    return jsonify({"message" : "service created"}), 200

@app.post('/admin/service/edit/<int:service_id>')
@roles_required('admin')
@auth_required('token')
def edit_service(service_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    base_price = data.get('base_price')
    estimated_time = data.get('estimated_time')
    service = Service.query.filter_by(id = service_id, deleted=False).first()
    if not service:
        return jsonify({"message" : "invalid inputs"}), 404
    if name:
        service.name = name
    if description:
        service.description = description
    if base_price:
        service.base_price = base_price
    if estimated_time:
        service.estimated_time = estimated_time
    db.session.commit()
    return jsonify({"message" : "service updated"}), 200

@app.delete('/admin/service/delete/<int:service_id>')
@roles_required('admin')
@auth_required('token')
def delete_service(service_id):
    service = Service.query.filter_by(id = service_id, deleted=False).first()
    if not service:
        return jsonify({"message" : "invalid inputs"}), 404
    active_service_requests = ServiceRequest.query.filter_by(service_id = service_id, service_status = 'requested' or 'assigned').all()
    if active_service_requests:
        return jsonify({"message" : "service has active requests"}), 404
    service.deleted = True
    db.session.commit()
    return jsonify({"message" : "service deleted"}), 200

@app.post('/admin/professional/approve/<int:professional_id>')
@roles_required('admin')
@auth_required('token')
def approve_professional(professional_id):
    professional = ServiceProfessional.query.filter_by(id = professional_id).first()
    if not professional:
        return jsonify({"message" : "invalid inputs"}), 404
    if professional.approved:
        return jsonify({"message" : "professional already approved"}), 404
    professional.approved = True
    db.session.commit()
    return jsonify({"message" : "professional approved"}), 200

@app.post("/admin/service-professional/block-or-approve/<int:service_professional_id>")
@roles_required("admin")
@auth_required("token")
def block_approve_service_professional(service_professional_id):
    professional = ServiceProfessional.query.filter_by(id=service_professional_id).first()
    if not professional:
        return jsonify({"message" : "Professional not found"}), 400
    if professional.approved:
        professional.approved = False
        db.session.commit()
        return jsonify({"message" : "blocked"}), 200
    else:
        professional.approved = True
        db.session.commit()
        return jsonify({"message" : "approved"}), 200
    
@app.post("/admin/customer/block-or-approve/<int:customer_id>")
@roles_required("admin")
@auth_required("token")
def block_approve_customer(customer_id):
    customer = Customer.query.filter_by(id=customer_id).first()
    if not customer:
        return jsonify({"message" : "Customer not found"}), 400
    if customer.approved:
        customer.approved = False
        db.session.commit()
        return jsonify({"message" : "blocked"}), 200
    else:
        customer.approved = True
        db.session.commit()
        return jsonify({"message" : "approved"}), 200

# Customer APIs:
@app.post('/customer/service-request/new/<int:professional_id>')
@roles_required('customer')
@auth_required('token')
def create_service_request(professional_id):
    body = request.get_json()
    date_of_completion_str = body.get('date_of_completion')
    # Parse the ISO string into a datetime object
    date_of_completion = datetime.fromisoformat(date_of_completion_str.replace('Z', '+00:00')) if date_of_completion_str else None
    remarks = body.get('remarks')
    user_id = current_user.id
    professional = ServiceProfessional.query.filter_by(id = professional_id).first()
    service_id = professional.service_id

    print("DOC", date_of_completion)  # This will now print a datetime object

    # Rest of your code remains the same
    user = User.query.filter_by(id = user_id).first()
    service = Service.query.filter_by(id = service_id, deleted=False).first()
    professional = ServiceProfessional.query.filter_by(id = professional_id, approved=True).first()
    if not service or not professional:
        return jsonify({"message" : "invalid inputs"}), 404
    if professional.service_id != service_id:
        return jsonify({"message" : "service not provided by professional"}), 404
    service_request = ServiceRequest(
        service_id = service_id,
        customer_id = user.id,
        professional_id = professional_id,
        date_of_request = datetime.now(),
        date_of_completion = date_of_completion,
        remarks = remarks
    )
    db.session.add(service_request)
    db.session.commit()
    # clear the cache
    cache.clear()
    return jsonify({"message" : "service request created"}), 200

@app.post('/customer/service-request/update/<int:request_id>')
@roles_required('customer')
@auth_required('token')
def update_service_request_customer(request_id):
    body = request.get_json()
    date_of_completion = body.get('date_of_completion')
    remarks = body.get('remarks')
    user_id = current_user.id
    service_request = ServiceRequest.query.filter_by(id = request_id).first()
    if not service_request:
        return jsonify({"message" : "invalid inputs"}), 404
    if service_request.customer_id != user_id:
        print(service_request.customer_id, user_id)
        return jsonify({"message" : "not authorized"}), 404
    if date_of_completion:
        service_request.date_of_completion = datetime.fromisoformat(date_of_completion.replace("Z", "+00:00"))
    if remarks:
        service_request.remarks = remarks
    db.session.commit()
    cache.clear()
    return jsonify({"message" : "service request updated"}), 200

@app.post('/customer/service-request/close/<int:request_id>')
@roles_required('customer')
@auth_required('token')
def close_service_request_customer(request_id):
    body = request.get_json()
    user_id = current_user.id
    rating = body.get('rating')
    service_request = ServiceRequest.query.filter_by(id = request_id).first()
    if not service_request:
        return jsonify({"message" : "invalid inputs"}), 404
    if service_request.customer_id != user_id:
        print(service_request.customer_id, user_id)
        return jsonify({"message" : "not authorized"}), 404
    if service_request.service_status == 'completed':
        return jsonify({"message" : "service request already completed"}), 404
    service_request.service_status = 'completed'
    service_professional = ServiceProfessional.query.filter_by(id = service_request.professional_id).first()
    if rating:
        all_service_requests = ServiceRequest.query.filter_by(professional_id = service_professional.id)
        rating_sum = 0
        rating_count = 0
        for service_request_item in all_service_requests:
            if service_request_item.rating:
                rating_sum += service_request_item.rating
                rating_count += 1
        service_professional.rating = (rating_sum + rating) / (rating_count + 1)
        service_request.rating = rating        
    db.session.commit()
    return jsonify({"message" : "service request closed"}), 200

@app.get('/customer/service-requests/<int:customer_id>/all')
@auth_required('token')
@cache.cached(timeout=5)
def get_service_requests_customer(customer_id):
    service_requests = ServiceRequest.query.filter_by(customer_id = customer_id).all()
    return jsonify([service_request.serialize() for service_request in service_requests]), 200

#Service Professional:
@app.get('/professional/service-requests/<int:professional_id>/all')
@auth_required('token')
@cache.cached(timeout=5)
def get_service_requests(professional_id):
    service_requests = ServiceRequest.query.filter_by(professional_id = professional_id).all()
    return jsonify([service_request.serialize() for service_request in service_requests]), 200

@app.post('/professional/service-request/<string:action>/<int:request_id>')
@roles_required('professional')
@auth_required('token')
def update_service_request_status_professional(action, request_id):
    user_id = current_user.id
    print(user_id)
    service_request = ServiceRequest.query.filter_by(id = request_id).first()
    if not service_request:
        return jsonify({"message" : "invalid inputs"}), 404
    if str(service_request.professional_id) != str(user_id):
        return jsonify({"message" : "not authorized"}), 404
    if service_request.service_status == 'assigned' and action == 'close':
        service_request.service_status = 'closed'
    if action == 'accept':
        service_request.service_status = 'assigned'
    elif action == 'reject':
        service_request.service_status = 'rejected'
    db.session.commit()
    return jsonify({"message" : f"service request {action}ed"}), 200

@app.get("/search/professionals/<string:search_type>/<string:search_query>")
@auth_required('token')
def get_professionals_based_on_query(search_type, search_query):
    if search_type == "name":
        professionals = db.session.query(ServiceProfessional).join(Service).filter(ServiceProfessional.service_id==Service.id, Service.name.contains(search_query), ServiceProfessional.approved==True).all()
    elif search_type == "location":
        professionals = ServiceProfessional.query.filter(
            ServiceProfessional.location.contains(search_query),
            ServiceProfessional.approved == True).all()
    else:
        return jsonify({"message" : "Enter a valid query"})
    # professionals = ServiceProfessional.query.filter_by(name="Virat Kohli")
    return jsonify([professional.serialize() for professional in professionals]), 200

@app.get("/services/all")
def get_all_services():
    services = Service.query.filter_by(deleted=False).all()
    return jsonify([service.serialize() for service in services]), 200

@app.get('/generate-csv')
def generate_csv():
    task = service_requests_csv.delay()
    return {'task_id' : task.id}, 200

@app.get('/download-csv/<task_id>')
def download_csv(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        return send_file(result.result), 200
    
@app.get('/admin/search/customers/<string:query>')
@roles_required('admin')
@auth_required('token')
def get_all_customers(query):
    # query based search
    customers = Customer.query.filter(Customer.name.contains(query)).all()
    return jsonify([customer.serialize() for customer in customers]), 200

@app.get('/admin/search/professionals/<string:query>')
@roles_required('admin')
@auth_required('token')
def get_all_professionals(query):
    professionals = ServiceProfessional.query.filter(ServiceProfessional.name.contains(query)).all()
    return jsonify([professional.serialize() for professional in professionals]), 200