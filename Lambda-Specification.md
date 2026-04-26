# Spesifikasi Teknis: Lambda Functions (Nusantara Telemedicine)

Dokumen ini berisi spesifikasi teknis untuk setiap Lambda Function yang harus dikembangkan oleh peserta. 

---

## 🏗️ Standar Umum
- **Runtime**: `nodejs20.x`
- **Memory**: `256 MB` | **Timeout**: `30 seconds`
- **Jaringan**: VPC (Private Subnets) untuk akses RDS.

---

## 1. Pemetaan API & Execution Lambda (REST)

Peserta wajib memastikan setiap endpoint terhubung ke fungsi Lambda yang tepat dengan konfigurasi berikut:

| Resource | Method | Authorizer | CORS | Service Type | Execution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | `NONE` | `Yes` | `Lambda` | `lks-auth-peserta` |
| `/auth/register` | `POST` | `NONE` | `Yes` | `Lambda` | `lks-auth-peserta` |
| `/doctor` | `GET` | `lks-auth` | `Yes` | `Lambda` | `lks-doctor-peserta` |
| `/doctor/{id}` | `GET` | `lks-auth` | `Yes` | `Lambda` | `lks-doctor-peserta` |
| `/appointment` | `POST` | `lks-auth` | `Yes` | `Lambda` | `lks-booking-peserta` |
| `/appointment` | `GET` | `lks-auth` | `Yes` | `Lambda` | `lks-booking-peserta` |
| `/upload-url` | `POST` | `lks-auth` | `Yes` | `Lambda` | `lks-upload-peserta` |
| `/chat/{sessionId}` | `GET` | `lks-auth` | `Yes` | `Lambda` | `lks-chat-history-peserta` |

---

## 2. Pemetaan WebSocket & Background Process

| Trigger | Event | Service Type | Execution | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **WebSocket** | `$connect` | `Lambda` | `lks-ws-connect` | Simpan koneksi ke DynamoDB. |
| **WebSocket** | `$disconnect` | `Lambda` | `lks-ws-disconnect` | Hapus koneksi dari DynamoDB. |
| **WebSocket** | `sendMessage` | `Lambda` | `lks-ws-sendmessage` | Relay pesan & simpan sejarah. |
| **S3 Bucket** | `ObjectCreated` | `Lambda` | `lks-document-proc` | Trigger setelah upload dokumen. |
| **SQS Queue** | `Message` | `Lambda` | `lks-notification` | Konsumsi pesan untuk kirim SNS. |

---

## 3. Detail Konfigurasi Tambahan

### Modul Autentikasi
- **`lks-auth` (Authorizer)**: Peserta harus mengimplementasikan Lambda Authorizer tipe `TOKEN` atau `REQUEST` yang memvalidasi header `Authorization: Bearer <JWT>`.

### Variabel Lingkungan (Environment Variables)
Semua fungsi wajib dikonfigurasi dengan variabel berikut sesuai kebutuhannya:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` (via SSM/Secrets).
- `JWT_SECRET` untuk modul Auth.
- `S3_BUCKET` untuk modul Dokumen.
- `BOOKING_QUEUE_URL` dan `SNS_TOPIC_ARN` untuk modul Notifikasi.

### Kebijakan Akses (IAM Policies)
Peserta harus melampirkan kebijakan akses minimal berikut:
- `AWSLambdaVPCAccessExecutionRole`
- `AmazonSSMReadOnlyAccess`
- `AmazonS3CrudPolicy` (hanya untuk fungsi terkait S3)
- `DynamoDBCrudPolicy` (hanya untuk fungsi Chat)
