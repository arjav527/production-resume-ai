# CareerForge AI 🚀

**CareerForge AI** is a production-ready, AI-powered career platform designed to help users build resume, analyze them against ATS systems, and receive personalized career coaching—all for free.

## ✨ Features

-   **AI Career Coach**: Chat with an AI agent (powered by Google Gemini) for career advice.
-   **Resume Builder**: Create professional resumes with AI-enhanced bullet points.
-   **ATS Analyzer**: Get instant feedback on your resume's compatibility with Applicant Tracking Systems.
-   **Smart Cover Letters**: Generate tailored cover letters for specific job descriptions.
-   **Free Tier SaaS**: Includes a credit system (10 free credits/user) and chat persistence.
-   **PDF Export**: Download your resume instantly.
-   **Themeable**: sleek Dark/Light mode support.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
-   **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
-   **AI**: Google Gemini API (Free Tier)
-   **Deployment**: Netlify (Frontend) + Supabase (Backend)

## 🚀 Getting Started

### Prerequisites

-   Node.js & npm
-   Supabase Account
-   Google AI Studio Key

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/your-username/production-resume-ai.git
    cd production-resume-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file based on your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 🌐 Deployment

This project is configured for free deployment on **Netlify**.

1.  Push your code to GitHub.
2.  Import the project into Netlify.
3.  Set your Environment Variables in Netlify.
4.  Deploy!

See [deployment.md](./deployment.md) for a detailed step-by-step guide.

## 📄 License

MIT License. Created by [Your Name].
