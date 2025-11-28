# EngLearning Frontend

This is the frontend application for the EngLearning platform, built with Next.js 15, React 19, and Tailwind CSS.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Video Player**: React Player

## 🚀 Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (Recommended) or npm

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/TranDuyHai2003/EnglearningFE.git
    cd EnglearningFE
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env.local` file in the root directory:
    ```env
    # URL of your backend API
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📦 Deployment

The easiest way to deploy your Next.js app is using the [Vercel Platform](https://vercel.com/new).

### Option 1: Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and sign up/login.
3.  Click **"Add New..."** -> **"Project"**.
4.  Import your `EnglearningFE` repository.
5.  **Configure Project**:
    - **Framework Preset**: Next.js (Auto-detected)
    - **Environment Variables**:
        - `NEXT_PUBLIC_API_URL`: Your **deployed** backend URL (e.g., `https://englearning-be.onrender.com/api`).
6.  Click **Deploy**.

### Option 2: Netlify / Render
You can also deploy to Netlify or Render as a Static Site or Web Service, but Vercel is optimized for Next.js features (Image optimization, SSR, etc.).

## 📂 Project Structure

- `app/`: App Router pages and layouts.
    - `(public)/`: Publicly accessible pages (Home, Login, Register).
    - `(protected)/`: Pages requiring authentication (Dashboard, Learning, Admin).
- `components/`: Reusable UI components.
- `lib/`: Utilities, API services, and types.
- `store/`: Zustand state stores (Auth, etc.).

## 🔑 Key Features
- **Authentication**: Login/Register with JWT handling.
- **Role-based Access**: Student, Instructor, and Admin dashboards.
- **Course Learning**: Video player, lesson navigation, and progress tracking.
- **Payments**: Integration with Stripe (via Backend).
