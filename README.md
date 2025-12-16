## Digital Concept Teaching (OE Cards)

Digital, PECS‑inspired web app for **teaching concepts via visual discrimination and generalization**, not single‑picture memorization.

The app is built as a **pure static HTML/CSS/JS** site and can be deployed to Vercel with **no build step**.

---

## What this project does

- **Goal**: Support **concept teaching + discrimination + generalization** for children (especially with special educational needs).
- **Core idea**: Avoid “one picture = concept” memorization.
  - Instead: “CAR is a concept”, shown with **multiple exemplars** (photo‑like, drawing‑like, bw‑like, icon‑like).
- **Interaction**: 2‑choice discrimination:
  - Prompt: “Which one is CAR?” (Turkish: “Hangisi ARABA?”)
  - Child taps one of two large visual cards.

This is **not**:
- A gamified system (no points / levels / badges in v1).
- A full digital version of all PECS phases.
- A diagnostic or treatment tool (purely educational material).

---

## Features (v1)

- 5 concepts:
  - CAR, ANIMAL, FRUIT, OBJECT, HUMAN.
- Each concept has a **set of 6 target exemplars**:
  - 2 “photo‑like”
  - 2 “colored drawing‑like”
  - 1 “black‑and‑white‑like”
  - 1 “icon/schematic‑like”
- For each concept:
  - **Easy distractors** (very unrelated) for early stages.
  - **Similar distractors** (same supercategory, e.g. other vehicles) ready in data for later stages.
- 2‑choice practice screen:
  - Big, tap‑friendly cards with **large emojis** (stand‑in for future images).
  - Clear text feedback (“BU ARABA” / “BU ARABA DEĞİL”) and color highlights.
- Audio feedback (optional):
  - Correct: “Bu araba.”
  - Incorrect: “Bu araba değil.”
  - Can be toggled on/off in **Settings**.
- High‑contrast mode for low‑vision support.

Pedagogically important behavior:
- **Correct answer**:
  - Green highlight, positive feedback, optional speech.
  - After a short delay, a **new trial** (same concept, different exemplar/distractor).
- **Incorrect answer**:
  - Red highlight, “BU ARABA DEĞİL”, optional negative speech.
  - Then the **correct card is modeled** (green highlight + “Bu araba.”).
  - The **same trial is repeated** (no “wrong → next question” shortcut).

---

## Data model (concepts.json)

All teaching content is defined in `data/concepts.json`.  
New concepts can be added **without changing the code**.

Each concept entry contains (simplified):

- `id`: internal name (e.g. `"car"`).
- `label`: display label (e.g. `"ARABA"`).
- `questionTemplate`: e.g. `"Hangisi ARABA?"`.
- `audio.correct` / `audio.incorrect`: speech strings (Turkish).
- `stages`: which stages are active (v1 uses Stage 1–2, Stage 3 is present but off).
- `features`: optional semantic features (e.g. `["taşıt", "tekerlekli", "insan taşır"]`).
- `targets[]`: target exemplars of the concept.
  - Each target has:
    - `id`
    - `type`: `"photo" | "illustration" | "bw" | "icon"`
    - `src`: reserved for future image filenames
    - `emoji`: emoji used as visual in v1
- `distractors.easy[]`: clearly unrelated distractors for early stages.
- `distractors.similar[]`: similar distractors (same category) for future harder stages.

This structure makes it easy to:
- Add new concepts.
- Swap emojis for real images later.
- Introduce new stages (e.g. feature‑based questions) on top of the same data.

---

## UI / UX overview

### Concept selection screen

- Shows 5 concept cards:
  - Concept emoji + label
  - Question pattern
  - Small meta (number of visuals, stages in data)
- Teacher or parent taps a card to start practice for that concept.

### Practice screen

- Top:
  - Question: e.g. “Hangisi ARABA?”
  - Meta line: **Concept name + Stage label**.
- Middle:
  - Two large cards with **one big emoji** each.
  - Emojis change between trials to represent multiple exemplars.
- Bottom:
  - Feedback text area (green/red, “BU ARABA” / “BU ARABA DEĞİL”).

### Settings

- Audio feedback: ON / OFF.
- High contrast mode: ON / OFF.

---

## Tech stack

- Pure **frontend**:
  - `index.html`
  - `style.css`
  - `app.js`
  - `data/concepts.json`
- No bundler, no framework, no backend required.
- Works in modern Chrome / Safari, responsive and tablet‑friendly.

### Folder structure

```text
OE_Cards/
  index.html
  style.css
  app.js
  data/
    concepts.json
  assets/
    images/
      README.txt   # how to plug in real image files later
    audio/         # reserved for future audio files
```

---

## Running locally

From the project root:

```bash
cd OE_Cards
python3 -m http.server 4173
```

Then open in your browser:

```text
http://localhost:4173
```

Any static HTTP server works; no build step is needed.

---

## Deploying to Vercel

This is a static project with no build step.

### One‑time setup with Vercel CLI

```bash
npm i -g vercel          # if not installed
vercel login             # authenticate
```

### First deploy

From the project root:

```bash
vercel
```

- When prompted:
  - Project name: e.g. `oe-cards`  
  - Framework: “Other” / static  
  - Build command: leave empty  
  - Output directory: `.`

Vercel will:
- Serve `index.html` from the root.
- Serve `data/concepts.json` as a static file.

### Production deploy

```bash
vercel --prod
```

You will get a stable production URL like `https://oe-cards.vercel.app`.

---

## Using real images instead of emojis (optional)

Right now the app uses emojis to simulate different visual exemplars.  
To switch to real images:

1. Add your image files into `assets/images/` (e.g. `car_red_photo.jpg`).
2. Update the related targets in `data/concepts.json`:

```json
{
  "id": "car_red_photo",
  "type": "photo",
  "src": "car_red_photo.jpg",
  "emoji": "🚗"
}
```

3. Adjust `app.js` to load real images (logic is already partially prepared via `src`).

This way you can gradually move from emojis → mixed media → full photo/drawing/icon sets without changing the core UI logic.
