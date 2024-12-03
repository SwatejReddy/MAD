# MAD — Household Services Application

A full-stack household services marketplace built for the **Modern Application Development (MAD-2)** course. Service professionals sign up and offer services, customers search for professionals and book them, and an admin manages the whole platform.

📄 [Project report](report.pdf) · 🎥 [Presentation video](https://drive.google.com/file/d/1oG-OX1umsy9H2tmr1wybzI_d5QFR-THW/view?usp=drive_link)

---

## Features

### 👤 Customers
- Register and log in
- Browse all available services
- Search for professionals by **service name** or **location**
- Book a professional, then update or close the request
- Rate and leave remarks on completed requests

### 🛠️ Service Professionals
- Register with service type, experience and location
- Can't use the platform until an admin approves them
- View incoming service requests and **accept**, **reject** or **close** them

### 🛡️ Admin
- Create, edit and soft-delete services. A service with active requests can't be deleted.
- Approve, block or unblock professionals and customers
- Search customers and professionals
- Export all service requests to **CSV** (generated asynchronously by Celery)

### ⚙️ Background Jobs
- **Daily reminder emails** to users (Celery Beat)
- **Monthly report emails** (Celery Beat)
- **Async CSV export** of service requests

---

## Tech Stack

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Backend        | Flask, Flask-RESTful                         |
| ORM / Database | Flask-SQLAlchemy, SQLite                     |
| Auth           | Flask-Security-Too (token-based, role-based) |
| Caching        | Flask-Caching + Redis                        |
| Background     | Celery + Redis (broker & result backend)     |
| Exports        | Flask-Excel                                  |
| Frontend       | Vue 2, Vue Router, Vuex (via CDN)            |
| Styling        | Bootstrap 4                                  |

---

## Project Structure

```
code/
├── app.py                     # App factory, Celery init, periodic task schedule
├── requirements.txt
├── instance/
│   └── database.sqlite3       # SQLite database
├── backend/
│   ├── config.py              # App configuration
│   ├── models.py              # User, Admin, Customer, ServiceProfessional, Service, ServiceRequest
│   ├── routes.py              # REST endpoints
│   ├── resources.py           # Flask-RESTful API setup
│   ├── sec.py                 # Flask-Security datastore
│   ├── cache.py               # Cache instance
│   ├── create_initial_data.py # Seeds roles and default users
│   └── celery/
│       ├── celery_factory.py  # Celery config bound to the Flask app context
│       ├── tasks.py           # CSV export + scheduled emails
│       └── mail_service.py    # SMTP mail helper
└── frontend/
    ├── index.html             # SPA entry point
    ├── app.js                 # Vue root instance
    ├── components/            # Navbar
    ├── pages/                 # Dashboards, login/register, search, requests
    └── utils/router.js        # Client-side routes
```

---

## Data Model

```
User ──┬── Admin
       ├── Customer ───────────┐
       └── ServiceProfessional ┤
                 │             │
              Service ── ServiceRequest
```

- **User**: base table that uses single-table polymorphism (`user_type`) and roles through `UserRoles`.
- **Service**: name, description, base price, estimated time. Deleting a service only marks it as deleted.
- **ServiceRequest**: links a customer, a professional and a service. Its status moves through `requested → assigned → closed`, or ends at `rejected`. It also stores completion date, remarks and rating.

---

## Getting Started

### Prerequisites
- Python 3.10+
- [Redis](https://redis.io/), running on `localhost:6379`
- [MailHog](https://github.com/mailhog/MailHog) (or any SMTP server) on `localhost:1025`, needed for the email jobs

### Setup

```bash
git clone https://github.com/SwatejReddy/MAD.git
cd MAD/code

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run

Run each command from the `code/` directory in its own terminal:

```bash
# 1. Redis
redis-server

# 2. Flask app → http://127.0.0.1:5000
python app.py

# 3. Celery worker
celery -A app:celery_app worker -l info

# 4. Celery beat (scheduled emails)
celery -A app:celery_app beat -l info

# 5. MailHog (web UI at http://localhost:8025)
mailhog
```

### Default Accounts

These accounts are created automatically on first run:

| Role         | Username       | Password       |
| ------------ | -------------- | -------------- |
| Admin        | `admin`        | `admin`        |
| Customer     | `customer`     | `customer`     |
| Professional | `professional` | `professional` |

---

## API Overview

| Method | Endpoint                                                    | Description                              |
| ------ | ----------------------------------------------------------- | ---------------------------------------- |
| POST   | `/login`                                                    | Log in as a customer or professional     |
| POST   | `/admin/login`                                              | Log in as admin                          |
| POST   | `/customer/register`                                        | Register a customer                      |
| POST   | `/professional/register`                                    | Register a service professional          |
| GET    | `/services/all`                                             | List all services                        |
| POST   | `/admin/service/new`                                        | Create a service                         |
| POST   | `/admin/service/edit/<service_id>`                          | Edit a service                           |
| DELETE | `/admin/service/delete/<service_id>`                        | Soft-delete a service                    |
| POST   | `/admin/professional/approve/<professional_id>`             | Approve a professional                   |
| POST   | `/admin/service-professional/block-or-approve/<id>`         | Block or unblock a professional          |
| POST   | `/admin/customer/block-or-approve/<id>`                     | Block or unblock a customer              |
| GET    | `/admin/search/customers/<query>`                           | Search customers                         |
| GET    | `/admin/search/professionals/<query>`                       | Search professionals                     |
| POST   | `/customer/service-request/new/<professional_id>`           | Create a service request                 |
| POST   | `/customer/service-request/update/<request_id>`             | Update a service request                 |
| POST   | `/customer/service-request/close/<request_id>`              | Close and rate a service request         |
| GET    | `/customer/service-requests/<customer_id>/all`              | Customer's service requests              |
| GET    | `/professional/service-requests/<professional_id>/all`      | Professional's service requests          |
| POST   | `/professional/service-request/<action>/<request_id>`       | `accept`, `reject` or `close` a request  |
| GET    | `/search/professionals/<name\|location>/<query>`            | Search approved professionals            |
| GET    | `/generate-csv`                                             | Start an async CSV export                |
| GET    | `/download-csv/<task_id>`                                   | Download the generated CSV               |

Protected endpoints expect the token in the `Authentication-Token` header.

---

## Author

**Swatej Reddy**: built for the IIT Madras BS Degree, Modern Application Development II.
