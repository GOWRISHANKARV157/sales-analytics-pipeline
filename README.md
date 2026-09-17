# Sales Data Processing & Analytics Pipeline

A full-stack sales data processing and analytics system that ingests bulk transaction data, validates and processes records concurrently using a worker pool, stores processed data in PostgreSQL, computes analytical metrics, and presents the results through an interactive React dashboard.

---

## 1. Project Overview

The Sales Analytics Pipeline is designed to process bulk sales transaction data efficiently and provide meaningful business analytics through a web-based dashboard.

### Core capabilities

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- User-specific uploads and reports
- CSV file upload
- Row-level validation
- Duplicate transaction detection
- Concurrent processing using a worker pool
- Derived `net_amount` calculation
- Processing progress tracking
- PostgreSQL persistence
- Revenue and transaction analytics
- Interactive charts and tables
- Top-5 transaction analysis
- Processed/annotated CSV download
- Upload ownership/security checks

The implementation follows a modular full-stack architecture with a React frontend and Node.js/Express backend.

---

## 2. Assessment Requirements Coverage

The assessment asks for a full-stack system that ingests bulk sales/transaction data, processes it concurrently, computes analytics, and presents the results on a dashboard.

### Authentication & User Management

| Requirement | Status |
| --- | --- |
| Sign up | Implemented |
| Login | Implemented |
| User-specific uploads/reports | Implemented |
| Hashed passwords | Implemented |
| JWT/session authentication | JWT implemented |
| Admin/user roles | Role field exists; full RBAC is not implemented |

### File Upload & Processing

| Requirement | Status |
| --- | --- |
| CSV upload | Implemented |
| JSON upload | Not implemented |
| Required-field validation | Implemented |
| Numeric validation | Implemented |
| Negative quantity/price validation | Implemented |
| Discount validation | Implemented |
| Date validation | Implemented |
| Future-date rejection | Implemented |
| Duplicate transaction IDs | Implemented |
| `net_amount` calculation | Implemented |
| Artificial processing delay | Implemented |

### Aggregation & Analytics

| Requirement | Status |
| --- | --- |
| Total revenue | Implemented |
| Revenue by region | Implemented |
| Revenue by category | Implemented |
| Average order value | Implemented |
| Median transaction value | Implemented |
| Top 5 transactions | Implemented |
| Daily revenue trend | Implemented |
| Monthly revenue trend | Not separately implemented |
| Discount impact/loss | Implemented |
| Standard deviation | Implemented |

### Concurrency & Processing

| Requirement | Status |
| --- | --- |
| Worker pool | Implemented |
| Concurrent row processing | Implemented |
| Manual processing after upload | Implemented |
| Re-run aggregation | Implemented |
| Background queue | Not implemented |
| Live progress | Implemented using polling |

### Database

| Requirement | Status |
| --- | --- |
| PostgreSQL | Implemented |
| Users | Implemented |
| Upload jobs/status | Implemented |
| Raw transactions | Implemented |
| Validation status | Implemented |
| Aggregate reports | Implemented |
| Query indexes | Implemented |

### Dashboard

| Requirement | Status |
| --- | --- |
| Upload UI | Implemented |
| Processing progress | Implemented |
| Row counters | Implemented |
| Revenue by region chart | Implemented |
| Revenue by category chart | Implemented |
| Revenue trend chart | Implemented |
| Top 5 table | Implemented |
| Processed/annotated CSV download | Implemented |
| WebSocket updates | Not implemented |

### Logging & Observability

| Requirement | Status |
| --- | --- |
| Upload/error/system logging | Basic application logging implemented |
| Structured JSON logs | Not implemented |
| Log levels | Not implemented as a formal logging system |
| Correlation IDs | Not implemented |
| Processing metrics | Not implemented |

---

## 3. Technology Stack

### Backend

- Node.js
- TypeScript
- Express.js
- Prisma ORM 8
- PostgreSQL
- JWT (`jsonwebtoken`)
- bcrypt
- Multer
- csv-parse
- Zod

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- Recharts
- CSS

### Development

- VS Code
- Git
- GitHub
- PowerShell

---

## 4. System Architecture

