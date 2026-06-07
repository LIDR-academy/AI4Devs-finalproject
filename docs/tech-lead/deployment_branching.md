# SplitEat: Deployment & Branching Strategy

This document describes the branching model, chained PR rules, and CI/CD pipelines (GitHub Actions) for SplitEat, ensuring stable, automated deliveries.

---

## 1. Branching Strategy & Stacked PRs

SplitEat follows a modified **GitFlow / Feature Branching** strategy, with strict rules on Pull Request sizes to protect code review quality.

### 1.1 Core Branches
- **`main`**: Production-ready code. Matches the live environment deployed to Firebase App Hosting.
- **`develop`**: Development integration branch. Features are merged here first to run staging integration tests.

### 1.2 Chained / Stacked Pull Requests (Review Workload Guard)
To keep PRs reviewable and prevent single pull requests from exceeding **400 lines of code**, we implement a **Stacked PR (chained)** workflow for complex features:

- **Rule**: If a feature is estimated to exceed 400 lines (e.g., Task T-03: Cloud OCR + Regex Parser), it must be split into autonomous, sequential units of work.
- **Chain Strategy**: *Stacked-to-Main* or *Feature-Branch-Chain*.
  - For SplitEat, we use **Stacked-to-Main**: Each small PR targets `main` (or `develop`) sequentially, containing complete tests and working implementations for that sub-slice, keeping review sizes under 400 lines.
  
#### Stacked PR Example Flow:
1. `PR #1`: Infrastructure setup & Firebase Functions structure.
2. `PR #2` (depends on #1): Regular Expression logic & Parser tests.
3. `PR #3` (depends on #2): Google Cloud Vision API integration.

---

## 2. CI/CD Pipeline (GitHub Actions)

We run two main workflows: **Validation** (on PR) and **Deployment** (on merge to develop/main).

### 2.1 Validation Workflow (Pull Request Verification)
Runs on any Pull Request targeting `develop` or `main`.

```yaml
name: CI Validation

on:
  pull_request:
    branches: [ develop, main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter & Formatter
        run: |
          npm run lint
          npm run format:check

      - name: Run Unit & Integration Tests
        run: npm run test:ci

      - name: Run E2E & A11y Tests
        run: |
          npx playwright install --with-deps
          npm run test:e2e
```

### 2.2 Deployment Workflow (Continuous Deployment)
Runs when a PR is merged to `main` (production release).

```yaml
name: CD Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Frontend SPA
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: spliteat-prod
          channelId: live
```

---

## 3. Environment Variables & Secrets Management

To avoid leaking credentials, configurations are split by environment:

- **`.env.development`**: Points to local Firebase emulators (`http://localhost:5001` for functions).
- **`.env.production`**: Points to live Firebase services and Cloud Functions.

### 3.1 Required Environment Configuration Keys
```bash
# Firebase Frontend Client SDK Credentials
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=spliteat-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spliteat-prod
VITE_FIREBASE_STORAGE_BUCKET=spliteat-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abcd1234
```

### 3.2 Secure Cloud Secret Manager
Cloud Functions use **Google Secret Manager** (integrated with Firebase) to handle sensitive API credentials:
- `VISION_API_KEY`: API Key to connect to Google Cloud Vision API. Checked and injected during function initialization.
