# 🏥 Nusantara Telemedicine Portal

Platform telemedicine berbasis serverless yang memungkinkan pasien untuk berkonsultasi online dengan dokter spesialis, melakukan booking appointment, upload dokumen medis, dan chat real-time.

## 🏗️ Arsitektur

- **Frontend**: Vue 3 + Vite + Pinia + Vue Router
- **Backend**: AWS SAM (Serverless Application Model)
- **Database**: PostgreSQL (RDS) + DynamoDB
- **Storage**: Amazon S3 (medical documents)
- **Queue**: Amazon SQS (booking & document events)
- **Notification**: Amazon SNS
- **Auth**: JWT (Custom API Gateway Authorizer)
- **Chat**: WebSocket via API Gateway

## 📁 Struktur Project

```
telemedicine/
├── backend/               # AWS SAM serverless backend
│   ├── template.yaml      # SAM template (infrastructure as code)
│   ├── package.json
│   ├── shared/            # Shared utilities
│   │   ├── db.js          # PostgreSQL connection
│   │   ├── auth-utils.js  # JWT helpers
│   │   └── response.js    # API response builder
│   └── src/
│       ├── auth/          # Login & JWT authorizer
│       ├── doctor/        # Doctor listing
│       ├── booking/       # Appointment CRUD
│       ├── upload/        # S3 presigned URL
│       ├── document/      # S3 event processor
│       ├── notification/  # SQS → SNS
│       └── websocket/     # WebSocket chat
│
├── frontend/              # Vue 3 SPA
│   ├── src/
│   │   ├── views/         # Login, Dashboard, Doctors, etc.
│   │   ├── components/    # Sidebar, Navbar
│   │   ├── stores/        # Pinia auth store
│   │   ├── services/      # API & WebSocket services
│   │   └── assets/        # CSS design system
│   ├── index.html
│   └── vite.config.js
│
├── database/              # SQL scripts
│   ├── init.sql           # Schema creation
│   └── seed.sql           # Sample data
│
└── docker-compose.yml     # Local dev (PostgreSQL + DynamoDB)
```

## 🚀 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) (untuk deployment)

### 1. Jalankan Database Lokal

```bash
docker-compose up -d
```

Ini akan menjalankan:
- **PostgreSQL** di `localhost:5432`
- **DynamoDB Local** di `localhost:8000`
- **DynamoDB Admin** di `localhost:8001`

### 2. Install & Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`.

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Test Backend Lokal (SAM)

```bash
cd backend
sam local start-api --docker-network telemedicine-network
```

## 🔑 Demo Login

| Email | Password | Role |
|-------|----------|------|
| `patient1@mail.com` | `123456` | Pasien |
| `dr.budi@mail.com` | `123456` | Dokter |

## 🌐 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | ❌ | Login & get JWT |
| POST | `/auth/register` | ❌ | Register account |
| GET | `/doctor` | ✅ | List doctors |
| GET | `/doctor/{id}` | ✅ | Get doctor by ID |
| POST | `/appointment` | ✅ | Create appointment |
| GET | `/appointment` | ✅ | List appointments |
| POST | `/upload-url` | ✅ | Get S3 presigned URL |
| GET | `/chat/{sessionId}` | ✅ | Get chat history |

## 🚢 Deployment ke AWS

### Backend

```bash
cd backend
sam build
sam deploy --guided
```

### Frontend

Update `VITE_API_URL` dan `VITE_WS_URL` di `.env` dengan URL dari SAM output, lalu:

```bash
cd frontend
npm run build
```

Deploy folder `dist/` ke AWS Amplify atau S3 + CloudFront.

## 📊 Monitoring

- **CloudWatch Logs** — Semua Lambda function logs
- **CloudWatch Alarms** — Lambda error rate & SQS backlog
- **DynamoDB Admin** — Browse chat data di `localhost:8001`

## 🔒 Security

- JWT Authentication dengan custom API Gateway authorizer
- S3 bucket tidak public (Block Public Access enabled)
- S3 encryption (AES-256)
- RDS di private subnet
- Semua secrets disimpan di SSM Parameter Store
- IAM least privilege per Lambda function

## 📝 Naming Convention

```
lks-{service}-peserta
```

Ganti `peserta` dengan nama peserta masing-masing.
