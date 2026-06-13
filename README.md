# CareerAI - AI-Powered Career Assistant

CareerAI is a modern, full-stack web application designed to help users optimize their resumes, analyze skill gaps against specific target career roles, get matching job recommendations, and draft professional cover letters. Powered by Express.js, Next.js (App Router), Tailwind CSS, MongoDB, and Gemini API.

---

## Key Features

1. **User Authentication**: Secure Sign-up, Sign-in, and Logout backed by MongoDB and JWT.
2. **Interactive Landing Page**: Modern glassmorphism design introducing core modules and features.
3. **Resume Analyzer**: PDF uploading and parsing. Generates resume scores, strengths, weaknesses, ATS compatibility feedback, and suggestions.
4. **Skill Gap Analysis**: Compares candidate's skills against target role criteria, details missing technologies, and provides a customized learning path.
5. **Job Recommendations**: Recommends matching job roles with calculated match percentages.
6. **Cover Letter Generator**: Drafts custom, position-focused cover letters. Includes in-app editing, clipboard copying, and PDF-style print downloads.
7. **Admin Dashboard**: System metrics overview, telemetry tracking, and user account management.

---

## Directory Layout

```
CareerAI/
├── backend/
│   ├── config/
│   │   └── db.js            # Mongoose DB connection logic
│   ├── middleware/
│   │   └── auth.js          # JWT protecting middleware
│   ├── models/
│   │   ├── User.js          # User schema (auth + profile)
│   │   ├── Resume.js        # Resume upload & parsing score details
│   │   └── CoverLetter.js   # Cover letter logs
│   ├── routes/
│   │   ├── auth.js          # Auth, registration, profile updates
│   │   ├── resumes.js       # PDF upload, pdf-parse, Gemini evaluation
│   │   ├── skills.js        # Skill gap checks & learning roadmaps
│   │   ├── jobs.js          # Job recommendation matrix
│   │   ├── coverletters.js  # Cover letter AI generator
│   │   └── admin.js         # Telemetry data & deletion tools
│   ├── uploads/             # Static PDF upload folder (auto created)
│   ├── .env                 # Port, JWT secret, DB, Gemini key
│   ├── package.json         # Backend node configurations
│   └── server.js            # Main Express server entry point
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css  # v4 layout configurations
    │   │   ├── layout.tsx   # Base Providers & structure
    │   │   ├── page.tsx     # Landing page
    │   │   ├── login/       # Login interface
    │   │   ├── register/    # Registration page
    │   │   ├── not-found.tsx# Custom 404 page
    │   │   └── dashboard/   # Dashboard workspace layouts & views
    │   │       ├── page.tsx # Dashboard overview logs
    │   │       ├── admin/   # Admin dashboard panel
    │   │       ├── cover-letter/ # Letter creator
    │   │       ├── jobs/    # Recommendations matching list
    │   │       ├── profile/ # Profile settings forms
    │   │       ├── resume-analyzer/ # Upload portal
    │   │       └── skill-gap/ # Roadmap constructor
    │   ├── context/
    │   │   ├── AuthContext.tsx  # Authentication & global Axios configurations
    │   │   └── ToastContext.tsx # Modern lightweight toast alerts
    │   └── providers/
    │       └── index.tsx    # QueryClient + AuthContext packaging
    │
    ├── package.json         # Frontend Next.js configs
    └── tsconfig.json        # TypeScript configurations
```

---

## Setup & Startup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017/careerai` (or a MongoDB Atlas URI)
- (Optional) Gemini API Key (if omitted, the system falls back to a profile-aware, dynamic simulated responder)

---

### Step 1: Run the Backend
1. Open a terminal, go to the `backend/` folder.
2. If environment details require editing, update `backend/.env`.
3. Start the Express server:
   ```bash
   npm run start
   # Server runs on http://localhost:5000
   ```

---

### Step 2: Run the Frontend
1. Open a separate terminal, go to the `frontend/` folder.
2. Start the Next.js development server:
   ```bash
   npm run dev
   # App runs on http://localhost:3000
   ```

---

### Step 3: Test the Application
1. Visit `http://localhost:3000` in your web browser.
2. Go to "Register" to create an account. You can optionally register a user with email `admin@careerai.com` or update your user role in MongoDB to `admin` to view the **Admin Dashboard** tab.
3. Drop a PDF resume into the **Resume Analyzer** portal to verify scoring, highlights, and suggestions.
4. Set a target role in **Skill Gap Analysis** to view learning milestones.
5. Review matched jobs under **Job Recommendations** and draft letters inside **Cover Letter Generator**.
