# RealSaveFooding Frontend

## Getting Started
From the repository root, run frontend commands from the `front` folder.

```bash
cd front
npm install
npm run dev
```

Frontend app typically runs on `http://localhost:5173`.

## 🌟 Highlights
- Pantry management screens and flows are ready to explore.
- Receipt-assisted add-item UX is available in the MVP UI routes.
- Shared, reusable UI components reduce duplicated implementation effort.

## ℹ️ Overview
This frontend is a React + TypeScript + Vite application for the RealSaveFooding MVP. It focuses on an intuitive multi-screen experience for pantry tracking, receipt flows, insights, and settings, created as part of an academic full-stack project with documentation-driven delivery.

### ✍️ Authors
- Jesús Ramírez Guerrero - [GitHub Profile](https://github.com/jesramgue)
- Organization - [LIDR Academy](https://github.com/LIDR-academy)

## 🚀 Usage
Start the app in development mode:

```bash
cd front
npm run dev
```

Build and preview production assets:

```bash
npm run build
npm run preview
```

## 🧪 Testing
Unit and component tests run with Vitest + React Testing Library (jsdom):

```bash
cd front
npm run test        # run once
npm run test:watch  # watch mode
```

End-to-end tests run with Playwright and require the dev server (and backend for
auth) to be running:

```bash
npm run test:e2e
```

## ⬇️ Installation
Simple installation for frontend contributors:

```bash
cd front
npm install
```

Minimum requirements:

- Node.js 20+
- npm 10+
- Modern browser (Chrome, Edge, Firefox, Safari)

## 💭 Feedback and Contributing
- Discussions: [Repository Discussions](https://github.com/LIDR-academy/AI4Devs-finalproject/discussions)
- Issues: [Open an Issue](https://github.com/LIDR-academy/AI4Devs-finalproject/issues)

Feedback, bug reports, and UX improvement ideas are welcome. Contributions to accessibility, responsiveness, and maintainability are encouraged.

## Learn More
- Product overview: `../docs/product/product.md`
- Design and UX assets: `../docs/design/readme.md`
- User stories: `../docs/product/4_User-stories.md`
