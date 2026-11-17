# Feature Specification: Doctor Appointment Booking System

**Feature Branch**: `001-doctor-appointment-booking`

**Created**: 2026-11-17

**Status**: Draft (Updated with Unified Healthcare Color Palette & Re-Engineered Frontend UX)

**Input**: User description: "Doctor Appointment Booking System: Change the colours used and change the UX for the frontend — transitioning to an ultra-clean, calming clinical healthcare design system (Medical Trust Blue, Serene Cyan/Teal, Crisp Porcelain Canvas, High-Contrast Slate Typography), frictionless multi-step booking flows, trust-building practitioner cards, and optimized clinical signage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Doctor Search and Discovery (Priority: P1)

As a prospective or registered patient, I want to search and filter healthcare providers by multiple criteria (specialization, location, consultation fee, language, and real-time availability) and view comprehensive profiles with verified credentials and patient ratings so that I can choose the most suitable doctor for my medical needs.

**Why this priority**: Finding and evaluating the right doctor is the foundational entry point for the entire booking journey. Without discoverability, no bookings can take place.

**Independent Test**: Can be fully tested by navigating to the provider directory, applying search and filter criteria, and viewing doctor profile details and available time slots without requiring a registered account or completed booking.

**Acceptance Scenarios**:

1. **Given** a patient accessing the search portal, **When** they filter by specialization (e.g., "Cardiology") and city/location, **Then** the system displays a list of matching doctors with consultation fees, languages spoken, experience, and current ratings.
2. **Given** a search result list, **When** a patient selects a doctor's card, **Then** the full profile is presented displaying qualifications, clinic affiliations, patient reviews, consultation modes (in-person and video), and an interactive calendar of upcoming available slots.
3. **Given** search criteria that yield no matches, **When** the search executes, **Then** the system presents helpful suggestions and alternative nearby doctors or specializations.

---

### User Story 2 - Patient Appointment Booking & Temporary Slot Hold (Priority: P1)

As a patient, I want to select an available time slot for an in-person or video consultation, have that slot temporarily locked while I complete my booking details and payment, and receive an instant confirmation so that my appointment is guaranteed without the risk of double booking.

**Why this priority**: Booking execution is the core value proposition of the system, transforming discovery into a confirmed medical consultation while ensuring schedule concurrency safety.

**Independent Test**: Can be tested by selecting an available slot, initiating the booking process, verifying that the slot becomes temporarily locked to other users, completing confirmation/payment, and receiving a unique appointment confirmation code.

**Acceptance Scenarios**:

1. **Given** an available slot on a doctor's calendar, **When** a patient clicks "Book Now" and chooses consultation type (in-person or video), **Then** the system places a 5-minute temporary hold on the slot, rendering it unavailable to any other patient session.
2. **Given** a slot on a 5-minute hold, **When** the patient confirms patient details and completes payment before the timer expires, **Then** the appointment status becomes Confirmed, notification receipts (SMS/email) are dispatched, and the slot is permanently booked.
3. **Given** a slot on a 5-minute hold, **When** the patient abandons the session or the 5 minutes lapse without confirmation, **Then** the temporary hold is immediately released and the slot returns to public availability.
4. **Given** two patients attempting to select the exact same slot concurrently, **When** both click book within milliseconds, **Then** only the first request receives the hold lock, while the second patient receives a real-time notice that the slot is currently reserved and is offered alternate slots.

---

### User Story 3 - Doctor Schedule & Availability Management (Priority: P2)

As a doctor, I want to define my recurring working hours, consultation slot durations, break times, and block out dates for planned leaves or emergency unavailability so that my clinic schedule accurately reflects my actual availability.

**Why this priority**: Accurate doctor schedules are essential for patient trust and clinic operations. Doctors must have autonomous control over their calendar and working hours.

**Independent Test**: Can be tested by a doctor logging into their portal, updating their weekly availability hours and slot duration, and verifying that the patient-facing calendar immediately reflects the modified schedule.

**Acceptance Scenarios**:

1. **Given** an authenticated doctor on their schedule dashboard, **When** they set working days (e.g., Monday through Friday, 09:00 - 17:00), lunch breaks, and slot duration (e.g., 30 minutes), **Then** the system auto-generates corresponding bookable slots for upcoming weeks.
2. **Given** a doctor needing time off, **When** they apply a leave block for a single day or date range, **Then** all unbooked slots in that window are marked as blocked and hidden from patient search.
3. **Given** an emergency schedule modification where appointments are already confirmed, **When** the doctor blocks the slot, **Then** the system flags the impacted bookings, alerts clinic staff and patients, and offers priority rescheduling.

