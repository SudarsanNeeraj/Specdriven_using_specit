# Technical Research: Doctor Appointment Booking System

**Feature**: `001-doctor-appointment-booking`  
**Date**: 2026-11-17  
**Status**: Completed  

---

## 1. Frontend Architecture & Technology Selection

### Decision
Use **React (v18+) with TypeScript, Vite, Tailwind CSS, and Lucide React** for the client application. State management will use React Context + TanStack Query (React Query) for server-state caching, slot availability polling, and optimistic UI updates.

### Rationale
- **User Requirement**: Explicitly requested by the user: *"Create an interactive UI with all the features using 'React' as technology."*
- **Performance (<3s Page Load, SC-002)**: Vite provides instant Hot Module Replacement (HMR) and optimized Rollup tree-shaking for minimal bundle sizes and fast initial paint.
- **Interactive Multi-Role Experience**: React's component hierarchy cleanly isolates Patient, Doctor, and Admin views with modular, reusable components (calendar slot picker, booking stepper, doctor profile cards, schedule grid, metrics charts).
- **TypeScript Type Safety**: Shares data models and API contract typings directly with backend schemas, preventing contract drift.

### Alternatives Considered
- *Next.js (App Router)*: Adds server-side rendering complexity and serverless deployment overhead that is unnecessary for a dedicated SPA client communicating with an independent API service.
- *Vue / Svelte*: Ruled out due to the explicit user requirement for React.

---

## 2. Backend Architecture & API Framework

### Decision
Use **Node.js (v22+) with Express and TypeScript** (or alternatively Python 3.12 with FastAPI). We choose **Node.js + Express + TypeScript** for a unified TypeScript ecosystem across full-stack development, with structured RESTful API routing, centralized error middleware, and schema validation via **Zod**.

### Rationale
- **Unified TypeScript Ecosystem**: Enables 100% type sharing between API endpoints, contracts, and frontend clients.
- **Concurrent Request Handling**: Node.js event-driven non-blocking I/O effortlessly satisfies the target of **1,000+ concurrent active users** (SC-003) with sub-second API latency.
- **Fast Execution & Local Setup**: Zero friction on standard Node.js installations without external language runtimes.
- **Clear Layered Architecture**: Strict separation into `controllers`, `services`, `repositories`, `models`, and `middlewares`.

### Alternatives Considered
- *FastAPI (Python 3.12)*: Strong typing with Pydantic, but requires managing separate Python virtual environments and language contexts between frontend and backend. Node.js + TypeScript was selected to minimize developer context switching.

---

## 3. Concurrency Control & 5-Minute Atomic Slot Hold Lock

### Decision
Implement an **Atomic State-Machine Slot Reservation with In-Memory / Database Row Locking & TTL Expiration Sweeper**:
1. When a patient clicks "Book", an atomic conditional update is executed:
   ```sql
   UPDATE appointment_slots 
   SET status = 'HELD', hold_expires_at = datetime('now', '+5 minutes'), held_by_user_id = :userId
   WHERE id = :slotId AND status = 'AVAILABLE';
   ```
2. If `affected_rows == 0`, the slot is already held or booked; the booking attempt is rejected immediately with HTTP 409 Conflict and alternative slots are returned.
3. A background sweeper process runs every 10 seconds to unlock expired holds:
   ```sql
   UPDATE appointment_slots
   SET status = 'AVAILABLE', hold_expires_at = NULL, held_by_user_id = NULL
   WHERE status = 'HELD' AND hold_expires_at < datetime('now');
   ```
4. Final confirmation validates that `status == 'HELD'` and `held_by_user_id == current_user` before committing the appointment transition to `CONFIRMED`.

### Rationale
- **Zero Double-Booking Guarantee (SC-004)**: Atomic conditional updates guarantee mutual exclusion even under simultaneous concurrent requests from 1,000+ users.
- **Zero Orphaned Locks (SC-005)**: The 5-minute timeout with regular sweeper guarantees slots are returned to public inventory within 15 seconds of expiration.
- **Simplicity & Portability**: Operates reliably in standard relational databases (SQLite, PostgreSQL, MySQL) without requiring Redis as a hard operational dependency, while remaining fully upgradable to Redis distributed locks if multi-region scaling is required.

