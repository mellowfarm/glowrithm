# glowrithm status 🪷

## overview
AI beauty assistant — product finder, ingredient checker & routine builder powered by RAG, LangChain + FastAPI + Expo

---

## ✅ done

### backend
- [x] project structure (`app/rag/`, `app/api/`, `app/cv/`)
- [x] virtual environment + `requirements.txt`
- [x] `.env` with OpenAI API key
- [x] `ingest.py` — loads Sephora CSV → chunks → embeds → saves to FAISS
- [x] FAISS index built (`data/faiss_index/`)
- [x] `chain.py` — RAG chain (FAISS retriever → prompt → GPT-4o → response)
- [x] `products.py` — `POST /products/find` endpoint with Pydantic request/response
- [x] `main.py` — FastAPI app with CORS middleware + products router
- [x] tested and working via FastAPI `/docs`

### frontend
- [x] Expo project set up (SDK 54)
- [x] Expo Go working on phone via ngrok tunnel
- [x] `App.js` (now `ProductFinder.js`) — product finder screen
  - [x] text input + search button
  - [x] loading spinner (`ActivityIndicator`)
  - [x] markdown response card with ✕ clear button
  - [x] connected to backend via ngrok URL
- [x] `HomeScreen.js` — home page
  - [x] title + tagline
  - [x] 2x2 grid of feature cards with emojis
  - [x] navigation to ProductFinder on tap
- [x] `App.js` — navigation setup (`NavigationContainer` + `NativeStackNavigator`)
- [x] back button on ProductFinder

### repo
- [x] GitHub repo at `github.com/mellowfarm/glowrithm`
- [x] `.gitignore` (venv, pycache, .env, CSV, FAISS index)
- [x] `ARCHITECTURE.md`
- [x] `README.md`
- [x] MIT license

---

## 🚧 in progress

- [ ] navigation not fully wired — Ingredient, Routine, Stash screens show errors when tapped (no placeholder screens yet)
- [ ] `main.py` missing CORS middleware (already written, needs saving/restart)

---

## ⬜ todo

### backend features
- [ ] `ingredients.py` — `POST /ingredients/check` endpoint + chain
- [ ] `routine.py` — `POST /routine/build` endpoint + chain
- [ ] `stash.py` — `GET/POST /stash` (user shelf, needs DB)
- [ ] ingredient compatibility logic (flag clashes e.g. vitamin C + benzoyl peroxide)
- [ ] `cv/scanner.py` — barcode scan via Open Beauty Facts API
- [ ] `cv/scanner.py` — image upload → vision LLM → extract ingredients
- [ ] PostgreSQL setup for user stash (Neon or Railway)
- [ ] error handling + try/catch across all endpoints
- [ ] deploy backend (Railway or Render) so ngrok isn't needed

### frontend screens
- [ ] `IngredientChecker.js` — ingredient check screen
- [ ] `RoutineBuilder.js` — routine builder screen  
- [ ] `MyStash.js` — stash management screen
- [ ] placeholder screens for unbuilt tabs (so tapping doesn't crash)
- [ ] ingredient of the day widget on home screen
- [ ] bottom tab navigator (instead of stack nav for main tabs)
- [ ] keyboard avoiding view (so keyboard doesn't cover input)
- [ ] splash screen matching canva design (striped background + logo)

### polish
- [ ] custom font (Canva design uses italic serif — try `expo-font` with Playfair Display)
- [ ] proper splash screen + app icon
- [ ] swap ngrok URL for deployed backend URL
- [ ] add `CONTRIBUTING.md` or usage instructions to README

---

## 🔑 things to remember

- backend runs with: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0`
- ngrok runs with: `ngrok http 8000` (need to update URL in `ProductFinder.js` each session if it changes)
- Expo runs with: `cd frontend && npx expo start`
- FAISS index is local only — if you clone on a new machine, run `python -m app.rag.ingest` again
- OpenAI key is in `backend/.env` — never commit this!