---

### User Story 4 - Appointment Rescheduling, Cancellation & Waitlist (Priority: P2)

As a patient or receptionist, I want to reschedule or cancel an appointment within the allowed policy window, and as a patient waiting for an unavailable doctor, I want to join a waitlist so that I am automatically alerted when a slot opens up due to cancellation.

**Why this priority**: Reduces clinic lost revenue from cancellations and provides flexibility for patients when unexpected schedule changes arise.

**Independent Test**: Can be tested by cancelling an existing confirmed booking within the permitted window, verifying slot release, and confirming that a waitlisted user receives immediate notification of the available slot.

**Acceptance Scenarios**:

1. **Given** a confirmed appointment scheduled more than the cut-off period (e.g., 2 hours before the appointment), **When** the patient chooses to reschedule, **Then** they can choose an alternate open slot without incurring penalties, transferring all booking details.
2. **Given** a confirmed appointment, **When** the patient cancels within the permitted cut-off window, **Then** the booking is marked Cancelled, the slot returns to available status, and cancellation confirmation is issued.
3. **Given** a fully booked doctor schedule on a specific date, **When** a patient views the date, **Then** the system offers a "Join Waitlist" option capturing patient contact details and consultation preference.
4. **Given** an active waitlist, **When** a booked appointment on that date is cancelled, **Then** the system sends immediate notification to the first waitlisted patient offering a priority booking window to claim the released slot.

---

### User Story 5 - Medical Records, Prescriptions & Post-Visit Reviews (Priority: P3)

As a patient and treating doctor, I want to attach and review medical histories, past prescriptions, and lab reports within the appointment context, and as a patient, I want to rate and review the doctor following a completed visit so that future patients benefit from transparent feedback.

**Why this priority**: Elevates the platform from a simple booking tool into a comprehensive healthcare consultation workflow and establishes trust through verified patient feedback.

**Independent Test**: Can be tested by uploading a diagnostic report to an appointment, verifying doctor visibility, marking the appointment completed, and submitting a verified rating and review that updates the doctor's public rating.

**Acceptance Scenarios**:

1. **Given** an upcoming or in-progress appointment, **When** a patient uploads past medical reports or health history summaries, **Then** the assigned doctor can securely access and view the documents prior to or during the consultation.
2. **Given** a completed consultation, **When** the doctor issues a digital prescription or consultation notes, **Then** the patient receives a notification and can view or download the prescription from their appointment history.
3. **Given** an appointment marked as Completed, **When** the patient accesses their visit record, **Then** the system prompts them to submit a 1 to 5-star rating and qualitative written review.
4. **Given** a newly submitted review, **When** accepted, **Then** the doctor's average rating and total review count are updated across search listings.

---

### User Story 6 - Clinic Administration, Front-Desk Operations & Operational Reporting (Priority: P3)

As a clinic administrator or receptionist, I want to manage doctor rosters, book and reschedule appointments on behalf of walk-in or calling patients, and generate operational reports on booking volume, revenue, no-show rates, and doctor utilization so that clinic operations run smoothly and bottlenecks are addressed.

**Why this priority**: Enables clinics to handle hybrid operations (online + walk-in) and gives clinic management oversight over operational efficiency and revenue.

**Independent Test**: Can be tested by a receptionist logging in, creating an appointment for a walk-in patient, and generating a weekly utilization and revenue report.

**Acceptance Scenarios**:

1. **Given** an authenticated clinic receptionist, **When** a walk-in patient requests a visit, **Then** the receptionist can look up doctor availability, create an appointment on behalf of the patient, and record payment status.
2. **Given** an admin user accessing the reporting dashboard, **When** they select a date range and clinic location, **Then** the system generates summary metrics displaying total bookings, completed visits, cancellation percentages, revenue breakdown, no-show counts, and doctor schedule utilization rates.
3. **Given** repeated patient no-shows exceeding the policy threshold (e.g., 3 no-shows), **When** flagged by the system, **Then** administrative staff can review the account and apply booking restrictions or fee requirements.

