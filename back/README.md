# RealSaveFooding Backend

## Getting Started
From the repository root, run backend commands from the `back` folder.

```bash
cd back
npm install
npm run start:dev
```

Backend API typically runs on `http://localhost:3000`.

## 🌟 Highlights
- Authentication and user session flows are straightforward to bootstrap.
- Pantry and receipt workflows are organized for MVP delivery.
- Integrations with OCR/storage/notifications are isolated by adapter folders.

## ℹ️ Overview
This backend powers the RealSaveFooding MVP with NestJS, Prisma, and PostgreSQL, including modules for auth, pantry inventory, receipts, and notification-ready flows. It was built as an academic full-stack project to demonstrate practical architecture, maintainable code organization, and clear traceability from product documentation to implementation.

### ✍️ Authors
- Jesús Ramírez Guerrero - [GitHub Profile](https://github.com/jesramgue)
- Organization - [LIDR Academy](https://github.com/LIDR-academy)

## 🚀 Usage
Use the API in development mode:

```bash
cd back
npm run start:dev
```

Run quality checks:

```bash
npm run lint
npm run test
```

## ⬇️ Installation
Simple installation for backend contributors:

```bash
cd back
npm install
```

Minimum requirements:

- Node.js 20+
- npm 10+
- PostgreSQL 15+ (local or managed)

## 💭 Feedback and Contributing
- Discussions: [Repository Discussions](https://github.com/LIDR-academy/AI4Devs-finalproject/discussions)
- Issues: [Open an Issue](https://github.com/LIDR-academy/AI4Devs-finalproject/issues)

Feedback, bug reports, and feature requests are welcome. Contributions that improve reliability, clarity, testing, and developer experience are encouraged.

## Learn More
- Architecture docs: `../docs/architecture/architecture.md`
- Data model docs: `../docs/db/database-model.md`
- Product requirements: `../docs/product/3_PRD.md`
