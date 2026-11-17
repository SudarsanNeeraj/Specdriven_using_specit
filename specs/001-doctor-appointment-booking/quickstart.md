# Quickstart Validation Guide: Doctor Appointment Booking System

**Feature**: `001-doctor-appointment-booking`  
**Date**: 2026-11-17  
**Status**: Ready for Validation  

This guide provides steps to spin up, verify, and validate the end-to-end user journeys defined in [spec.md](file:///c:/Users/Pathi/Documents/specdriven_sepecit/Specdriven_using_specit/specs/001-doctor-appointment-booking/spec.md).

---

## 1. Prerequisites & Environment Setup

- **Node.js**: v20+ or v22+ (verified active in environment)
- **Package Manager**: `npm` v10+
- **Browser**: Modern Chromium / Firefox / Safari supporting WebRTC
- **Workspace layout**:
  - `backend/`: Node.js + Express + TypeScript service (running on port `5000`)
  - `frontend/`: React + Vite + TypeScript web application (running on port `3000` or `5173`)

### Initial Setup Commands

```bash
# 1. Install backend dependencies & initialize database
cd backend
npm install
npm run db:init     # executes schema migrations and seeds test doctors & schedules
npm run dev         # starts API at http://localhost:5000

# 2. In a separate terminal, install frontend dependencies & launch client
cd frontend
npm install
npm run dev         # starts React client at http://localhost:5173
```

---

## 2. End-to-End Validation Scenarios

### Scenario 1: Doctor Discovery & Filtering (P1)
1. **Action**: Open `http://localhost:5173` in a browser.
2. **Action**: In the search bar, filter by Specialization: `Cardiology` and City: `Mumbai`.
3. **Expected Outcome**:
   - Only matching cardiology doctors appear within 1 second.
   - Doctor cards display consultation fees, experience, spoken languages, and a badge with the next available slot.
   - Clicking a card opens the doctor profile with the full weekly slot grid.

### Scenario 2: 5-Minute Slot Hold & Concurrency Mutual Exclusion (P1)
1. **Action**: Open two separate browser windows (Window A: Patient 1, Window B: Patient 2).
2. **Action**: Both patients navigate to Dr. Smith's calendar for tomorrow at 10:00 AM.
3. **Action**: Patient 1 clicks **"Book 10:00 AM"**.
4. **Expected Outcome**:
   - Window A shows a 5-minute countdown timer (`04:59`, `04:58`...) and transitions to booking details.
   - Window B automatically refreshes or shows the slot disabled with badge `"Reserved / On Hold"`.
   - If Patient 2 tries to force-select the slot, the API returns HTTP 409 Conflict with the message: *"Slot is currently held by another user."*

### Scenario 3: Booking Confirmation & Video Room Generation (P1)
1. **Action**: In Window A, Patient 1 selects consultation type **"Video Consultation"**, enters patient notes, and completes checkout.
2. **Expected Outcome**:
   - System returns a unique booking reference (e.g. `APT-202611-X49K`).
   - The slot status permanently transitions to `BOOKED`.
   - The booking receipt provides a secure video room consultation link.
   - Clicking the video room opens the encrypted video consultation interface.

### Scenario 4: Slot Hold Expiration Sweeper (P1)
1. **Action**: Patient selects an open slot at 11:00 AM to place a hold.
2. **Action**: Patient leaves the screen idle without confirming or completing payment.
3. **Expected Outcome**:
   - Once the 5 minutes elapse, the background sweeper frees the slot.
   - Within 15 seconds of expiration, the slot returns to `"Available"` on the public calendar.

### Scenario 5: Doctor Schedule Modification & Emergency Block (P2)
1. **Action**: Log in as a Doctor (`doctor@medbooking.com`).
2. **Action**: Navigate to Schedule Settings, modify working hours from `09:00 - 17:00` to `10:00 - 16:00`, and set slot duration to `30 mins`.
3. **Action**: Click "Save Schedule".
4. **Expected Outcome**:
   - The calendar inventory regenerates. Slots outside the new window are removed.
5. **Action**: Apply an **"Emergency Leave Block"** for tomorrow afternoon.
6. **Expected Outcome**:
   - If any patient had a booking in that blocked window, the system flags the booking as `AFFECTED_BY_EMERGENCY`, generates a reschedule token, and creates an alert on the admin dashboard.

### Scenario 6: Cancellation & Automated Waitlist Notification (P2)
1. **Action**: Patient 2 attempts to book a fully booked day and clicks **"Join Waitlist"**.
2. **Action**: Patient 1 navigates to their profile and cancels their existing confirmed appointment (>2 hours ahead).
3. **Expected Outcome**:
   - Patient 1 receives cancellation confirmation; slot is freed.
   - System dispatches a priority notification to Patient 2 with a 15-minute priority claim link.
   - Patient 2 claims the slot, completing booking seamlessly.

### Scenario 7: Medical Records Upload & Doctor Review (P3)
1. **Action**: Patient navigates to appointment details and uploads a test lab report (`blood_work.pdf`).
2. **Action**: Doctor logs in, opens the consultation agenda, and views the attached PDF.
3. **Action**: Doctor clicks **"Complete Consultation"** and enters digital prescription notes.
4. **Action**: Patient view updates to `COMPLETED` and prompts for a 1-5 star review.
5. **Action**: Patient submits a 5-star rating with feedback; doctor's public profile rating updates immediately.

### Scenario 8: Administrative Operations & Metrics Reporting (P3)
1. **Action**: Log in as Admin (`admin@medbooking.com`).
2. **Action**: Navigate to the Operational Dashboard.
3. **Expected Outcome**:
   - Interactive charts render showing total bookings, completed consultations, cancellation rates, no-show rates, and revenue breakdowns.
   - Receptionist walk-in booking tool allows manual slot allocation on behalf of patients with "Pay at Clinic" status.

### Scenario 9: Symptom Navigator & Side-by-Side Doctor Comparison (P2)
1. **Action**: On the home search page, click the **"Chest Pain / Palpitations"** symptom badge.
2. **Expected Outcome**:
   - Specialization automatically filters to `Cardiology`.
   - Matching cardiologists appear with guidance note.
3. **Action**: Click **"Compare"** on 2 or 3 doctor cards.
4. **Expected Outcome**:
   - A floating sticky comparison drawer appears at the bottom with selected doctor avatars.
   - Clicking **"View Side-by-Side"** opens a comparative table displaying fees (In-Person & Video), ratings, clinical experience, spoken languages, and direct booking actions.
   - Attempting to add a 4th doctor displays an alert toast.

### Scenario 10: Printable Digital Prescription Letterhead (P2)
1. **Action**: Navigate to `/patient/timeline` or a completed appointment.
2. **Action**: Click **"View Print Letterhead"**.
3. **Expected Outcome**:
   - Official clinic letterhead modal opens featuring clinic branding, Doctor registration number, Rx watermark, patient demographics, vitals strip, and medication dosage schedule table (Morning - Noon - Night, Timing: Before/After Food, Duration).
   - Verification QR code and digital doctor signature stamp display.
   - Clicking **"Print / Download PDF"** triggers clean printer styling (`@media print`) without website headers or UI clutter.

### Scenario 11: Chronological Patient Health Timeline (P2)
1. **Action**: Open `/patient/timeline`.
2. **Expected Outcome**:
   - Vertical timeline organizes consultations, prescriptions, and lab tests chronologically with glowing node indicators.
   - KPI cards summarize total visits, active prescriptions, and upcoming consultations.
   - Filter tabs allow toggling between Consultations, Prescriptions, Lab Reports, and Upcoming visits.

### Scenario 12: Live Waiting Room Token Queue Board (P3)
1. **Action**: Open `/queue-board` (or `/admin/queue-board`).
2. **Expected Outcome**:
   - Full-screen capable electronic signage board displays illuminated **"Now In Cabin"** tokens (e.g., `#A-101`), **"Up Next"** queue with estimated waiting times, and privacy-masked patient names.
   - Clicking **"Call Next Patient"** transitions the next token to cabin status and triggers a simulated chime notification.
   - Clicking **"Generate Walk-In Token"** creates an instant walk-in token entry.

### Scenario 13: Healthcare Color System & UX Accessibility Validation (P2)
1. **Action**: Inspect the application interface across home discovery, doctor profile, booking stepper, health timeline, and queue board.
2. **Expected Outcome**:
   - Primary buttons, navigation highlights, and brand badges display in **Medical Trust Blue** (`#2563eb`) with **Serene Teal** (`#0d9488`) accentuation.
   - Background canvas renders on a crisp, airy porcelain background (`#f8fafc` / `#ffffff`) with subtle warm slate card borders (`#e2e8f0`).
   - Deep slate typography (`#0f172a` / `#334155`) meets or exceeds **WCAG 2.1 AA** color contrast ratios (>= 4.5:1).
   - Checkout stepper smoothly guides the patient across 3 steps with a visible 5-minute countdown pill.
   - Doctor cards display trust badges, hospital affiliation, and time-of-day slot pills without visual clutter.

---

## 3. Automated Test Commands

```bash
# Backend contract, unit & integration tests
cd backend
npm test                    # runs unit test suite (concurrency locks, sweeper, RBAC)
npm run test:contracts      # validates OpenAPI schemas against actual route responses
npm run test:concurrency    # fires simultaneous requests to test slot hold mutual exclusion

# Frontend component & E2E tests
cd frontend
npm test                    # runs Vitest component tests
npm run test:e2e            # runs Playwright / Cypress user journey tests
```

