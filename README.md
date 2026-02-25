<div align="center">
  <h1>🩺 CareerDoctor</h1>
  <p><strong>Your AI-Powered Career Copilot</strong></p>
  <p>CareerDoctor is an intelligent, full-stack application designed to instantly analyze resumes, track job applications, and provide strategic, data-driven career coaching using Google Gemini AI.</p>
</div>

---

## ✨ Features

- 🤖 **AI Resume Parsing**: Upload a PDF resume, and CareerDoctor uses Google Gemini (via edge-compatible PDF extraction) to instantly structure your experience, education, and skills into a rich digital profile.
- 📊 **Application Tracking**: Keep a kanban-style record of every job application, from Wishlist to Offer.
- 🧠 **Career Intelligence**: Get real-time, AI-driven insights on your career trajectory, skill gaps, and interview readiness based on your unique profile and application history.
- 🔍 **Live Job Board Integration**: Seamlessly search for active job postings matching your skills via the Google Jobs API (RapidAPI).
- 🔐 **Secure Authentication**: Built-in Google & GitHub OAuth via NextAuth.js.
- 🌓 **Sleek UI/UX**: Fully responsive, accessible, dark-mode ready interface built with Tailwind CSS and Radix UI primitives.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) (Lucide Icons)
- **Database**: [Turso](https://turso.tech/) (SQLite for the Edge) 
- **ORM**: [Prisma](https://www.prisma.io/) (with `@libsql/client` Edge Adapters)
- **AI Engine**: [Google Gemini Pro & Flash](https://ai.google.dev/) (`@google/generative-ai`)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Deployment**: [Vercel](https://vercel.com)

## 🚀 Getting Started

### Prerequisites
You will need Node.js `18+` and access to the following free APIs:
- [Google Gemini API Key](https://aistudio.google.com/)
- [Turso DB CLI](https://docs.turso.tech/cli/installation)
- [RapidAPI (JSearch / Google Jobs)](https://rapidapi.com/letscrape-6bRBa3QGz10/api/jsearch)
- Google / GitHub OAuth Credentials

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/career-doctor.git
   cd career-doctor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db" # Local SQLite fallback
   TURSO_AUTH_TOKEN=""          # Optional for local
   AUTH_SECRET="your_generated_secret" # Run: npx auth secret
   NEXTAUTH_URL="http://localhost:3000"

   # AI & APIs
   GEMINI_API_KEY="your_gemini_key"
   RAPIDAPI_KEY="your_rapidapi_key"

   # OAuth
   GOOGLE_CLIENT_ID="your_google_id"
   GOOGLE_CLIENT_SECRET="your_google_secret"
   GITHUB_CLIENT_ID="your_github_id"
   GITHUB_CLIENT_SECRET="your_github_secret"
   ```

4. **Initialize Database** (Local testing):
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Load dummy data
   npx tsx prisma/seed.ts
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment (Vercel + Turso)

CareerDoctor is optimized for edge deployment on Vercel using Turso as the database.
*Note: Due to Vercel's ephemeral filesystem, PDF resumes are instantly Base64 encoded and stored securely within the database upon upload.*

1. **Provision Turso DB**:
   ```bash
   turso db create career-doctor
   turso db show career-doctor --url     # Get your DATABASE_URL
   turso db tokens create career-doctor  # Get your TURSO_AUTH_TOKEN
   ```
2. **Push Schema to Turso**:
   Generate a SQL dump and pipe it to Turso:
   ```bash
   npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > setup.sql
   turso db shell career-doctor < setup.sql
   ```
3. **Deploy to Vercel**:
   Import your repository to Vercel, add all your environment variables (using your new `libsql://` URL for `DATABASE_URL` and adding the `TURSO_AUTH_TOKEN`), and hit Deploy!

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
