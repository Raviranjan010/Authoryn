# Authoryn ✦ Writing that defies gravity

Authoryn is a MERN stack blogging platform. Crafted with a minimal, bold, and editorial design aesthetic, it mimics the layout of high-end indie print magazines and premium developer blogs.

---

## 🎨 Design Philosophy
*   **Palette**: Editorial off-white (`#F7F5F0`) background, high-contrast near-black (`#111111`) text, and a single vivid interactive accent in electric indigo (`#5B4FE8`).
*   **Typography**: Serif headlines and body blocks ("Fraunces" or "Playfair Display") for readability, paired with Inter for administrative interfaces and metadata.
*   **Layout**: Balanced asymmetry (e.g. titles left, metadata stacked right) with generous whitespace and a centered `720px` reading container.
*   **Animations**: Left-to-right sliding underlines on hover and scale-pop animations on liking posts.

---

## ✨ Features
*   **Auth**: Secure JWT registration & login with a "Remember Me" option extending JWT validity to 7 days.
*   **Articles**: Full CRUD operations. Auto-generated Confict-free URL slugs, image uploads, and customizable tags.
*   **Drafts vs Published**: Save articles as drafts. Drafts show up in the owner's dashboard but are hidden from the public feed.
*   **Analytics**: Dynanmic metric cards tracking total posts, views, and likes.
*   **Debounced Views**: Session-based view tracker (using client IP + slug caching) to ensure views are counted once per session.
*   **Comments & Likes**: Interactive likes and comment sections with full **optimistic UI updates** for instant visual feedback.
*   **Search & Discovery**: Inline expanding search bar (debounced at `400ms`), sorting options (by views, likes, or newest), and scrollable tag filter bars.
*   **Uploads Fallback**: Uploads work seamlessly out-of-the-box using local storage. When Cloudinary credentials are added to the `.env` file, the platform automatically switches to Cloudinary CDN storage.

---

## 📁 Repository Structure
```
antigravity/
  ├── client/              # React + Vite Frontend
  │    ├── src/
  │    │    ├── components/ # Navbar, PostCard, LikeButton, CommentSection, etc.
  │    │    ├── pages/      # Home, PostDetail, AuthorProfile, Dashboard, etc.
  │    │    ├── context/    # AuthContext.jsx (session & login state)
  │    │    └── hooks/      # usePosts.js, useDebounce.js, useAuth.js
  │    └── vite.config.js   # Proxy configuration
  ├── server/              # Express + Mongoose REST API
  │    ├── config/          # db.js connection & cloudinary.js multer engine
  │    ├── controllers/     # Controller logic for auth, posts, users, comments
  │    ├── middleware/      # JWT protection, role checks, and error parser
  │    ├── models/          # MongoDB schemas
  │    ├── routes/          # REST API endpoints
  │    └── seed.js          # Database seeding script
  ├── .gitignore           # Ignores dependencies, builds, and uploads
  ├── .env                 # Server configurations
  └── README.md
```

---

## ⚡ Quick Start

### 1. Configure Environment
Create a `.env` file in the root directory (based on the sample below):
```env
MONGO_URI=mongodb://127.0.0.1:27017/authoryn
JWT_SECRET=supersecret_token_key_here
PORT=5000

# Optional Cloudinary credentials (defaults to local storage if blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2. Install Dependencies
Run the install command from the root directory:
```bash
npm run install-all
```

### 3. Seed Database
Inject the seed data (creates demo users, published posts, and comments):
```bash
npm run seed
```

### 4. Run Development Servers
Start both the React Vite frontend and the Express backend concurrently:
```bash
npm run dev
```
Open `http://localhost:5173` to view the website.

---

## 📦 Production Deployment
See the detailed [Deployment & Usage Guide](file:///C:/Users/raviranjan/.gemini/antigravity/brain/4e2f5305-c7fb-458f-b899-7b4d88f69044/deployment_guide.md) in the artifacts folder for instructions on deploying to Render, Heroku, or Railway.