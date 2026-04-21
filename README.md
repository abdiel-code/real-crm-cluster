# CRM Cluster

A full-stack CRM application for managing accounts, contacts, and businesses with real-time updates. Built by Abdiel Flores.

## 🔗 Live Demo

[https://app.foxcoon.online](https://app.foxcoon.online)

## 🛠 Tech Stack

**Backend**

- Rust / Axum
- Tokio
- PostgreSQL (Neon)
- SQLx
- JWT Authentication (HttpOnly cookies)
- WebSockets (tokio broadcast)

**Frontend**

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- Framer Motion

## ⚙️ Technical Highlights

- **Custom JWT extractor** — implemented via Axum's `FromRequestParts` trait, no middleware magic
- **HttpOnly cookies** — tokens stored in HttpOnly cookies with `SameSite=None; Secure` for cross-domain security
- **WebSocket broadcasts** — every mutation (create, update, delete) broadcasts a socket event, keeping the dashboard live
- **Per-user data isolation** — every query filters by `user_id`, preventing cross-user data leaks
- **Real-time dashboard** — GraphCards and Recent Activity update instantly via WebSocket without polling
- **Next.js middleware** — frontend route protection using the App Router proxy pattern
- **Fluid UI** — Advanced Framer Motion entrance animations and SVG path drawing for data visualization.
- **Containerized Deployment** — Optimized multi-stage Dockerfile `using debian:bookworm-slim` to minimize image size and attack surface.

## 🚀 Running Locally

### Backend

1. Clone the repo.
2. Create a `.env` file in `crm_cluster_backend` based on `.env.example`.
3. Run migrations: `sqlx migrate run`.
4. Start the server: `cargo run`.

### Frontend

1. Create a `.env.local` file in `crm_cluster_frontend` with: `NEXT_PUBLIC_API_URL=http://localhost:4000`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

### 🐳 Docker (Optional)

If you prefer to run the backend in a container: `docker build -t crm-backend `. `docker run -p 4000:4000 --env-file .env crm-backend`.
