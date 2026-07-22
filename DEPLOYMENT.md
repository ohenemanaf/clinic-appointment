# Comprehensive Deployment Guide 🚀

Deploying a full-stack application completely for free is highly achievable using modern cloud providers. Because this app uses **MySQL, Node.js, and React (Vite)**, here is the exact step-by-step methodology to get it live on the internet!

---

## 1. Hosting the Database (MySQL)
Your database must be hosted in the cloud so your backend can connect to it from anywhere.

**Recommended Service:** [Aiven](https://aiven.io/) or [TiDB Serverless](https://en.pingcap.com/tidb-serverless/)
- **Why:** Both offer generous, completely free tiers for MySQL-compatible databases that never sleep.

**Steps:**
1. Create a free account on your chosen provider.
2. Provision a new "Free Tier MySQL" database.
3. Once created, the dashboard will provide you with connection credentials (Host, Port, Username, Password).
4. **Initialize the Schema:** Use a local SQL tool (like MySQL Workbench, DBeaver, or Beekeeper Studio) to connect to this remote database using those credentials.
5. Copy everything inside `backend/schema.sql` and run it against the remote database to create your tables.

---

## 2. Hosting the Backend (Node.js API)
Your Node.js server acts as the bridge between your cloud database and your frontend website.

**Recommended Service:** [Render](https://render.com/)
- **Why:** Render offers a fantastic "Free Web Service" tier designed specifically for Node.js backends. 

**Steps:**
1. Upload your entire project codebase to a repository on **GitHub**.
2. Go to Render.com, create an account, and click **New > Web Service**.
3. Connect your GitHub account and select your repository.
4. Set the **Root Directory** to `backend`.
5. Set the **Build Command** to: `npm install`
6. Set the **Start Command** to: `node server.js`
7. **Crucial Step - Environment Variables:** Scroll down to the Environment Variables section and add the credentials provided by your Cloud Database in Step 1:
   - `DB_HOST`: (Your cloud database host URL)
   - `DB_USER`: (Your database username)
   - `DB_PASSWORD`: (Your database password)
   - `DB_NAME`: `clinic_db`
   - `JWT_SECRET`: (Create a random, long string of text here)
8. Click **Deploy**. Render will generate a live URL for your API (e.g., `https://clinic-api.onrender.com`).

---

## 3. Hosting the Frontend (React UI)
Your beautiful React interface needs a blazing fast content delivery network (CDN) to host the static HTML/JS files.

**Recommended Service:** [Vercel](https://vercel.com/)
- **Why:** Vercel is the creator of Next.js and the absolute best platform for hosting React and Vite applications for free.

**Steps:**
1. **Update API Base URL:** Before deploying, open your code editor and go to `frontend/src/utils/api.js`. You must change the `baseURL` from `http://localhost:5000/api` to the live Render URL you generated in Step 2! (e.g., `https://clinic-api.onrender.com/api`).
2. Push this change to your GitHub repository.
3. Go to Vercel.com, create a free account, and click **Add New Project**.
4. Import your GitHub repository.
5. Vercel will automatically detect that your project is located in the `frontend` folder and that it uses Vite.
6. Click **Deploy**.
7. Within 60 seconds, Vercel will provide you with a live, public, secure `https://` URL for your website!

---

## Final Verification
1. Visit your Vercel URL.
2. Register a new student account.
3. If the registration succeeds, it confirms that your Vercel Frontend is successfully talking to your Render Backend, which is successfully inserting data into your Cloud Database! 
4. Congratulations on deploying a full-stack system!
