# Triathlon Planner

A free, local triathlon training planner with calendar, logging, volume tracking, race countdowns, and AI-generated training suggestions.

## Stack

- **Backend**: Python FastAPI + SQLite (zero DB setup)
- **Frontend**: React + Vite + Tailwind CSS + Recharts + react-big-calendar
- **AI**: Claude (`claude-sonnet-4-6`) via Anthropic API

---

## Quick Start

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Anthropic API key for AI suggestions
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# Start the API server
uvicorn main:app --reload
# → http://localhost:8000
```

### 2. Frontend (new terminal)

```bash
cd frontend

npm install
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Features

| Feature | Description |
|---------|-------------|
| **Training Calendar** | Month/week view, color-coded by sport (swim/bike/run/brick) |
| **Workout Logging** | Add/edit workouts with sport, type, status, distance, duration, RPE, notes |
| **Status tracking** | Planned (dashed) / Completed / Skipped |
| **Volume Chart** | Weekly bars for swim/bike/run distance + total hours |
| **Race Countdown** | Days to race + auto-calculated training phase badge |
| **AI Coach** | Claude generates a structured next-week plan based on your history |
| **One-click add** | Add AI suggestions directly to your calendar |

## Training Phases

| Phase | Weeks to Race |
|-------|--------------|
| Base  | > 12 weeks   |
| Build | 8–12 weeks   |
| Peak  | 4–8 weeks    |
| Taper | < 4 weeks    |

## AI Coach

The AI feature is **optional**. Without an API key, the app returns demo suggestions so everything still works.

With a key (`ANTHROPIC_API_KEY` in `backend/.env`), Claude receives:
- Your last 4 weeks of training history
- Active race distance, date, and current phase
- Your fitness level and weekly hours target

…and returns a structured JSON training week with 5–7 workouts you can add to your calendar with one click.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /workouts?start=&end=` | Workouts in date range |
| `POST /workouts` | Create workout |
| `PUT /workouts/{id}` | Update workout |
| `DELETE /workouts/{id}` | Delete workout |
| `GET /races` | List races |
| `POST /races` | Create race |
| `PUT /races/{id}` | Update race |
| `DELETE /races/{id}` | Delete race |
| `GET /athlete` | Athlete profile |
| `PUT /athlete` | Update profile |
| `POST /ai/suggest-week` | AI training suggestions |
| `GET /health` | Health check |

Interactive API docs: **http://localhost:8000/docs**
