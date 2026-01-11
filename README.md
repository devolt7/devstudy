# 🎓 DevStudy - AI Academic Platform

A premium, production-ready React application designed for students. It uses Google Gemini AI to generate assignments, notes, and reports, and features a state-of-the-art "Handwriting Engine" that converts digital text into realistic handwritten pages.

## 🚀 Features

*   **AI Generation:** Create Assignments, Notes, Articles, and Viva Questions instantly.
*   **Handwriting Engine:** Simulates human handwriting with variable fonts, ink pressure, rotation, and paper textures.
*   **Image Intelligence:** Upload images of questions or notes for AI analysis.
*   **Export:** Download high-quality PDFs or Images of your work.
*   **Authentication:** Google Sign-In via Firebase to save student profiles.
*   **Responsive:** "Floating Dock" UI for mobile and "Glassmorphism" sidebar for Desktop.

---

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS (configured via CDN in index.html for portability)
*   **AI:** Google Gemini API (`@google/genai`)
*   **Auth & DB:** Firebase Authentication & Firestore
*   **Export:** html2canvas, jspdf
*   **Icons:** Lucide React

---

## ⚙️ Installation & Setup (From Scratch)

If you need to rebuild this project from scratch:

1.  **Initialize Project:**
    ```bash
    npm create vite@latest devstudy -- --template react-ts
    cd devstudy
    npm install
    ```

2.  **Install Dependencies:**
    ```bash
    npm install @google/genai firebase lucide-react react-router-dom react-markdown remark-gfm html2canvas jspdf
    ```

3.  **Environment Variables:**
    Create a file named `.env` in the root directory. Add your keys:

    ```env
    VITE_API_KEY=your_google_gemini_api_key_here
    
    # Firebase Config (Get this from Firebase Console)
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## 🔧 How to Configure Firebase (Sign In)

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  **Enable Auth:** Go to Build > Authentication > Sign-in method > Enable **Google**.
4.  **Enable Database:** Go to Build > Firestore Database > Create Database > Start in **Production Mode**.
    *   *Rules:* Set generic read/write rules for testing, or secure them for production.
5.  **Get Keys:** Go to Project Settings (Gear Icon) > General > Your apps > Web App. Copy the config values into your `.env` file as shown above.

---

## 🏗️ Project Structure & Customization Guide

### 1. Where is the UI Code?
*   **Mobile Bottom Bar:** Go to `src/components/Layout.tsx` and look for the `<nav>` tag inside the "MOBILE BOTTOM DOCK" comment.
*   **Desktop Sidebar:** Go to `src/components/Layout.tsx` and look for the `<aside>` tag.
*   **Colors & Fonts:** Defined in `index.html` inside the `tailwind.config` script.

### 2. How to Change AI Logic?
*   Open `src/services/geminiService.ts`.
*   Modify the `prompt` strings inside functions like `generateAssignment`.
*   *Example:* To make answers shorter, add "Keep answers under 50 words" to the prompt string.

### 3. How to Add a New Tool (e.g., "Math Solver")?
1.  Create `src/pages/MathGenerator.tsx` (Copy `AssignmentGenerator.tsx` as a template).
2.  Open `src/App.tsx` and add: `<Route path="math" element={<MathGenerator />} />`.
3.  Open `src/constants.ts`, find `NAV_ITEMS`, and add:
    ```typescript
    { id: 'math', label: 'Math Solver', icon: Calculator, path: '/math' }
    ```

### 4. How to Adjust Handwriting?
*   Open `src/components/HandwritingPaper.tsx`.
*   Look for `RealisticLine` component. The `transform: rotate(...)` logic controls the messiness.

---

## 🚀 Deployment (Production)

1.  **Build the App:**
    ```bash
    npm run build
    ```
    This creates a `dist` folder.

2.  **Deploy to Vercel/Netlify:**
    *   Upload the project to GitHub.
    *   Connect GitHub repo to Vercel.
    *   **IMPORTANT:** Add the Environment Variables (VITE_API_KEY, etc.) in the Vercel/Netlify dashboard settings.
    *   Deploy.

---

## 🤝 Contributing

This project is built for educational purposes. Feel free to fork and enhance!
