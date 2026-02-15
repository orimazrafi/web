# העלאת האפליקציה (Deploy)

## פריסת הפרונט לאתר (GitHub Pages)

ה-CI מריץ אוטומטית עם כל דחיפה ל-`main`:

1. **Test** – הרצת טסטים (פרונט + typecheck של הבקאנד)
2. **Build and Deploy** – בניית הפרונט והעלאת הקבצים לענף `gh-pages`

### הפעלת GitHub Pages (כך יופיע לך משהו תחת Pages)

1. ב-GitHub: **Settings** → **Pages**
2. תחת **Build and deployment**:
   - **Source:** בחר **Deploy from a branch**
   - **Branch:** בחר `gh-pages` ותיקייה **/ (root)**
   - שמור (Save)
3. דחוף ל-`main` (או הרץ את ה-workflow ידנית – **Actions** → **CI and Deploy** → **Run workflow**). אחרי שהרצה תסתיים, ה-workflow ידחוף את ה-build לענף `gh-pages`.
4. האתר יהיה זמין ב: **`https://<username>.github.io/<repository-name>/`**

אם תחת **Pages** לא היה לך כלום – עכשיו אחרי בחירת "Deploy from a branch" ו-`gh-pages` יופיעו שם הגדרות האתר והכתובת.

---

## פריסת הבקאנד (Node)

הפרונט ב-production קורא ל-CoinGecko ישירות (אלא אם מגדירים `VITE_API_URL` ב-build).

אם רוצים שהבקאנד ירוץ בפרודקשן:

1. **Render / Railway / Fly.io** – חברו את הריפו ובחרו את תיקיית `backend` (או Dockerfile).
2. הגדרת **Build:** `cd backend && npm ci && npm run build`  
   **Start:** `cd backend && node build/index.js`
3. בהרצת build של הפרונט, הגדירו **Environment variable:**  
   `VITE_API_URL=https://<your-backend-url>`  
   כדי שהאפליקציה תפנה לבקאנד ולא ל-CoinGecko.

---

## סיכום

| שלב              | מתי רץ   | מה עושה                                              |
|------------------|----------|------------------------------------------------------|
| Test             | כל push ל-main | `npm run test:ci`, `backend npm run ts`             |
| Build and Deploy | אחרי ש-Test עבר | `npm run build` + דחיפת `dist` לענף `gh-pages`     |
