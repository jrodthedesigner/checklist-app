# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (root + client + server)
npm run install-all

# Run both server and client in development
npm run dev

# Run server only (Express on port 5000, uses nodemon)
npm run server

# Run client only (Vite on port 5173)
npm run client

# Production build (client)
npm run build

# Production start (server only)
npm start
```

## Architecture

Monorepo with two apps orchestrated via `concurrently`:

- **server/** — Express.js REST API with MongoDB (Mongoose). MVC pattern: `routes/` → `controllers/` → `models/`. Validation via `express-validator`, centralized error handling in `middleware/errorHandler.js`.
- **client/** — React 18 + Vite. Zustand for state (`hooks/useChecklists.js` is the single store). Axios service layer in `services/api.js`. Two pages: Dashboard (`/`) and ChecklistDetail (`/checklist/:id`).

Vite proxies `/api/*` to `http://localhost:5000` in development.

### Data Model

Single Mongoose model `Checklist` with embedded `items` subdocument array. Items have an `order` field for drag-and-drop reordering. The entire items array is sent on reorder via `PUT /api/checklists/:id`.

### State Management

Zustand store in `hooks/useChecklists.js` handles all API calls and state. Uses optimistic updates for toggle, delete, reorder, and clear-completed operations (reverts on error).

## Key Conventions

- **Styling:** Tailwind CSS v4 with custom theme tokens defined in `client/src/index.css` (`warm-*` palette, `accent` color). Fonts: DM Sans (body), Playfair Display (headings via `font-display`).
- **Animations:** Framer Motion for page transitions, list entrance, checkbox spring animation.
- **Drag-and-drop:** `@dnd-kit/sortable` on checklist items.
- **Notifications:** `react-hot-toast` for success/error feedback.
- **Server env:** `server/.env` contains `MONGO_URI` (Atlas) and `PORT`.
- **No auth:** API is fully public, no authentication layer.