### Alternatives Considered
- *Redis Redlock / Distributed Lock*: Robust for distributed microservices, but introduces unnecessary operational infrastructure complexity for a single modular monolith service.
- *Optimistic Concurrency Control (Version Tokens alone)*: Can detect collisions but does not hold the slot for the patient during payment entry; temporary locking is an explicit business requirement.

---

## 4. Real-time Waitlist & Notification Mechanics

### Decision
Implement an **Event-Driven Waitlist Queue Service**:
1. When all slots on a date are booked, patients create a `WaitlistEntry` specifying their preferred doctor, date, and consultation type (in-person / video).
2. When an appointment is cancelled, the `AppointmentService` publishes an internal `APPOINTMENT_CANCELLED` domain event.
3. The `WaitlistService` queries the top FIFO waitlisted patient for that doctor and date, updates the entry status to `NOTIFIED`, and sends an email/SMS alert with a priority booking window (e.g., 15 minutes).
4. If unclaimed after the priority window, the next patient in line is notified.

### Rationale
- Satisfies **SC-007** (waitlisted patients receive notification within 60 seconds of cancellation).
- Decouples cancellation workflows from notification dispatches using domain event handlers.

---

## 5. Video Consultation Architecture

### Decision
Utilize a **Secure Room-Token WebRTC / Provider-Agnostic Interface Contract**:
- Backend generates a cryptographically signed room identifier (e.g., UUIDv4 with HMAC signature) valid only during the appointment window (from 10 minutes before start time until 30 minutes after end time).
- Frontend renders an integrated video room consultation component (compatible with standard WebRTC / Jitsi / Daily.co / Twilio Video embed).
- Direct peer-to-peer or gateway connection ensures encrypted streams without persisting private patient video on application servers.

### Rationale
- Complies with healthcare privacy standards (data in transit encrypted via DTLS/SRTP).
- Zero desktop app installation required; works across all standard mobile and desktop browsers.

---

## 6. Security, RBAC & Data Privacy Compliance (DPDP / HIPAA)

### Decision
- **Authentication**: JWT access tokens (short-lived, 15m) + secure HTTP-only refresh tokens, paired with OTP authentication for mobile-first patient onboarding.
- **Role-Based Access Control (RBAC)**: Role claims embedded in token (`PATIENT`, `DOCTOR`, `ADMIN`, `RECEPTIONIST`). Express middleware `authorizeRoles('DOCTOR', 'ADMIN')` enforces boundary checks.
- **Data Privacy**:
  - Medical records stored in isolated document storage with signed URLs (expiring in 10 minutes) accessible only by the owning patient and the designated treating physician.
  - Audit logging middleware captures all data access, booking status mutations, schedule blocks, and administrative overrides (`audit_logs` table) with actor ID, IP address, timestamp, and action summary (FR-031, SC-009).
- **Timezone Standardization**: All internal timestamps stored in UTC ISO-8601; localized to Indian Standard Time (IST / UTC+05:30) on presentation.

---

## Summary of Architectural Choices

| Component | Selected Technology | Primary Benefit |
|-----------|---------------------|-----------------|
| **Frontend SPA** | React 18+ (TypeScript, Vite, Tailwind CSS) | Responsive, high-performance UI across roles |
| **Backend API** | Node.js (TypeScript, Express) | High concurrency (1,000+ users), unified types |
| **Database** | Relational SQL (SQLite for local/test, PostgreSQL ready) | ACID transactions, atomic conditional updates |
| **Concurrency Lock** | Database Atomic State Machine + 5-min TTL Sweeper | 100% prevention of double booking |
| **Auth & Security** | JWT + OTP verification + RBAC middleware | Secure multi-role access and DPDP compliance |
| **Audit & Logging** | Immutable SQL Audit Log Table | Complete traceability for health compliance |

