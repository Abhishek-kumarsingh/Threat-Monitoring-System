# 🛡️ Threat Analysis Platform

A comprehensive, enterprise-grade platform for real-time network threat analysis using machine learning. Built with modern microservices architecture featuring React + TypeScript frontend, Spring Boot backend, FastAPI ML service, and Docker containerization.

## 🌟 Features

### 🔐 Security & Authentication
- **JWT-based authentication** with role-based access control
- **Multi-role support**: Admin, Analyst, Viewer
- **Secure API endpoints** with Spring Security
- **CORS protection** and rate limiting

### 📊 Real-time Threat Analysis
- **Machine Learning-powered** threat detection using scikit-learn and XGBoost
- **Real-time alerts** via WebSocket connections
- **CSV log file upload** and automated processing
- **Interactive dashboards** with live threat feeds

### 🎯 Advanced Analytics
- **Threat type classification**: Malware, Phishing, DDoS, Brute Force, SQL Injection, XSS, and more
- **Risk scoring** with confidence levels
- **Geolocation analysis** of threat sources
- **Historical trend analysis** and reporting

### 🚨 Alert Management
- **Live alert system** with severity levels (Low, Medium, High, Critical)
- **Alert acknowledgment** and resolution tracking
- **Browser notifications** for critical threats
- **False positive management**

### 📈 Visualization & Reporting
- **Interactive charts** using Recharts
- **Threat heatmaps** and geographic visualization
- **Protocol distribution** analysis
- **Top threat sources** identification

## 🏗️ Architecture

### Microservices Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot    │    │   FastAPI ML    │
│   (Port 3000)    │◄──►│   Backend       │◄──►│    Service      │
│                 │    │  (Port 8080)    │    │  (Port 5000)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │     MySQL       │              │
         │              │   Database      │              │
         │              │  (Port 3306)    │              │
         │              └─────────────────┘              │
         │                                               │
         └───────────────────────────────────────────────┘
                            WebSocket
```

### Technology Stack

#### 🌐 Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for HTTP requests
- **SockJS + STOMP** for WebSocket connections

#### ⚙️ Backend
- **Spring Boot 3.x** with Java 17
- **Spring Security** with JWT authentication
- **Spring Data JPA** with MySQL
- **Spring WebSocket** for real-time communication
- **OpenFeign** for microservice communication
- **Maven** for dependency management

#### 🧠 ML Service
- **FastAPI** for high-performance async API
- **scikit-learn** and **XGBoost** for ML models
- **pandas** for data processing
- **pydantic** for data validation
- **uvicorn** as ASGI server

#### 🐳 Infrastructure
- **Docker** containerization
- **Docker Compose** for orchestration
- **MySQL 8.0** database
- **NGINX** reverse proxy (optional)
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd threat-analysis-platform
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables as needed
nano .env
```

### 3. Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **ML Service**: http://localhost:5000
- **Database**: localhost:3306

### 5. Default Login Credentials
```
Admin:    username: admin    | password: password
Analyst:  username: analyst  | password: password  
Viewer:   username: viewer   | password: password
```

## 🛠️ Development Setup

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
mvn spring-boot:run
```

### ML Service Development
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

## 📁 Project Structure

```
threat-analysis-platform/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API and WebSocket services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/threatanalysis/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic services
│   │   ├── repository/     # Data access layer
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── config/         # Configuration classes
│   │   ├── security/       # Security components
│   │   └── client/         # External service clients
│   └── pom.xml
├── ml-service/              # FastAPI ML service
│   ├── app/
│   │   ├── models/         # ML models and prediction logic
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── core/           # Core configuration
│   │   ├── utils/          # Utility functions
│   │   └── main.py         # FastAPI application
│   └── requirements.txt
├── database/               # Database initialization
│   └── init/              # SQL initialization scripts
├── nginx/                  # NGINX configuration
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## 🔧 Configuration

### Environment Variables
Key environment variables in `.env`:

```bash
# Database
DB_ROOT_PASSWORD=rootpassword
DB_NAME=threat_analysis_db
DB_USER=threat_user
DB_PASSWORD=threat_password

# JWT Security
JWT_SECRET=your-secret-key-here

# API URLs
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080/ws

# ML Service
ML_SERVICE_URL=http://ml-service:5000
```

### Database Schema
The application automatically creates the following main tables:
- `users` - User accounts and roles
- `log_entries` - Network log data
- `threat_predictions` - ML analysis results
- `live_alerts` - Real-time security alerts

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### ML Service Tests
```bash
cd ml-service
pytest
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Log Management
- `POST /api/logs/upload` - Upload CSV log file
- `GET /api/logs` - Get log entries (paginated)
- `GET /api/logs/stats/*` - Various statistics endpoints

### Threat Analysis
- `GET /api/threats` - Get threat predictions
- `GET /api/threats/stats/*` - Threat statistics
- `PUT /api/threats/{id}/false-positive` - Mark as false positive

### Alert Management
- `GET /api/alerts` - Get live alerts
- `PUT /api/alerts/{id}/acknowledge` - Acknowledge alert
- `PUT /api/alerts/{id}/resolve` - Resolve alert

## 🔒 Security Features

- **JWT Authentication** with configurable expiration
- **Role-based Access Control** (RBAC)
- **CORS Protection** with configurable origins
- **Rate Limiting** on sensitive endpoints
- **Input Validation** and sanitization
- **SQL Injection Protection** via JPA
- **XSS Protection** headers
- **Secure Headers** configuration

## 🚀 Production Deployment

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### HTTPS Configuration
1. Obtain SSL certificates
2. Update NGINX configuration
3. Configure environment variables for HTTPS

### Monitoring & Logging
- Application logs in `/app/logs`
- Health check endpoints at `/actuator/health`
- Metrics available via Spring Actuator

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for enterprise security teams**
