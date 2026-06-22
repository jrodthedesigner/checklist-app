# Checklist App

A polished, full-stack checklist manager — create color-coded lists, add items with
priorities and due dates, reorder them by dragging, and watch your progress fill in
real time. Built end to end with the **MERN** stack (MongoDB, Express, React, Node).

> Built for the Harvard Extension School *Web Application Development* course, then
> taken past the assignment into a genuinely polished, production-style app.

<!-- Replace these once deployed -->
**🔗 Live demo:** _coming soon_ · **📺 Walkthrough:** _coming soon_

<!-- Add a screenshot or GIF here: ![Checklist app](docs/screenshot.png) -->
> _Add a screenshot or short GIF of the dashboard + drag-and-drop here._

---

## Features

- **Create & organize checklists** with a title, description, and custom color.
- **Rich items** — each has a priority (low / medium / high), an optional due date,
  and a completed state.
- **Drag-and-drop reordering** (`@dnd-kit`) that persists to the database.
- **Optimistic UI** — toggling, deleting, reordering, and "clear completed" update
  instantly and roll back automatically if the API call fails.
- **Live progress bar** per checklist.
- **Considered motion** — Framer Motion page transitions, list entrance, and a spring
  animation on the checkbox.
- **Toast notifications** for success and error feedback.
- **Validated, resilient REST API** with centralized error handling and graceful shutdown.

## Tech stack

**Front end:** React 18 · Vite · React Router · Zustand (state) · Axios · Tailwind CSS v4 · Framer Motion · @dnd-kit · react-hot-toast
**Back end:** Node.js · Express · MongoDB · Mongoose · express-validator

## Architecture

A monorepo with two apps run together via `concurrently`:

```
checklist/
├── client/          # React + Vite single-page app
│   └── src/
│       ├── pages/         # Dashboard, ChecklistDetail
│       ├── components/    # Checkbox, Modal, ProgressBar, ColorPicker, …
│       ├── hooks/         # useChecklists.js — single Zustand store
│       └── services/      # api.js — Axios layer
└── server/          # Express REST API (MVC)
    ├── routes/      # checklists.js
    ├── controllers/ # request handlers
    ├── models/      # Checklist.js (items as an embedded subdocument array)
    ├── middleware/  # validate.js, errorHandler.js
    └── config/      # db.js (Mongoose connection)
```

**Request flow:** UI action → Zustand store → Axios → Express route → controller →
Mongoose → MongoDB, and back — with the UI updating optimistically.

## Getting started

**Prerequisites:** Node.js 18+ and a MongoDB connection string (local or
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier).

```bash
# 1. Install dependencies (root + client + server)
npm run install-all

# 2. Configure the server environment
#    Create server/.env based on the example below

# 3. Run client + server together in development
npm run dev
```

- Client (Vite): http://localhost:5173
- API (Express): http://localhost:5000 — Vite proxies `/api/*` to it in dev.

### Environment variables (`server/.env`)
```
MONGO_URI=your-mongodb-connection-string
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Available scripts

| Command | What it does |
|---|---|
| `npm run install-all` | Install root, client, and server dependencies |
| `npm run dev` | Run client + server together (development) |
| `npm run server` | Run the Express API only (nodemon) |
| `npm run client` | Run the Vite dev server only |
| `npm run build` | Production build of the client |
| `npm start` | Start the server (production) |

## Deploy (free tiers)

Architecture: **React (Netlify) → `/api` proxy → Express (Render) → MongoDB (Atlas)**.

This repo is deploy-ready:

- `server/.env.example` documents the required env vars (`MONGO_URI`, `PORT`, `CLIENT_URL`).
- `server/server.js` reads `CLIENT_URL` for the allowed CORS origin (falls back to allow-all locally).
- `client/netlify.toml` proxies `/api/*` to the API and adds the SPA fallback — set your Render URL in it before deploying.

Quick version: create a free MongoDB Atlas cluster → deploy `server/` to Render
(root `server`, start `npm start`, set `MONGO_URI`/`CLIENT_URL`) → deploy `client/`
to Netlify (base `client`, build `npm run build`, publish `client/dist`) → put the
Render URL in `client/netlify.toml`. A full step-by-step is in `DEPLOY-MERN-DEMO.md`.

## API reference

Base URL: `/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/checklists` | List all checklists |
| `POST` | `/checklists` | Create a checklist |
| `GET` | `/checklists/:id` | Get one checklist |
| `PUT` | `/checklists/:id` | Update a checklist (also used for reordering items) |
| `DELETE` | `/checklists/:id` | Delete a checklist |
| `POST` | `/checklists/:id/items` | Add an item |
| `PUT` | `/checklists/:id/items/:itemId` | Update an item |
| `DELETE` | `/checklists/:id/items/:itemId` | Delete an item |
| `PATCH` | `/checklists/:id/items/:itemId/toggle` | Toggle an item's completed state |

## Roadmap

Natural next steps if this grew beyond a course project:

- [ ] User accounts & authentication
- [ ] Automated tests (API + components)
- [ ] Pagination / search for large lists
- [ ] Deployed live demo (Atlas + Render + Netlify)

## About

This project began as coursework for Harvard Extension's Web Application Development
micro-certificate. It's included in my portfolio as real, working, full-stack code I
designed and built solo — and as an example of how I learn: by shipping something
polished rather than stopping at the requirements.

— [Joey Rodriguez](https://joeyrodriguez.dev) · [LinkedIn](https://www.linkedin.com/in/jrodthedesigner/)

## License

Released under the MIT License — free to learn from and build on.
