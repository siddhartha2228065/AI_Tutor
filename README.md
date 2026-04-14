# 🧠 Cuemath AI Tutor & Screener

![Cuemath AI Banner](https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000&h=500)

**Cuemath AI** is a premium, pedagogical platform designed to evaluate and train math tutor candidates using state-of-the-art conversational AI. It combines zero-latency voice intelligence with real-time pedagogical analytics to provide a seamless, high-fidelity experience for both educators and interviewers.

---

## ✨ Key Features

### 🎙️ Pedagogical AI Interaction
*   **Gemini 2.0 Flash Integration**: Experience near-instant voice responses and intelligent conversation flow.
*   **Role-play Scenarios**: The AI can act as a student, examiner, or peer to test tutor adaptability.
*   **Live Metrics Panel**: Real-time tracking of sentiment, pedagogical accuracy, and engagement.

### 🎨 Interactive Whiteboard
*   **Collaborative Canvas**: A powerful whiteboard for visual explanations of complex mathematical concepts.
*   **Handwritten Recognition**: (Experimental) Analysis of drawings and equations.

### 🛡️ Integrity & Performance Monitoring
*   **Enforced Fullscreen Mode**: Hardened against academic dishonesty with mandatory focus monitoring.
*   **Cheat Detection**: Built-in alerts for tab switching or loss of fullscreen focus.
*   **Live Preview Transcription**: Real-time "Live Preview" of voice input using hybrid browser-native and backend-driven transcription.

### 📊 Advanced Evaluation & Analytics
*   **Automated PDF Reports**: Generates highly actionable evaluation reports summarizing performance, strengths, and areas for improvement.
*   **Dynamic Roadmap**: Procedural learning paths generated based on interview performance.
*   **Data Studio**: A comprehensive dashboard for managing tutor pools and analyzing historical performance.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15+](https://nextjs.org/) (App Router), React 19 |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), Framer Motion |
| **AI Engine** | [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/) |
| **3D & Graphics** | [Three.js](https://threejs.org/) (Custom AntiGravity Sphere) |
| **PDF Engine** | jsPDF, html2canvas, html-to-image |
| **Video/Audio** | HLS.js, Web Audio API |

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: v20 or higher
*   **NPM**: v10 or higher
*   **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/ai_tutor.git
    cd ai_tutor
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your API keys:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
    # Add other configuration keys if necessary
    ```

4.  **Launch the development server**:
    ```bash
    npm run dev
    ```

5.  **Open in Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000) to explore the platform.

---

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Routes & Layouts)
│   ├── (dashboard)/      # Authenticated dashboard modules
│   ├── api/              # Backend API routes
│   └── globals.css       # Global design tokens and animations
├── components/           # Reusable UI components
│   ├── tutor/            # Interview-specific components (Whiteboard, Metrics)
│   └── AntiGravitySphere # Custom Three.js visualizer
├── hooks/                # Custom React hooks (Voice, Fullscreen, etc.)
├── lib/                  # Shared utilities and AI configurations
└── public/               # Static assets
```

---

## 🎨 Design System

The project follows a "Glassmorphic" design philosophy with two primary themes:
*   **Nexus (Dark)**: Deep blacks, indigo accents, and premium glass effects.
*   **Cuemath (Mixed)**: A high-fidelity, branded experience tailored for educational excellence.

---

## 📄 License

This project is proprietary. All rights reserved by Cuemath.

---

<p align="center">
  Built with ❤️ for the next generation of educators.
</p>
