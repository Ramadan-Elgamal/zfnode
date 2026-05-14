# ZFNODEJS

<p align="center">
  <img src="https://raw.githubusercontent.com/Ramadan-Elgamal/zfnodejs/refs/heads/main/assets/logo-svg.svg" alt="zfnodejs logo" width="220" />
</p>

**Enterprise-grade scaffold generator for Node.js and TypeScript projects with layered architecture, zero-config database wiring, and production-ready CI/CD pipelines.**

---

## Installation

### Global Install (Recommended)

```bash
npm install -g zfnodejs
```

Then generate a new project anywhere:

```bash
zfnodejs
```

### Run Without Installation (npx)

```bash
npx zfnodejs
```

### From Source

```bash
git clone <repository-url>
cd zfnodejs
npm install
npm run build
npm run dev
```

---

## Quick Start

Run the interactive scaffolding funnel:

```bash
zfnodejs
```

You'll be prompted to:
- Choose a project name
- Select TypeScript or JavaScript
- Pick a preset (minimal, advanced, or enterprise)
- Choose a database (MongoDB, Postgres, MySQL)
- Select optional features (Auth, Redis, WebSockets, S3, etc.)
- Pick your package manager

Here's what happens next:

```
🚀 Enterprise Node.js & TypeScript API Scaffolding Engine

? Project name: my-api
? Language: TypeScript
? Architecture preset: advanced
? Primary database: mongodb
? Enable JWT Authentication: Yes
? Enable Redis caching: Yes
? Package manager: npm

📦 Installing dependencies using npm...
✔ Workspace blueprint compiled cleanly.

🔄 Initializing Git repository and securing baseline state...
✔ Source control tracking initialized cleanly with initial commit.

✔ Project scaffold complete!
📁 my-api/
   ├── src/
   │   ├── app.ts
   │   ├── server.ts
   │   ├── controllers/
   │   ├── services/
   │   ├── routes/
   │   ├── middlewares/
   │   ├── config/
   │   └── utils/
   ├── package.json
   ├── tsconfig.json
   ├── jest.config.ts
   └── .github/workflows/ci.yml

👉 Next step: cd my-api && npm run dev
```

---

## Usage

### Primary Scaffolding (Interactive)

```bash
zfnodejs
```

Launches the guided prompt funnel. Perfect for new projects.

### Artisan Generators (Ongoing Development)

After your project is created, use these commands inside the project directory to generate individual components:

#### Generate a Standalone Controller

```bash
zfnodejs bot:controller [name]
```

Creates a self-contained controller with no service dependencies:

```bash
zfnodejs bot:controller UserProfile
```

Output: `src/controllers/user-profile.controller.ts` — a fully working, immediately runnable Express handler.

#### Generate a Standalone Service

```bash
zfnodejs bot:service [name]
```

Creates a decoupled business logic engine:

```bash
zfnodejs bot:service PaymentProcessor
```

Output: `src/services/payment-processor.service.ts` — ready for integration anywhere.

#### Generate a Standalone Route

```bash
zfnodejs bot:route [name]
```

Creates an independent route with built-in inline handlers:

```bash
zfnodejs bot:route Reports
```

Output: `src/routes/reports.routes.ts` — fully functional, requires no additional wiring.

#### Generate a Complete Vertical Slice (Resource)

```bash
zfnodejs bot:resource [name]
```

Generates three interconnected files at once and **automatically mounts the route** into `src/app.ts`:

```bash
zfnodejs bot:resource Order
```

Output:
```
✔ Vertical domain resource slice generated successfully!
📁 Controller: src/controllers/order.controller.ts
📁 Service:    src/services/order.service.ts
📁 Route:      src/routes/order.routes.ts

✔ Route dynamically imported and mounted inside application core!
  Mounted: app.use('/api/v1/orders', orderRoutes);
```

The controller imports and uses the service. The route imports and mounts the controller. Everything wires itself together.

---

## Examples

### Example 1: Quick Blog API

```bash
zfnodejs

? Project name: blog-api
? Language: TypeScript
? Architecture preset: minimal
? Database: mongodb
? Features: (none selected)
? Package manager: npm
```

Result: A lean, production-ready Express server with routes, services, and controllers in place. ~30 seconds setup time.

### Example 2: SaaS Backend with Full Stack

```bash
zfnodejs

? Project name: saas-platform
? Language: TypeScript
? Architecture preset: enterprise
? Database: postgres (with Prisma)
? Features: Auth, Redis, BullMQ, S3, Tests, CI/CD
? Package manager: npm
```

Result: Enterprise architecture with JWT auth, Redis caching, job queues, signed S3 uploads, Jest integration tests, and GitHub Actions CI/CD pipeline included. Production-ready out of the box.

### Example 3: Generate a New Resource Mid-Project

You're already in `my-api/`. Add a new domain slice instantly:

```bash
cd my-api
zfnodejs bot:resource Invoice
```