```text
                         ┌────────────────────────┐
                         │       React UI         │
                         │       Dashboard        │
                         └────────────┬───────────┘
                                      │
                                      │ REST API
                                      ▼
                         ┌────────────────────────┐
                         │    Express Backend     │
                         │                        │
                         │ Authentication         │
                         │ Upload APIs             │
                         │ Processing APIs         │
                         │ Analytics APIs          │
                         │ Download API            │
                         └────────────┬───────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌────────────┐   ┌──────────────┐  ┌────────────┐
             │ Upload     │   │ Worker Pool  │  │ Analytics  │
             │ Service    │   │ Processing   │  │ Service    │
             └────────────┘   └──────┬───────┘  └─────┬──────┘
                                     │                 │
                                     └────────┬────────┘
                                              ▼
                                  ┌─────────────────────┐
                                  │     PostgreSQL      │
                                  │                     │
                                  │ Users               │
                                  │ Uploads              │
                                  │ Transactions         │
                                  │ Analytics Reports    │
                                  │ Region Analytics     │
                                  │ Category Analytics   │
                                  │ Top Transactions     │
                                  │ Daily Revenue        │
                                  └─────────────────────┘
```

---

## 5. End-to-End Data Flow

```text
CSV Upload
    │
    ▼
Authentication / Ownership Check
    │
    ▼
Store Uploaded File + Create Upload Job
    │
    ▼
Parse CSV
    │
    ▼
Validate Rows
    │
    ├── Invalid ──────► Store INVALID + error message
    │
    ├── Duplicate ────► Store DUPLICATE
    │
    └── Valid
          │
          ▼
    Worker Pool
          │
          ▼
    Calculate net_amount
          │
          ▼
    Store Transaction
          │
          ▼
    Update Processing Counters
          │
          ▼
    COMPLETED
          │
          ▼
    Generate Analytics
          │
          ▼
    Dashboard + Download
```

---

## 6. Project Structure

```text
sales-analytics-pipeline/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── upload.ts
│   │   ├── controllers/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── download.controller.ts
│   │   │   ├── process.controller.ts
│   │   │   ├── status.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── uploads.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── prisma/
│   │   │   ├── contract.prisma
│   │   │   ├── contract.d.ts
│   │   │   ├── contract.json
│   │   │   └── db.ts
│   │   ├── routes/
│   │   │   └── upload.routes.ts
│   │   ├── services/
│   │   │   ├── analytics.service.ts
│   │   │   ├── upload.service.ts
│   │   │   └── workerPool.ts
│   │   ├── utils/
│   │   │   ├── auth.ts
│   │   │   └── delay.ts
│   │   └── app.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts
│   │   ├── components/
│   │   │   └── Dashboard.tsx
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── sample-data/
│   ├── sales_dashboard_test.csv
│   └── sales_valid_test.csv
│
├── README.md
└── .gitignore
```

---

## 7. Database Design

The system uses PostgreSQL for persistent relational storage.

### User

Stores:

- `id`
- `name`
- `email`
- hashed `password`
- `role`
- `createdAt`
- `updatedAt`

### Upload

Stores:

- filename
- file path
- processing status
- total rows
- processed rows
- valid rows
- invalid rows
- duplicate count
- user relationship

Statuses:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

### Transaction

Stores:

- transaction ID
- region
- product category
- quantity
- unit price
- discount percentage
- transaction date
- net amount
- validation status
- error message
- upload relationship

Transaction statuses:

```text
VALID
INVALID
DUPLICATE
```

### Analytics tables

The application stores:

- `AnalyticsReport`
- `RegionAnalytics`
- `CategoryAnalytics`
- `TopTransaction`
- `DailyRevenue`

Indexes are used on frequently queried fields such as `uploadId` and `transactionId`.

---

## 8. Authentication & Authorization

### Registration

```text
User
  │
  ▼
Register API
  │
  ▼
Hash password using bcrypt
  │
  ▼
Store user in PostgreSQL
```

### Login

```text
User
  │
  ▼
Login API
  │
  ▼
Find user
  │
  ▼
Compare bcrypt password
  │
  ▼
Generate JWT
  │
  ▼
Return token
```

Protected requests use:

```text
Authorization: Bearer <JWT>
```

The backend verifies the token and extracts the authenticated user ID and role.

