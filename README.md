# Courts After Dark 🏀🏸⚽

> **"Find Your Game. Own Your Time."**

[![Design Thinking Prototype](https://img.shields.io/badge/Project-Design%20Thinking%20Prototype-173F35.svg)](#disclaimer--limitations)
[![Technology](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-8B45F7.svg)](#technologies-used)
[![Storage](https://img.shields.io/badge/Storage-localStorage%20%7C%20sessionStorage-287A50.svg)](#state-management--data-persistence)
[![License](https://img.shields.io/badge/License-Academic%20Use%20Only-E8DCC5.svg)](#license)

**Courts After Dark** is a comprehensive, client-side university sports facility reservation platform prototype developed as an academic Design Thinking initiative. The platform bridges the gap between busy student schedules and campus recreation access by providing transparent evening court schedules, simulated reservation workflows, category-based sports exploration, and administrative venue management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [Proposed Solution](#proposed-solution)
5. [Key Features](#key-features)
6. [Technologies Used](#technologies-used)
7. [System Architecture](#system-architecture)
8. [Project Directory Structure](#project-directory-structure)
9. [Local Setup & Running the Prototype](#local-setup--running-the-prototype)
10. [Visual Gallery & Screenshot Evidence](#visual-gallery--screenshot-evidence)
11. [State Management & Data Persistence](#state-management--data-persistence)
12. [Disclaimer & Prototype Limitations](#disclaimer--prototype-limitations)
13. [Future Scope](#future-scope)
14. [Academic & Contributor Information](#academic--contributor-information)

---

## Project Overview

University recreation centers are frequently congested during daytime hours, while illuminated evening and night facilities remain underutilized due to schedule opacity, informal queueing systems, and fragmented coordination. 

**Courts After Dark** re-imagines campus sports reservation for evening students, late-night rec leagues, and casual players. Built strictly with modern web standards (semantic HTML5, vanilla CSS3, and modular vanilla JavaScript), it offers an intuitive digital interface for discovering illuminated campus courts, selecting hourly time slots, managing demo bookings, and visualizing simulated facility operations.

---

## Problem Statement

During exploratory student research and campus observation, three key friction points were identified:
* **Schedule Uncertainty:** Students often arrive at campus courts without knowing whether facilities are currently open, in use, or reserved.
* **Peak Evening Concentration:** Academic schedules concentrate student recreation demand into evening hours (6:00 PM – 10:00 PM), creating uncertainty around open slots for casual players.
* **Informal Coordination Friction:** Relying on word-of-mouth or informal chat groups creates ambiguity around court availability.

---

## Objectives

* **Democratize Court Access:** Provide transparent, 24/7 visibility into available and reserved court time slots.
* **Streamline the Reservation Experience:** Deliver a fast, friction-free 3-step booking flow: *Explore &rarr; Select Slot &rarr; Review & Confirm*.
* **Support Campus Recreation Staff:** Provide recreation managers and sports committees with simulated administrative controls to add, monitor, and update sports facility inventories.
* **Demonstrate Design Thinking Rigor:** Translate real user research (empathy mapping, persona definition, problem framing, ideation matrix) into an interactive, accessible digital prototype.

---

## Proposed Solution

Courts After Dark provides a responsive, privacy-preserving web platform that enables university students to:
1. Search and filter campus courts by sport category (Basketball, Badminton, Football, Volleyball, Table Tennis, Tennis).
2. Inspect venue details, operating rules, and real-time hourly slot availability.
3. Book demo reservation slots with instant conflict prevention.
4. Track active and past bookings from a dedicated student dashboard.
5. Provide facility administrators with an inventory status view and an interactive facility management modal.

---

## Key Features

### 🎓 Student Experience
* **Hero-Driven Landing Page:** Professional landing experience highlighting the campus sports ecosystem, value propositions, and student testimonials.
* **Interactive Facility Explorer:** Real-time search by keyword and category filter chips with instant card re-rendering.
* **Time-Slot Selector:** Hourly time slot buttons (08:00 to 21:00) with dynamic availability states, maintenance blackout slots, and double-booking lockout.
* **Two-Step Booking Review:** Transparent reservation summary displaying venue, date, and selected time with required prototype acknowledgements.
* **Authenticated Student Dashboard:** Metric summary cards (Total Bookings, Upcoming Sessions, Favorite Sports), quick navigation shortcuts, and active booking previews.
* **Booking History & Status Tracking:** Filterable history log (Upcoming vs. Past / Canceled) with simulated cancellation triggers.
* **Personal Profile & Preferences:** Editable student profile information and localized theme preference controls.

### 📋 Staff & Administrative Demo
* **Facility Inventory Management:** Comprehensive tabular view of campus venues, operational statuses, and capacities.
* **Interactive Add/Edit Modal:** Accessible modal dialog to register new sports venues, select photography assets, and update operational status.
* **Simulated Reservation Queue:** Centralized log of student demonstration requests.

---

## Technologies Used

The project strictly complies with academic constraints by avoiding third-party runtime frameworks, bundlers, and heavy CSS libraries.

| Technology | Purpose | Implementation Details |
|---|---|---|
| **HTML5** | Markup & Structure | 18 semantic HTML pages, accessible `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`, `<dialog>` structures. |
| **CSS3** | Layout & Styling | CSS custom properties (design tokens), Flexbox, CSS Grid (`align-items: stretch`), sticky sidebar positioning, responsive off-canvas drawer navigation. |
| **Vanilla JavaScript** | Client-Side Logic | Modular ES6+ architecture (Storage API wrapper, UI helpers, authentication guard, dynamic event routing). Zero external dependencies. |
| **SVG** | Vector Graphics | Inline and external SVG icons for scalable, high-DPI visual rendering. |
| **localStorage** | State Persistence | Storage of simulated users, facility records, booking entries, and theme settings across sessions. |
| **sessionStorage** | Workflow State | Temporary storage of active booking drafts between slot selection and confirmation. |

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BROWSER RUNTIME (Client-Side)                 │
├────────────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER (18 HTML Pages)                                    │
│  ├── Landing & Static: index.html, about.html, privacy.html, terms.html│
│  ├── Authentication:  login.html, signup.html, forgot-password.html    │
│  ├── Student Portal:  dashboard.html, explore.html, facility-details   │
│  │                    booking-review.html, booking-success, history    │
│  │                    result.html, settings.html, 404.html             │
│  └── Staff Portal:    staff.html, facilities.html                      │
├────────────────────────────────────────────────────────────────────────┤
│  STYLE SYSTEM (assets/css/)                                            │
│  ├── style.css      (Tokens, Navbar 72px, Footers, Buttons, Grids)     │
│  ├── dashboard.css  (.dashboard-layout, Sticky 260px Sidebar, Drawer)  │
│  ├── auth.css       (Centered 440px Cards, 44px Inputs, Inline Toggles)│
│  └── pages.css      (Facility Details, Reviews, Success Cards, Modals) │
├────────────────────────────────────────────────────────────────────────┤
│  LOGIC LAYER (assets/js/)                                              │
│  ├── storage.js     (Safe JSON LocalStorage & SessionStorage API)      │
│  ├── ui.js          (Toast Notifications, Modal System, Mobile Drawer) │
│  ├── auth.js        (Login, Signup, Protected Route Navigation Guard)  │
│  └── app.js         (Catalogue Search, Slot Rendering, Booking Engine) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```
Courts-After-Dark/
├── index.html                      # Landing page with hero banner & features
├── login.html                      # Student authentication entry
├── signup.html                     # New student account registration
├── forgot-password.html            # Password recovery simulation
├── dashboard.html                  # Main student recreation overview
├── explore.html                    # Facility catalogue with search & filter chips
├── facility-details.html           # Venue inspection & hourly slot selector
├── booking-review.html             # Pre-submission confirmation & terms
├── booking-success.html            # Confirmation receipt with booking ID
├── history.html                    # Reservation records & cancellation
├── settings.html                   # Student profile & display settings
├── staff.html                      # Administrative staff portal demonstrator
├── facilities.html                 # Facility inventory management table
├── result.html                     # Search and deep-link query viewer
├── about.html                      # Design Thinking project background
├── privacy.html                    # Prototype data & privacy policy
├── terms.html                      # Prototype terms & campus guidelines
├── 404.html                        # Custom error / not found fallback
│
├── assets/
│   ├── css/
│   │   ├── style.css               # Global tokens, navbar, grid, reset
│   │   ├── dashboard.css           # Two-column layout, sidebar, drawer
│   │   ├── auth.css                # Authentication cards, form controls
│   │   └── pages.css               # Specific page widgets, modals, badges
│   │
│   ├── js/
│   │   ├── storage.js              # LocalStorage & SessionStorage manager
│   │   ├── ui.js                   # Toast engine, modal dialogs, mobile menu
│   │   ├── auth.js                 # Session management & route protection
│   │   └── app.js                  # Booking flow, filters, inventory logic
│   │
│   └── images/
│       ├── logo.png                # Official transparent brand crest
│       ├── logo.svg                # Vector brand logo asset
│       ├── hero-sports.jpg         # High-resolution evening athletic hero
│       ├── basketball.jpg          # Main Arena Basketball Court photo
│       ├── badminton.jpg           # North Pavilion Badminton Courts photo
│       ├── football.jpg            # Lower Field Turf Arena photo
│       ├── volleyball.jpg          # Sand & Hardcourt Volleyball photo
│       ├── table-tennis.jpg        # Recreation Hall Table Tennis photo
│       ├── tennis.jpg              # East Campus Championship Tennis photo
│       └── placeholder.png         # Safe fallback image asset
│
├── screenshots/
│   └── final_audit/                # Verified browser audit screenshots
│       ├── audit_index_1440.png
│       ├── audit_index_390.png
│       ├── audit_login_1440.png
│       ├── audit_login_390.png
│       ├── audit_dashboard_1440.png
│       ├── audit_dashboard_390.png
│       ├── audit_explore_1440.png
│       ├── audit_explore_390.png
│       ├── audit_facility-details_1440.png
│       ├── audit_facility-details_390.png
│       ├── audit_booking-review_1440.png
│       ├── audit_booking-review_390.png
│       ├── audit_staff_1440.png
│       └── audit_staff_390.png
│
├── DESIGN_THINKING_DOCUMENTATION.md # Academic 5-stage Design Thinking dossier
├── FINAL_PROJECT_REPORT.md          # Comprehensive technical & project report
├── SUBMISSION_CHECKLIST.md          # Academic evaluation & viva checklist
├── layout_alignment_report.md       # Empirical layout & alignment audit report
├── final_visual_acceptance_report.md# Final visual audit & verification report
└── README.md                        # Project documentation (this file)
```

---

## Local Setup & Running the Prototype

Courts After Dark requires **zero build tools, compilers, or package installations**. It runs directly in any modern browser.

### Option 1: Python Built-in HTTP Server (Recommended)
If Python is installed on your machine:
```bash
# 1. Clone or navigate into the project directory
cd "Courts After Dark"

# 2. Start a local HTTP server on port 8000
python -m http.server 8000

# 3. Open your browser and navigate to:
http://localhost:8000/
```

### Option 2: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and select **"Open with Live Server"**.

### Option 3: Direct File Execution
You can double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari. *(Note: Running via a local HTTP server is recommended to ensure seamless module resolution and session persistence).*

### Pre-Configured Demo Credentials
To explore authenticated sections immediately without creating a new account:
* **Demo Student Email:** `student@university.edu`
* **Demo Password:** `Password123!`

---

## Visual Gallery & Screenshot Evidence

All screenshots are authentic, unedited captures taken from real browser sessions during final acceptance testing:

| Viewport | Page | Preview / Screenshot Link |
|---|---|---|
| **1440px Desktop** | **Landing Page** | [View Screenshot](screenshots/final_audit/audit_index_1440.png) |
| **1440px Desktop** | **Student Dashboard** | [View Screenshot](screenshots/final_audit/audit_dashboard_1440.png) |
| **1440px Desktop** | **Explore Facilities** | [View Screenshot](screenshots/final_audit/audit_explore_1440.png) |
| **1440px Desktop** | **Facility Details** | [View Screenshot](screenshots/final_audit/audit_facility-details_1440.png) |
| **1440px Desktop** | **Booking Review** | [View Screenshot](screenshots/final_audit/audit_booking-review_1440.png) |
| **1440px Desktop** | **Staff Portal Demo** | [View Screenshot](screenshots/final_audit/audit_staff_1440.png) |
| **1440px Desktop** | **Student Login** | [View Screenshot](screenshots/final_audit/audit_login_1440.png) |
| **390px Mobile** | **Mobile Landing** | [View Screenshot](screenshots/final_audit/audit_index_390.png) |
| **390px Mobile** | **Mobile Dashboard** | [View Screenshot](screenshots/final_audit/audit_dashboard_390.png) |
| **390px Mobile** | **Mobile Explorer** | [View Screenshot](screenshots/final_audit/audit_explore_390.png) |

---

## State Management & Data Persistence

The prototype uses the browser's native Web Storage APIs to provide realistic state persistence without requiring a backend server:

* `users`: JSON array of registered student user profiles.
* `currentUser`: Active logged-in user identifier.
* `facilities`: Seeded catalogue of campus sports facilities with descriptions, sports categories, and operational statuses.
* `bookings`: JSON collection of confirmed demo reservation requests linked to facility IDs and user accounts.
* `bookingDraft`: Transient `sessionStorage` item holding selected facility, date, and time slot while moving from `facility-details.html` to `booking-review.html`.
* `settings`: Saved student preferences including display modes.

---

## Disclaimer & Prototype Limitations

> **IMPORTANT ACADEMIC NOTICE:**  
> **Courts After Dark is an educational Design Thinking prototype.**  
> * It does **NOT** connect to live university facilities, athletic departments, or physical campus access control hardware.
> * Submitting a reservation request generates a simulated demonstration record in your browser's local storage and does **NOT** reserve a physical university sports court.
> * This prototype is **NOT** affiliated with, endorsed by, or operated on behalf of any university administration or athletics department.

---

## Future Scope

In an expanded, enterprise-grade production rollout, the following enhancements are envisioned:
1. **Cloud Backend & Database:** Migration from localStorage to a Node.js / Python backend paired with a PostgreSQL relational database.
2. **University Single Sign-On (SSO):** Integration with campus identity providers via OAuth2, SAML 2.0, or Shibboleth for automated student ID verification.
3. **IoT Smart Floodlight Integration:** Automated activation of court lighting based on validated check-in timestamps.
4. **QR Turnstile Check-In:** Dynamic time-expiring QR passes generated on `booking-success.html` to unlock electronic access gates.
5. **Real-Time Push Notifications:** Instant updates for adverse weather closures or maintenance schedule adjustments.

---

## Academic & Contributor Information

* **Course / Subject:** Design Thinking & Innovation / Software Engineering Project
* **Academic Term:** Academic Year 2026 – Semester I
* **Project Team:**
  * **[Student Name 1]** — Lead UI/UX Designer & Frontend Engineer *(Roll No: [Editable Roll No 1])*
  * **[Student Name 2]** — User Researcher & Design Thinking Specialist *(Roll No: [Editable Roll No 2])*
  * **[Student Name 3]** — Quality Assurance & Testing Lead *(Roll No: [Editable Roll No 3])*
  * **[Student Name 4]** — Product Analyst & Documentation Lead *(Roll No: [Editable Roll No 4])*
* **Faculty Advisor / Evaluator:** [Prof. / Dr. Editable Faculty Name]
* **Department:** Department of Computer Science & Engineering / School of Design
* **Institution:** [Editable University Name]

---

## License

This project is authored solely for academic assessment and educational portfolio presentation. All sports photographic assets are curated for educational prototyping under fair-use guidelines.