---

### User Story 7 - Smart Symptom Matching & Side-by-Side Doctor Comparison (Priority: P2)

As a patient searching for healthcare, I want to tap on common symptom badges (e.g., "Chest Tightness", "Skin Allergy", "Child Fever", "Joint Pain") to immediately find the relevant specialist, and compare up to 3 doctors side-by-side across consultation fees, qualifications, years of experience, ratings, and next availability so that I can make a confident choice without opening multiple browser tabs.

**Why this priority**: Enhances patient onboarding speed, guides non-medical users toward the right clinical department, and streamlines the decision process with transparent provider comparisons.

**Independent Test**: Can be tested by selecting the "Chest Tightness" symptom pill to filter cardiologists, adding 2 doctors to the comparison drawer, and opening the side-by-side comparison modal.

**Acceptance Scenarios**:

1. **Given** a patient on the search homepage, **When** they click a symptom badge (e.g., "Child Cough & Fever"), **Then** the search automatically filters to Pediatrics and highlights matching doctors.
2. **Given** search result cards, **When** a patient clicks "Compare" on 2 or 3 doctor cards, **Then** a floating comparison bar appears at the bottom with a button to view side-by-side metrics.
3. **Given** the comparison modal open, **When** viewed, **Then** all doctors are presented in adjacent columns with fees, ratings, clinic locations, and a direct "Book Slot" button.

---

### User Story 8 - Digital Prescription Letterhead & Patient Health Timeline (Priority: P2)

As a patient and treating doctor, I want to generate and view an authentic, printable digital prescription formatted on clinic letterhead with a medication dosage schedule (Morning, Noon, Night), and explore an interactive chronological health timeline of all visits, prescriptions, and lab tests so that my medical journey is easy to follow.

**Why this priority**: Elevates post-consultation care from plain text notes to legally compliant, professional digital prescriptions and gives patients a holistic view of their health journey.

**Independent Test**: Can be tested by viewing a completed appointment, opening the digital prescription modal, verifying the letterhead and dosage table, and inspecting the chronological medical timeline.

**Acceptance Scenarios**:

1. **Given** a completed appointment, **When** the patient or doctor opens the prescription, **Then** the system displays a printable clinic letterhead document with doctor qualifications, Rx watermark, medication table, and verification code.
2. **Given** the patient health hub, **When** accessed, **Then** all past consultations, diagnostic reports, and issued prescriptions are displayed on an interactive vertical timeline with date markers and document download links.

---

### User Story 9 - Live Reception Queue Board & Token Management (Priority: P3)