For upload-related operations, the backend also verifies that the requested upload belongs to the authenticated user.

This was explicitly tested with two users:

```text
Original user → own upload       = allowed
Second user   → original upload = rejected with 403
```

---

## 9. CSV Processing

The application currently supports CSV input.

Expected columns:

```text
transaction_id
region
product_category
quantity
unit_price
discount_percent
transaction_date
```

### Validation sequence

```text
Required fields
      ↓
Numeric values
      ↓
Non-negative quantity
      ↓
Non-negative unit price
      ↓
Valid discount
      ↓
Valid transaction date
      ↓
Date not in future
      ↓
Duplicate transaction ID
```

Invalid rows are stored rather than causing the complete job to fail.

---

## 10. Derived `net_amount`

For a valid transaction:

```text
net_amount =
(quantity × unit_price) × (1 - discount_percent / 100)
```

The result is rounded to two decimal places before being stored.

Example:

```text
Quantity       = 3
Unit price     = 499.99
Discount       = 10%

Gross amount   = 3 × 499.99
               = 1499.97

Net amount     = 1499.97 × 0.90
               = 1349.97
```

---

## 11. Duplicate Detection

Duplicate transaction IDs are detected within the uploaded dataset.

Example:

```text
DASH-2001
DASH-2002
DASH-2001  ← DUPLICATE
```

The duplicate record is stored with:

```text
status = DUPLICATE
```

and is not included in the valid transaction analytics.

The current business rule is upload-scoped duplicate detection rather than enforcing global uniqueness across all uploads.

---

## 12. Worker Pool & Concurrency

The assessment requires validation and computation to run concurrently.

Instead of:

```text
Row 1 → Row 2 → Row 3 → Row 4 → ...
```

the implementation uses a fixed worker pool:

```text
                 ┌── Worker 1
                 │
Rows ────────────┼── Worker 2
                 │
                 ├── Worker 3
                 │
                 └── Worker 4
```

Each worker obtains the next available row and processes it asynchronously.

The implementation uses four workers for normal processing.

An artificial delay is included in row processing to demonstrate the benefit of concurrency.

The worker pool also preserves result indexes so that processing remains associated with the correct input rows.

---

## 13. Processing Status & Progress

Each upload maintains:

```text
totalRows
processedRows
validRows
invalidRows
duplicates
status
```

Progress is calculated as:

```text
progress =
(processedRows / totalRows) × 100
```

The frontend polls the status endpoint while processing is active.

This provides:

- current processed row count
- total row count
- valid row count
- invalid row count
- duplicate count
- percentage progress

---

## 14. Analytics

Only valid transactions are included in the main analytics calculations.

### Total Revenue

```text
SUM(net_amount)
```

### Average Order Value

```text
SUM(net_amount) / valid transaction count
```

### Median Transaction Value

Transaction values are sorted.

For an odd number of values, the middle value is used.

For an even number of values, the two middle values are averaged.

### Standard Deviation

The population standard deviation of valid transaction values is calculated.

### Discount Loss

The difference between the transaction value before discount and after discount is aggregated to estimate the total revenue impact of discounts.

### Revenue by Region

Valid transactions are grouped by region and their net amounts are summed.

### Revenue by Category

Valid transactions are grouped by product category and their net amounts are summed.

### Top 5 Transactions

Valid transactions are sorted by net amount in descending order and the highest five are returned.

### Daily Revenue

Valid transactions are grouped by transaction date to produce a daily revenue trend.

---

## 15. REST API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Uploads

```text
POST /api/uploads
GET  /api/uploads
```

### Processing

```text
POST /api/uploads/:id/process
GET  /api/uploads/:id/status
```

### Analytics

```text
POST /api/uploads/:id/analytics
GET  /api/uploads/:id/analytics
GET  /api/uploads/:id/dashboard
```

### Download

```text
GET /api/uploads/:id/download
```

### Health

```text
GET /
GET /health/db
```

Protected endpoints require:

```text
Authorization: Bearer <JWT>
```

---

## 16. Processed CSV Download

The download endpoint produces an annotated CSV containing:

```text
transaction_id
region
product_category
quantity
unit_price
discount_percent
transaction_date
net_amount
status
error_message
```

