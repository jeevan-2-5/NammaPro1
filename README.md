# 🏡 NammaPro — Local Professionals Marketplace

**Connecting people with trusted professionals for everyday home services.**

NammaPro is a web-based marketplace designed to connect customers with local service professionals through a digital platform. The project aims to simplify the process of discovering home services, connecting with professionals, and managing service-related interactions.

🌐 **Live Demo:** https://namma-pro.vercel.app/  
💻 **GitHub Repository:** https://github.com/jeevan-2-5/NammaPro1

---

## 📌 Project Overview

Finding reliable professionals for household services can be time-consuming. NammaPro aims to make this process easier by providing a centralized platform for customers to discover and connect with local service providers.

The project combines a modern frontend, cloud-based authentication and data services, mapping integration, AI capabilities, and payment gateway support.

The platform is designed with extensibility in mind, allowing additional services and intelligent features to be integrated as the application evolves.

## ✨ Key Features and Capabilities

- **Local Service Marketplace:** A centralized platform for discovering home-service professionals.
- **Authentication:** Firebase Authentication integration, including Google sign-in configuration.
- **Cloud Database Integration:** Supabase client integration for application data operations.
- **AI Integration:** Google Gemini API integration capability for AI-powered application features.
- **Location Services:** Google Maps integration for location-related functionality.
- **Payment Gateway Integration:** Razorpay SDK integration for payment-related workflows.
- **Modern User Interface:** React-based components, responsive styling, and interactive UI elements.
- **Production Deployment:** A live deployment hosted at Vercel.

*Note: These capabilities reflect the project's purpose and configured dependencies. The availability of each feature in the deployed application depends on its implementation and environment configuration.*

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Component-based frontend |
| TypeScript | Static typing and application maintainability |
| Vite 6 | Development server and frontend build tooling |
| Tailwind CSS 4 | Utility-first styling |
| Node.js | JavaScript runtime |
| Express.js | Server-side HTTP application framework |
| Firebase | Authentication and related cloud services |
| Supabase | Database and backend service integration |
| Google Gemini API | Generative AI integration |
| Google Maps | Maps and location-related functionality |
| Razorpay | Payment gateway integration |
| Lucide React | Icon library |
| Motion | UI animation |
| esbuild | Server bundling |
| Vercel | Deployment platform |

## 🏗️ System Architecture

NammaPro uses a modern JavaScript and TypeScript application stack with frontend, server, and external service integrations.

```text
                Customer / Professional
                          |
                          v
                 React + TypeScript
                          |
                     Vite Build
                          |
                          v
                 Express.js Server
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
      Firebase         Supabase       Gemini API
   Authentication     Data Services    AI Features
          |
          +---------------+---------------+
                          |
                          v
                 External Integrations
                  Google Maps / Razorpay
```

This is a conceptual architecture based on the repository's dependencies and configuration. Actual request routing, authentication verification, database access, and payment processing depend on the corresponding implementation.

## 📂 Project Structure

```text
NammaPro1/
├── assets/
├── src/                         # Frontend source code
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git exclusions
├── firebase-applet-config.json  # Firebase-related configuration
├── index.html                   # HTML entry point
├── metadata.json                # Application metadata
├── package.json                 # Dependencies and npm scripts
├── bun.lock                     # Dependency lockfile
├── server.ts                    # Express server entry point
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

## ⚙️ Getting Started

### Prerequisites

Install the following tools:

- Node.js
- npm
- Git
- Firebase project credentials
- Supabase project credentials
- Google Gemini API key, if using AI features
- Google Maps API key, if using mapping features
- Razorpay test credentials, if using payment features

### 1. Clone the Repository

```bash
git clone https://github.com/jeevan-2-5/NammaPro1.git
cd NammaPro1
```

### 2. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

The repository defines this command using `tsx server.ts`, which starts the TypeScript server entry point. Open the local URL printed by the application or configured in the server.

### 5. Create a Production Build

```bash
npm run build
```

The build script creates the Vite frontend production bundle and bundles the Express server using esbuild.

### 6. Run the Production Server

```bash
npm start
```

The start script executes the bundled server at `dist/server.cjs`.

### 7. Check TypeScript

```bash
npm run lint
```

This runs the TypeScript compiler without emitting files.

## 🔐 Authentication and Security

Authentication and access control are important for a marketplace that connects customers and service professionals.

Recommended security practices include:

- Verify authentication tokens on the server for protected operations.
- Apply appropriate access policies to Supabase tables.
- Restrict access to customer and professional information.
- Validate service requests and user input on the server.
- Keep payment secrets on the backend.
- Verify Razorpay payment signatures server-side before marking transactions as successful.
- Protect Gemini API credentials and configure usage limits.
- Restrict Google Maps API keys to the required APIs and domains.
- Configure Firebase authorized domains correctly for local development and production.

## 🚀 Deployment

The project is associated with the following live application:

**https://namma-pro.vercel.app/**

To deploy a new version:

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Verify the frontend build configuration.
4. Ensure the Express server and API routes are compatible with the selected deployment architecture.
5. Configure Firebase authorized domains and external service settings.
6. Test authentication, data access, and payment workflows after deployment.

Because this repository includes an Express server, verify that the deployment platform runs its server entry point correctly rather than assuming that a frontend-only deployment is sufficient.

## 🔮 Future Enhancements

Potential improvements for NammaPro include:

- Professional profiles with service categories and customer ratings.
- Location-based discovery of nearby professionals.
- Service booking, scheduling, and cancellation workflows.
- Real-time booking status notifications.
- Verified professional onboarding.
- Secure online payments and transaction history.
- AI-assisted service recommendations.
- Review analysis and fake-review detection.
- Administrative dashboards and marketplace analytics.

These are potential extensions, not claims that every feature is already implemented.

## 👨‍💻 Developer

**Jeevan N**

- GitHub: https://github.com/jeevan-2-5
- LinkedIn: https://www.linkedin.com/in/jeevan2526/
- Project Repository: https://github.com/jeevan-2-5/NammaPro1

---

*Developed with React, TypeScript, Node.js, and modern cloud technologies.*