As a clinic receptionist, doctor, and waiting patient, I want to view a live electronic queue board displaying real-time patient token numbers (e.g., Token #A-101, #A-102), current consultation status, and estimated wait times so that physical waiting room confusion is eliminated.

**Why this priority**: Modernizes front-desk operations, reduces patient anxiety regarding waiting times, and coordinates walk-in vs online patient flow.

**Independent Test**: Can be tested by checking the Admin / Receptionist queue board, calling the next token number, and verifying status transition to "In Consultation".

**Acceptance Scenarios**:

1. **Given** the clinic receptionist desk, **When** appointments are confirmed for today, **Then** each patient receives a unique token number.
2. **Given** the Live Queue Board, **When** viewed on waiting room monitors or patient devices, **Then** it shows "Now Serving", "Up Next", and estimated waiting minutes.

---

### User Story 10 - In-Call Clinical Vitals HUD & Telehealth Note-Taking Scratchpad (Priority: P3)

As a doctor conducting a video consultation, I want to see a live patient vitals and health summary card (blood group, allergies, recorded conditions) directly in the video consultation interface and take live clinical notes that auto-save so that telemedicine consultations are as thorough as hospital visits.

**Why this priority**: Provides clinical decision support during video visits, ensuring doctors do not miss critical allergies or chronic history while on screen.

**Independent Test**: Can be tested by launching a video room, verifying that the patient vitals HUD displays blood group and allergy alerts, and taking notes that persist.

**Acceptance Scenarios**:

1. **Given** an active video consultation, **When** the doctor views the screen, **Then** a collapsible Clinical Vitals HUD displays patient demographics, blood group, allergies, and emergency contact.
2. **Given** the doctor note-taking scratchpad in the call, **When** notes are typed, **Then** they are automatically buffered and drafted into the consultation completion record.

---

### User Story 11 - Calming Clinical Healthcare Color System & Accessible Visual Hierarchy (Priority: P2)

As a patient seeking medical care, I want an airy, calming, professional healthcare interface with a harmonious clinical color system (Medical Trust Blue, Serene Cyan/Teal, Clean Crisp Backgrounds, and High-Contrast Slate Typography) so that the digital experience inspires trust, reduces medical anxiety, and provides effortless readability across all devices.

**Why this priority**: Healthcare platforms require an atmosphere of trust, calm, and clinical rigor. Dark, heavy, or inconsistent color palettes induce visual fatigue and user apprehension. A dedicated medical palette aligned with healthcare UX standards builds immediate confidence.

**Independent Test**: Can be tested by navigating across all pages and validating that all background surfaces, cards, buttons, badges, and text achieve WCAG AA contrast compliance and adhere to the unified medical color palette without jarring color clashes.

**Acceptance Scenarios**:

1. **Given** any portal view, **When** rendered, **Then** all primary actions and brand elements feature Medical Trust Blue and Serene Teal accents on a clean porcelain canvas with soft elevation and subtle borders.
2. **Given** urgent or status-critical elements (e.g., active 5-minute hold timer, drug allergy warning, cancelled appointment), **When** displayed, **Then** they use dedicated clinical semantic colors (Warm Amber for holds/waitlists, Crimson for critical allergy warnings, Emerald for confirmed bookings) that stand out immediately without cluttering the screen.
3. **Given** any text or interactive control, **When** evaluated for accessibility, **Then** the color contrast ratio satisfies or exceeds the 4.5:1 minimum threshold for standard text.

---

### User Story 12 - Streamlined Multi-Step Healthcare UX & Frictionless Flows (Priority: P2)

As a patient or clinic staff member, I want streamlined user flows with clear visual progress, instant feedback on slot selection, sticky comparison drawers, and distraction-free consultation views so that complex healthcare tasks are completed smoothly without confusion or accidental drop-offs.

**Why this priority**: Healthcare applications involve high-stake decisions (selecting a physician, committing to an appointment, entering symptoms). Frictionless UX prevents user frustration and reduces booking abandonment.

**Independent Test**: Can be tested by executing a complete discovery-to-confirmation journey and observing that step progress is continuously visible, slot holds give immediate visual confirmation, and comparison/drawer actions operate smoothly.

**Acceptance Scenarios**:

1. **Given** a patient initiating booking, **When** progressing through checkout, **Then** a 3-step visual stepper displays current progress (Patient Information → Consultation Mode → Confirmation & Receipt) alongside a live hold timer countdown.
2. **Given** doctor search results, **When** a user applies filters or toggles comparison, **Then** visual feedback is instantaneous with subtle micro-interactions and smooth drawer docking.
3. **Given** patient waiting areas viewing the queue board, **When** tokens update, **Then** token callouts animate smoothly with high visual contrast readable from standard room distances.

---

### Edge Cases

- **Hold Timeout during Payment/Checkout**: If a user remains idle or payment fails past the 5-minute hold timer, the hold expires instantly, the slot unlocks for other patients, and any delayed payment attempt returns a clean "session expired" message with an option to select a new slot.
- **Concurrent Slot Selection**: When two or more patients attempt to lock the same slot at the exact same fraction of a second, an atomic reservation check guarantees only one patient secures the hold, while others receive an immediate update to select alternative slots.
- **Doctor Emergency Block on Existing Appointments**: When a doctor abruptly declares emergency leave for a time window containing active appointments, the system flags all affected appointments, notifies the patients via SMS/email with a one-click rescheduling link, and alerts the clinic receptionist for manual outreach.
- **Late Reschedule / Cancellation Attempt**: When a patient attempts to cancel or reschedule past the allowable cut-off threshold (e.g., less than 2 hours before the slot), self-service cancellation is restricted, displaying clinic contact details and explaining late cancellation policies.
- **Timezone and Daylight Shifts**: All appointments are scheduled and displayed in the clinic's local operating timezone (defaulting to Indian Standard Time - IST), with timestamps persisted in UTC to eliminate ambiguity.
- **Network Drop during Video Consultation**: If a video consultation session disconnects mid-call, the consultation room URL remains active and accessible for the duration of the scheduled window, allowing immediate reconnection without losing appointment state.
- **Medical Record Upload Failure**: When a patient uploads an unsupported file format or a file exceeding size limits, the interface provides clear validation errors and guides the user toward valid document formats (e.g., PDF, JPEG, PNG).
- **Comparison Drawer Limit**: Attempting to add a 4th doctor to the side-by-side comparison displays a friendly toast notification prompting the user to remove one existing provider first.
- **Prescription Print Rendering**: Offline print styles remove all web navigation elements and header buttons, generating a pristine single-page prescription document.

## Requirements *(mandatory)*

### Functional Requirements

#### Account & Role Management
- **FR-001**: System MUST support role-based user registration and authentication for three distinct roles: Patients, Doctors, and Clinic Administrators/Receptionists.
- **FR-002**: System MUST support login via email with password, mobile number, and One-Time Password (OTP) verification.
- **FR-003**: System MUST provide a secure self-service password recovery and credential reset workflow.
- **FR-004**: System MUST allow patients to create and maintain personal profiles including contact information, date of birth, emergency contact, and baseline medical history.
- **FR-005**: System MUST enforce strict Role-Based Access Control (RBAC), ensuring users can only view and mutate data authorized for their role.

#### Doctor Search, Discovery & Comparison
- **FR-006**: System MUST enable patients to search and filter doctors by doctor name, medical specialization, clinic location/city, consultation fee range, spoken languages, and next available slot date.
- **FR-007**: System MUST display comprehensive doctor profile cards and detail views containing qualifications, years of experience, clinic location, accepted consultation modes (in-person and video), consultation fees, patient ratings, and real-time open slots.
- **FR-008**: System MUST display real-time calendar availability reflecting open, held, and booked slots for each active doctor.
- **FR-033**: System MUST provide an interactive Symptom-to-Specialization guided navigator that maps common patient complaints to corresponding medical specialties with one-click filtering.
- **FR-034**: System MUST allow patients to select and compare up to three doctors side-by-side across fees, experience, ratings, accepted modes, and next available slot in a dedicated comparison drawer.

#### Appointment Booking and Inventory
- **FR-009**: System MUST support booking appointments for both in-person clinic visits and remote video consultations.
- **FR-010**: System MUST place a temporary hold of exactly 5 minutes on a selected slot during checkout/payment, rendering the slot unavailable to other users during this window.
- **FR-011**: System MUST automatically release the hold and return the slot to open inventory if the booking is not completed within 5 minutes.
- **FR-012**: System MUST guarantee zero double-booking by enforcing atomic slot reservation locks across all concurrent booking attempts.
- **FR-013**: System MUST allow patients to join a waitlist when all slots for a doctor on a desired date are fully booked.
- **FR-014**: System MUST automatically dispatch a notification to the next waitlisted patient when a previously confirmed slot is cancelled.
- **FR-035**: System MUST segment daily available slots into Morning (before 12:00), Afternoon (12:00–16:00), and Evening (after 16:00) segments with visual period indicators.
- **FR-040**: System MUST provide one-click calendar export (`.ics` calendar file download and Google/Outlook Calendar web links) upon appointment confirmation.

#### Appointment Lifecycle Management
- **FR-015**: System MUST allow patients and clinic staff to reschedule or cancel an appointment up to a configurable cut-off threshold (default: 2 hours) prior to the appointment start time.
- **FR-016**: System MUST enforce late cancellation policies when a user attempts cancellation within the cut-off window.
- **FR-017**: System MUST track appointment lifecycle states: Held, Confirmed, In-Progress, Completed, Cancelled, and No-Show.
- **FR-018**: System MUST record patient attendance and identify repeated no-shows, applying configurable administrative restrictions after reaching an established threshold (default: 3 no-shows).

#### Doctor Schedule Management
- **FR-019**: System MUST allow doctors and clinic admins to define weekly recurring schedules, daily start/end hours, break times, and slot duration intervals (e.g., 15, 30, 45, 60 minutes).
- **FR-020**: System MUST allow doctors to block specific individual slots, partial days, or full date ranges for planned leaves.
- **FR-021**: System MUST provide an emergency schedule modification workflow that detects affected existing appointments, alerts impacted patients, and initiates priority rescheduling.

#### Medical Records, Prescriptions & Timeline
- **FR-022**: System MUST allow patients to upload relevant medical documents, lab reports, and previous records associated with an appointment.
- **FR-023**: System MUST allow treating doctors to view patient-uploaded records and upload digital prescriptions and clinical visit summaries upon consultation completion.
- **FR-024**: System MUST maintain an accessible appointment and prescription history accessible to the patient.
- **FR-025**: System MUST provide unique, secure meeting links for scheduled video consultations accessible to the confirmed patient and doctor during the appointment window.
- **FR-036**: System MUST generate formatted, printable digital prescriptions featuring clinic letterhead, doctor qualifications, Rx watermark, structured medication schedule, and verification QR code.
- **FR-037**: System MUST provide an interactive chronological Patient Health Timeline organizing all visits, prescriptions, and lab diagnostic documents.
- **FR-039**: System MUST display patient medical summaries (allergies, chronic conditions, blood group) within the video consultation interface for clinical decision support.

#### Reviews and Quality Ratings
- **FR-026**: System MUST allow patients to submit a 1 to 5-star rating and written review only after an appointment status has transitioned to Completed.
- **FR-027**: System MUST compute and display aggregated doctor ratings and verified patient reviews on doctor profiles.

#### Clinic Administration, Queue & Reporting
- **FR-028**: System MUST allow clinic administrators to manage doctor profiles, clinic details, and receptionist staff accounts.
- **FR-029**: System MUST allow receptionists and admins to book, reschedule, or cancel appointments on behalf of walk-in or telephone patients.
- **FR-030**: System MUST generate administrative reports tracking key operational metrics: total bookings, completed visits, cancellation rates, no-show rates, revenue summaries, and doctor schedule utilization.
- **FR-031**: System MUST maintain an immutable audit log of critical actions including appointment status transitions, cancellations, schedule blocks, and administrative overrides.
- **FR-032**: System MUST provide an interactive, fully responsive web user interface covering all patient, doctor, and administrator journeys.
- **FR-038**: System MUST display a live clinic Reception Queue Display Board with active token identifiers and wait times for front-desk and patient waiting area visibility.
- **FR-041**: System MUST provide a unified, calming Healthcare Design System and Color Palette:
  - Primary Brand & Clinical Trust: Medical Blue and Serene Ocean Cyan conveying professionalism, clinical authority, and peace of mind.
  - Secondary Wellness & Confirmations: Clinical Mint and Medical Teal for confirmed booking states, available slots, and positive progression.
  - Neutral Canvas: Crisp clinical porcelain backgrounds with subtle warm slate borders, replacing heavy dark blocks with an airy, polished healthcare aesthetic.
  - Status & Urgency: Clinical Amber for active 5-minute holds and priority waitlists; Crimson for drug allergy alerts, late cancellations, and emergency leave notices.
  - Typography & Contrast: Deep Slate for primary headings and body metadata satisfying WCAG 2.1 AA accessibility ratios.
- **FR-042**: System MUST deliver a re-engineered frontend UX with streamlined user flows:
  - Quick-filter symptom badges with active count indicators and 1-click reset.
  - Doctor search cards featuring verified clinician trust seals, hospital affiliation, and clear morning/afternoon/evening time-of-day slot pills.
  - 3-step checkout stepper with animated progress bar and prominent 5-minute hold timer pill.
  - Print-ready digital prescription modal with clinic letterhead typography and QR code.
  - High-visibility waiting room queue display board legible from a distance.
  - Telehealth video room with distraction-free layout, picture-in-picture camera preview, and non-intrusive clinical summaries.

### Key Entities

- **User**: Represents any system user; holds unique identifier, role (`Patient`, `Doctor`, `Admin`, `Receptionist`), name, email, phone number, authentication credentials, account status, and registration timestamp.
- **PatientProfile**: Holds medical-specific patient attributes; associated with User; includes date of birth, gender, blood group, emergency contact details, allergies, and chronic medical condition summaries.
- **DoctorProfile**: Holds professional credentials; associated with User; includes medical specialization, qualifications, years of experience, spoken languages, biography, clinic address, in-person consultation fee, video consultation fee, average rating score, and total review count.
- **DoctorSchedule**: Defines recurring availability; includes doctor reference, day of week, shift start time, shift end time, slot duration in minutes, recurring break intervals, and active status.
- **ScheduleBlock**: Represents ad-hoc unavailabilities or emergency leaves; includes doctor reference, start date-time, end date-time, reason, and emergency flag.
- **AppointmentSlot**: Represents a discreet bookable time segment; includes doctor reference, start time, end time, status (`Available`, `Held`, `Booked`, `Blocked`), and hold expiration timestamp.
- **Appointment**: Represents a booked consultation; includes unique booking reference, patient reference, doctor reference, slot reference, consultation type (`In-Person`, `Video`), status (`Confirmed`, `Rescheduled`, `In-Progress`, `Completed`, `Cancelled`, `No-Show`), booking timestamp, cancellation reason, payment status, token number (e.g. `A-102`), and video room URL.
- **WaitlistEntry**: Captures patient waitlist requests; includes doctor reference, patient reference, requested date, consultation mode, status (`Active`, `Notified`, `Claimed`, `Expired`), and creation timestamp.
- **MedicalRecord**: Represents documents attached to visits; includes appointment reference, patient reference, uploader reference, file metadata (name, MIME type, storage reference), description, and upload timestamp.
- **Review**: Captures patient feedback; includes appointment reference, doctor reference, patient reference, rating (1-5), written feedback text, and submission timestamp.
- **ClinicReport**: Captures aggregated metrics; includes clinic reference, reporting period (daily, weekly, monthly), total booking counts, revenue totals, utilization rates, and generation timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients can search, locate an available doctor, and complete an appointment booking in under 3 minutes.
- **SC-002**: System web application maintains page load and view transition times of under 3 seconds under normal network conditions.
- **SC-003**: System supports at least 1,000 concurrent active users without degradation of booking transaction latency.
- **SC-004**: 100% of double-booking attempts for the same doctor time slot are prevented across concurrent user sessions.
- **SC-005**: 100% of expired temporary slot holds are released and made available for public booking within 15 seconds of the 5-minute timeout.
- **SC-006**: 95% of first-time users successfully discover a matching doctor and view their available slots without requiring external support.
- **SC-007**: Waitlisted patients receive slot opening notifications within 60 seconds of a cancellation event.
- **SC-008**: System maintains 99.9% application availability during operational service hours.
- **SC-009**: 100% of appointment status changes and schedule alterations are recorded in audit logs with timestamp and user identity.
- **SC-010**: Patients using the smart symptom navigator reach the matching specialist in under 2 clicks.
- **SC-011**: Doctor comparison drawer renders comparison metrics with 100% data parity within 500ms of adding providers.
- **SC-012**: Digital prescription letterheads print and export to PDF with zero layout distortion across standard paper sizes (A4 / Letter).
- **SC-013**: 100% of interactive UI elements and text meet WCAG 2.1 AA color contrast standards (minimum 4.5:1 for standard text, 3:1 for large text and UI components).
- **SC-014**: Patients complete the doctor discovery and slot booking initiation in 3 or fewer visual interactions without experiencing interface ambiguity or visual clutter.

## Assumptions

- **Target Users & Connectivity**: Users (patients, doctors, administrators) access the platform via modern, standard-compliant desktop and mobile web browsers with active internet connectivity.
- **Primary Timezone**: Operating clinics adhere to Indian Standard Time (IST / UTC+05:30) for slot scheduling and calendar views; all internal system timestamps are normalized to UTC.
- **Cancellation Cut-off Window**: Standard cancellation and rescheduling without administrative intervention is permitted up to 2 hours prior to the scheduled slot start time.
- **No-Show Threshold**: An automated administrative review flag is triggered after a patient incurs 3 unexcused no-shows.
- **Payment & Temporary Hold**: Consultation fees are settled or secured during the 5-minute slot hold window; walk-in patients managed by receptionists can be marked as "Pay at Clinic".
- **Video Consultation Infrastructure**: Video consultations rely on secure, browser-native WebRTC/video room sessions requiring no third-party desktop app installation.
- **Compliance & Privacy**: Platform processes and stores health records and personal contact information in compliance with the Digital Personal Data Protection Act (DPDP Act) and applicable health data security guidelines (role-based access, encryption in transit and at rest).
- **Frontend Technology Consideration**: In alignment with user requirements, the frontend client application will be developed as a modern, responsive, interactive web application using React with rich design elements (Tailwind CSS, Lucide icons, glassmorphic accents, and micro-interactions).