This allows both valid records and flagged records to be reviewed after processing.

For valid records, `status` is `VALID`.

For invalid records, `status` is `INVALID` and the relevant validation error is included.

For duplicates, `status` is `DUPLICATE`.

---

## 17. Dashboard

The React dashboard contains:

### Upload Section

- File selection
- Upload button
- Upload status

### Processing Section

- Processing status
- Progress bar
- Total rows
- Processed rows
- Valid rows
- Invalid rows
- Duplicate rows
- Start Processing button
- Generate Analytics button
- Download Processed CSV button

### Analytics Section

KPI cards:

- Total Revenue
- Average Order Value
- Median Transaction
- Discount Loss
- Standard Deviation

Charts:

- Revenue by Region — bar chart
- Revenue by Category — pie chart
- Daily Revenue Trend — line chart

Tables:

- Top 5 Transactions
- Daily Revenue

---

## 18. Setup Instructions

### Prerequisites

Install:

- Node.js
- PostgreSQL
- Git

Create a PostgreSQL database named:

```text
sales_analytics
```

---

## 19. Clone the Repository

```bash
git clone https://github.com/GOWRISHANKARV157/sales-analytics-pipeline.git

cd sales-analytics-pipeline
```

---

## 20. Backend Setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

with:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sales_analytics"
JWT_SECRET="your_secure_jwt_secret"
```

Do not commit `.env`.

### Generate Prisma contract

```bash
npx prisma contract emit
```

### Initialize/apply the database contract

```bash
npx prisma db init
```

### Build backend

```bash
npm run build
```

### Run backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

## 21. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Run:

```bash
npm run dev
```

Vite will display the frontend URL in the terminal.

---

## 22. Running the Complete Application

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then:

1. Open the frontend.
2. Register a user.
3. Log in.
4. Select a CSV file.
5. Upload it.
6. Click **Start Processing**.
7. Watch the progress.
8. Click **Generate Analytics**.
9. Review the dashboard.
10. Click **Download Processed CSV** to download the annotated result.

---

## 23. Sample Data

Sample files are included in:

```text
sample-data/
```

Example:

```csv
transaction_id,region,product_category,quantity,unit_price,discount_percent,transaction_date
DASH-2001,North,Electronics,3,499.99,10,2025-02-01
DASH-2002,South,Groceries,12,15.50,0,2025-02-01
DASH-2003,East,Electronics,2,299.00,5,2025-02-02
DASH-2004,West,Apparel,5,49.99,20,2025-02-02
```

A validation dataset is also included for testing invalid values, duplicates, and date validation.

---

## 24. Design Decisions & Trade-offs

### Node.js + Express

Node.js was selected for asynchronous file processing, API handling, and concurrent operations.

Express provides a simple modular REST API structure.

### PostgreSQL

PostgreSQL was selected because the application has relational entities and relationships between users, uploads, transactions, and reports.

### Prisma

Prisma provides typed database access and keeps database operations organized.

The implementation uses Prisma 8's contract-based database approach.

### Worker Pool

A fixed worker pool provides controlled concurrency.

Creating an unlimited asynchronous task for every row could result in excessive resource usage for large files, so the worker count is deliberately bounded.

### Polling

HTTP polling was chosen for processing progress because it is straightforward and does not require additional WebSocket infrastructure.

For a larger production deployment, WebSockets or Server-Sent Events could reduce polling overhead.

### Upload-Scoped Duplicate Detection

Duplicates are currently detected within each uploaded dataset.

This avoids unexpectedly rejecting legitimate transactions that happen to use the same identifier in a different independent upload.

A global uniqueness rule could be introduced if the business domain requires it.

### Annotated Output

Invalid and duplicate rows are retained with status/error information rather than silently discarded.

This improves traceability and makes it easier for users to correct source data.

---

## 25. Security

Implemented security measures include:

- bcrypt password hashing
- JWT authentication
- Protected API routes
- User ownership checks
- File-size limit
- CSV file-type validation
- Input validation
- Environment variables for secrets
- `.env` excluded from Git
- `node_modules` excluded from Git
- Build output excluded from Git

The ownership check was tested using separate users to verify that unauthorized users receive a `403` response when attempting to access another user's upload.

---

## 26. Testing

### Authentication Tests

- Registration
- Login
- Invalid authentication
- Protected API access

### Upload Tests

- Valid CSV
- Empty CSV
- Invalid file type
- File-size restriction

### Validation Tests

- Negative quantity
- Invalid numeric value
- Missing discount
- Future transaction date
- Duplicate transaction ID

### Processing Tests

- Worker pool processing
- Processing counters
- Progress calculation
- Completed status
- Prevention of re-processing a completed upload

### Analytics Tests

- Total revenue
- Average order value
- Median
- Discount loss
- Standard deviation
- Revenue by region
- Revenue by category
- Top 5 transactions
- Daily revenue

### Security Test

```text
User A → User A upload = 200
User B → User A upload = 403
```

### Build Tests

Backend:

```bash
npm run build
```

Result:

```text
Build passed successfully.
```

Frontend:

```bash
npm run build
```

Result:

```text
Build passed successfully.
```

The Vite frontend build currently reports a chunk-size optimization warning for the JavaScript bundle, but the production build completes successfully.

---

## 27. AI Tools Used

AI-assisted development was used as a development support tool throughout implementation.

AI assistance was used for:

- Breaking down the assessment requirements
- Planning the application architecture
- Designing API and database structures
- Generating and refining TypeScript code
- Debugging TypeScript errors
- Troubleshooting Prisma integration
- Designing validation logic
- Designing worker-pool processing
- Developing analytics calculations
- Generating test scenarios
- Debugging frontend behavior
- Improving dashboard layout and styling
- Reviewing security/ownership logic
- Preparing technical documentation

The development process involved testing the generated/recommended changes locally, inspecting runtime errors, making corrections, and verifying the final application manually.

AI tools were therefore used as development and debugging assistance, while the resulting implementation was tested and validated in the local environment.

---

## 28. Optional Enhancements

The assessment lists several optional enhancements.

### Currently implemented beyond the basic flow

- Worker-pool concurrency
- Progress polling
- User ownership/security checks
- Annotated processed CSV download
- Persistent analytical report storage
- Upload history endpoint

### Not currently implemented

- Upload rate limiting
- Retry strategy for failed row processing
- CI/CD pipeline
- Dockerized deployment
- Scheduled recurring reports
- PDF dashboard export
- Redis-based background queue
- WebSocket-based real-time updates
- Structured JSON logging
- Formal log levels
- Correlation IDs
- Processing performance metrics

These enhancements can be added without fundamentally replacing the current architecture.

---

## 29. Known Limitations

1. CSV is currently the supported upload format; JSON ingestion is not implemented.
2. Processing is initiated manually.
3. Progress updates use HTTP polling.
4. The worker pool is in-process rather than distributed.
5. Analytics regeneration currently creates a new report record.
6. Full role-based authorization is not implemented even though the user role is stored.
7. Structured observability features are not implemented.
8. Monthly revenue trend is not separately exposed.
9. The Vite production build reports a chunk-size warning, although the build succeeds.

---

## 30. Future Improvements

Potential production improvements include:

- JSON ingestion
- Redis-based background processing
- WebSocket or Server-Sent Events progress updates
- Upload rate limiting
- Retry mechanisms
- Structured logging
- Correlation IDs
- Prometheus-style metrics
- Docker deployment
- CI/CD automation
- Scheduled analytics reports
- PDF report generation
- Analytics report versioning
- Database partitioning for very large datasets
- Full admin/user RBAC

---

## 31. GitHub Repository

Repository:

<https://github.com/GOWRISHANKARV157/sales-analytics-pipeline>

The repository contains the backend, frontend, sample datasets, configuration, and project documentation.

---

## 32. Conclusion

The Sales Data Processing & Analytics Pipeline provides an end-to-end workflow for uploading, validating, concurrently processing, storing, and analyzing sales transaction data.

The system combines:

- React
- TypeScript
- Node.js
- Express
- Prisma 8
- PostgreSQL
- JWT authentication
- bcrypt
- Worker-pool concurrency
- Recharts

to deliver a complete sales analytics application.

The implementation focuses on correctness, modularity, controlled concurrency, data validation, user-level isolation, persistent analytics, and an intuitive dashboard.