Result:
- `src/controllers/invoice.controller.ts` (imports InvoiceService)
- `src/services/invoice.service.ts` (decoupled logic engine)
- `src/routes/invoice.routes.ts` (wired to controller)
- Route automatically mounted: `app.use('/api/v1/invoices', invoiceRoutes);`

### Example 4: Lightweight Webhook Handler

You need a quick one-off controller that doesn't need a service:

```bash
cd my-api
zfnodejs bot:controller WebhookReceiver
```

Result: `src/controllers/webhook-receiver.controller.ts` — a standalone, immediately-runnable controller with no missing imports or broken dependencies. Drop it into a route and go.

### Example 5: Add a Service to Existing Project

```bash
cd my-api
zfnodejs bot:service EmailNotifier
```

Result: `src/services/email-notifier.service.ts` — independent, ready to be imported by multiple controllers or queue handlers.

---

## Configuration

### Project Structure

Every generated project includes:

- **`src/app.ts`** — Express application instance with middleware, feature injections, and dynamic route mounts
- **`src/server.ts`** — Server entry point (production: dist/server.js, dev: node --watch src/server.ts)
- **`src/controllers/`** — Request handlers wired to services
- **`src/services/`** — Decoupled business logic engines
- **`src/routes/`** — Express routers mapping URLs to controllers
- **`src/middlewares/`** — Custom middleware (e.g., JWT guards)
- **`src/config/`** — Configuration modules (database, Redis, queues, etc.)
- **`src/utils/`** — Utility functions and error handling
- **`jest.config.ts`** — Test runner configuration (enterprise/production presets only)
- **`.github/workflows/ci.yml`** — Automated CI/CD pipeline (enterprise/production presets only)
- **`.env`** — Generated environment variables based on your feature choices

### Environment Variables

Auto-generated based on your selections. Example:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mongodb://localhost:27017/my-api

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=us-east-1
```

### Package Manager Support

Blueprint works with **npm**, **yarn**, **pnpm**, and **bun**. Auto-detection happens during setup:

```bash
zfnodejs
? Package manager: yarn
```

Dependency installation and CI/CD pipelines adapt automatically.

### Database Setup

**MongoDB** — Connection string auto-configured. No schema setup needed (document-based).

**Postgres with Prisma** — Schema generated at `prisma/schema.prisma`. Run migrations:

```bash
npx prisma migrate dev --name init
```

**MySQL with Prisma** — Same as Postgres. Schema in `prisma/schema.prisma`:

```bash
npx prisma db push
```

---

## Troubleshooting

### "Cannot find name 'initGitRepository'" or Similar Type Errors

Your TypeScript build is stale. Rebuild:

```bash
npm run build
```

### Package Manager Not Found

You selected `bun` but it's not installed globally:

```bash
npm install -g bun
```

Then run `create-node-blueprint` again inside your project directory.

### Route Didn't Auto-Mount

The `bot:resource` command attempts to find your `src/app.ts` and inject the import + mount. If your app file has a custom layout, auto-injection is skipped.

**Fix:** Manually add the import and mount to `src/app.ts`:

```typescript
import invoiceRoutes from './routes/invoice.routes.js';

// Inside your Express setup
app.use('/api/v1/invoices', invoiceRoutes);
```

### "Directory already exists" Error

You tried to generate a resource that already exists:

```bash
zfnodejs bot:service User
# ❌ src/services/user.service.ts already exists
```

**Fix:** Either delete the existing file or use a different name.

### Git Initialization Failed

You don't have Git installed or configured on this machine.

**Fix:** Install Git globally, or configure git identity:

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

The scaffold will still work—Git initialization is optional.

### TypeScript Compilation Errors

You generated a standalone controller/route/service but can't import it in your app:

```bash
zfnodejs bot:controller Auth
# src/controllers/auth.controller.ts is generated
```

Then in your app:

```typescript
import { authController } from './controllers/auth.controller.js'; // ❌ Wrong
import { AuthController } from './controllers/auth.controller.js'; // ✔ Right
```

Stubs export as named exports matching the casing: `{{camelName}}Controller`, `{{camelName}}Service`, etc.

### Prisma Migrations Failing

You selected Postgres or MySQL but didn't set up your database:

```bash
# Verify DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/my_db

# Then push schema
npx prisma db push
```

---

## Contributing

We welcome contributions! To get started:

1. **Fork the repo** and clone locally
2. **Install dependencies**: `npm install`
3. **Make changes** and test locally: `npm run dev`
4. **Build before commit**: `npm run build`
5. **Submit a pull request** with a clear description of what changed and why

Bug reports and feature suggestions welcome via GitHub Issues.

---

## License

MIT License. See [LICENSE](./LICENSE) file for details.

---

## Next Steps

- **Start a project:** `zfnodejs`
- **Read generated README:** Inside your new project, check `README_GENERATED.md` for setup details
- **Run the dev server:** `npm run dev` (default port 3000)
- **Run tests:** `npm run test` (if enterprise/production preset)
- **View available routes:** Open `src/routes/` to see your API structure
