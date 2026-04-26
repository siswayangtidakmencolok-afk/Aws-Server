# 🏥 Product Requirements Document (PRD)
## Nusantara Telemedicine Portal


## 1. 🎯 Objective

Membangun platform telemedicine berbasis serverless yang memungkinkan pengguna untuk:

- Melihat jadwal dokter
- Melakukan booking konsultasi
- Mengunggah dokumen medis
- Melakukan chat real-time dengan dokter
- Menerima notifikasi otomatis

Sistem harus memenuhi prinsip:
- High Availability
- Secure by Design
- Event-Driven Architecture
- Cost Optimization


## 2. 👥 User Roles

### 👤 Patient
- Login ke sistem
- Melihat daftar dokter
- Melakukan booking appointment
- Upload dokumen medis
- Chat dengan dokter

### 👨‍⚕️ Doctor
- Melihat jadwal konsultasi
- Melihat data pasien
- Melakukan chat dengan pasien

---

## 3. 🔁 User Flow

### Booking Flow
```

Login → Pilih dokter → Booking → Simpan ke DB → Kirim ke SQS → Notifikasi

```

### Upload Flow
```

Request Upload URL → Upload ke S3 → Trigger Lambda → SQS → Notifikasi

```

### Chat Flow
```

Connect WebSocket → Kirim pesan → Simpan ke DynamoDB

````

---

## 4. 🧱 System Architecture

### Services:
- API Gateway (REST & WebSocket)
- AWS Lambda (7 functions)
- Amazon RDS PostgreSQL
- Amazon DynamoDB
- Amazon S3
- Amazon SQS (2 Queue)
- Amazon SNS
- AWS IAM
- AWS SSM Parameter Store
- Amazon CloudWatch
- AWS Amplify (Frontend)

---

## 5. 📦 Data Model

### PostgreSQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT,
  password TEXT,
  role TEXT
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  name TEXT,
  specialization TEXT
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id INT,
  doctor_id INT,
  schedule TIMESTAMP,
  status TEXT
);

CREATE TABLE medical_documents (
  id SERIAL PRIMARY KEY,
  user_id INT,
  file_url TEXT,
  created_at TIMESTAMP
);
````

---

### DynamoDB

**Table Name:** `chat_sessions`

| Partition Key | Sort Key  |
| ------------- | --------- |
| session_id    | timestamp |

---

## 6. 🔐 Security Requirements

* JWT Authentication
* API Gateway Custom Authorizer
* IAM Least Privilege
* RDS berada di private subnet
* S3 tidak public
* Semua secret disimpan di SSM Parameter Store

---

## 7. 🗃️ SSM Parameter Store

Path:

```
/lks/telemedicine/db/*
```

Keys:

* db_host
* db_user
* db_pass
* db_name
* jwt_secret

---

## 8. 🪣 S3 Storage

**Bucket:**

```
lks-{namaPeserta}-telemedicine
```

**Folder:**

```
medical-documents/
```

### Lifecycle:

* 90 hari → Glacier
* 365 hari → Delete

### Event:

* Trigger Lambda saat upload

---

## 9. 🔄 SQS Configuration

### Queue 1: Booking Queue

```
lks-queue-booking
```

* Visibility Timeout: 30 detik
* Retention: 4 hari
* DLQ: Required

---

### Queue 2: Document Queue

```
lks-queue-document
```

* Trigger dari S3 event
* Retention: 2 hari

---

## 10. ⚡ Lambda Functions

| Function Name | Description             |
| ------------- | ----------------------- |
| auth          | Generate JWT            |
| doctor        | Get doctor list         |
| booking       | Create appointment      |
| upload        | Generate pre-signed URL |
| document      | Process uploaded file   |
| notification  | Send notification (SNS) |
| chat          | Handle WebSocket        |

---

## 11. 🌐 API Specification

### Auth

#### POST `/auth/login`

Request:

```json
{
  "email": "user@mail.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token"
}
```

---

### Doctor

#### GET `/doctor`

Response:

```json
[
  {
    "id": 1,
    "name": "Dr. Budi"
  }
]
```

---

### Appointment

#### POST `/appointment`

```json
{
  "doctor_id": 1,
  "schedule": "2026-01-01 10:00"
}
```

---

### Upload

#### POST `/upload-url`

Response:

```json
{
  "url": "presigned-url"
}
```

---

## 12. 🔄 Event Flow

### Booking Flow

```
API → Lambda → RDS → SQS → Lambda → SNS
```

### Document Flow

```
S3 → Lambda → SQS → Lambda → SNS
```

### Chat Flow

```
WebSocket → Lambda → DynamoDB
```

---

## 13. 🗂️ Project Structure

```
telemedicine/
│
├── backend/
│   ├── template.yaml
│   ├── src/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── doctor/
│   │   ├── upload/
│   │   ├── document/
│   │   ├── notification/
│   │   ├── websocket/
│   │
│   └── shared/
│       └── db.js
│
└── frontend/
    └── vue3-app/
```

---

## 14. 🚀 Deployment

### Backend (AWS SAM)

```bash
sam build
sam deploy --guided
```

### Frontend (Amplify)

```bash
npm install
npm run build
amplify publish
```

---

## 15. 📊 Monitoring

* CloudWatch Logs
* CloudWatch Metrics
* Alarm:

  * Lambda error rate
  * SQS queue backlog
  * API latency

---

## 16. ✅ Acceptance Criteria

* Login berhasil
* Booking tersimpan di database
* File upload berhasil ke S3
* S3 trigger Lambda berjalan
* SQS memproses data dengan benar
* Notifikasi terkirim
* Chat real-time berjalan
* API aman dengan JWT
* Tidak ada resource yang public tanpa kontrol

---


## 17. 🧠 Notes

* Gunakan naming convention:

```
lks-{service}-{namaPeserta}
```

* Pastikan semua resource:

  * Memiliki tag
  * Tidak ada yang tidak terpakai
  * Tidak ada akses public yang tidak perlu

---

