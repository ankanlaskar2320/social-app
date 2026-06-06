# Social App

A full-stack social media web application inspired by the TaskPlanet social feed, built as part of the 3W Business Private Limited internship assignment.

## Live Demo
- Frontend: https://social-app-theta-lac.vercel.app
- Backend: https://social-app-backend-qulo.onrender.com

## Tech Stack

**Frontend**
- React.js
- React Router DOM
- Axios
- React Icons
- Emoji Picker React

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT Authentication
- Bcryptjs
- Cloudinary (image storage)
- Multer
- Express Rate Limit

## Features

### Core Features
- Signup and Login with email and password
- JWT-based authentication
- Create posts with text, image, or both
- Public feed showing all users posts
- Like and unlike posts (saves usernames of people who liked)
- Comment on posts (saves usernames of people who commented)

### Extra Features
- **Infinite Scroll Pagination** — feed loads 5 posts at a time, more load on clicking more posts as you scroll
- **Delete Post** — users can delete only their own posts
- **Edit Profile** — update username, email or password; all existing posts update automatically
- **Filter Tabs** — filter feed by All Posts, Most Liked, Most Commented
- **Search** — search posts and users in real time from the navbar
- **Emoji Picker** — add emojis to posts from the create post modal
- **LinkedIn-style Create Post** — clicking Start a post opens a modal instead of an inline form
- **Profile Dropdown** — click your avatar to see My Profile, My Stats, and Logout options
- **Stats Modal** — see your total posts, likes received, and comments received
- **Relative Timestamps** — shows 2 hours ago style timestamps on all posts
- **Liked by names** — shows who liked a post below the like count
- **Unique avatar colors** — every user gets a different colored avatar based on their name
- **Rate Limiting** — login and signup limited to 5 attempts per minute, post creation limited to 10 per minute
- **Cloudinary CDN** — all images uploaded to Cloudinary and served via CDN
- **Responsive Layout** — works on desktop, tablet and mobile

## Project Structure

social-app/
├── backend/
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   └── server.js
│
└── frontend/
    └── src/
    |   ├── pages/
    |   │   ├── Login.jsx
    |   │   ├── Signup.jsx
    |   │   └── Feed.jsx
    |    └── components/
    |       └── PostCard.jsx
    |__ App.jsx

## Security
- Passwords hashed with bcryptjs before storing
- JWT tokens expire after 7 days
- Protected routes verified via auth middleware
- Rate limiting on auth and post routes
- All secrets stored in environment variables

## Running Locally

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

**Environment Variables**

Create a `.env` file inside the `backend/` folder with these keys:
PORT=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=


## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/signup | Create account | No |
| POST | /api/auth/login | Login | No |
| PUT | /api/auth/update | Update profile | Yes |
| GET | /api/posts | Get all posts paginated | No |
| POST | /api/posts | Create post | Yes |
| PUT | /api/posts/:id/like | Like or unlike post | Yes |
| POST | /api/posts/:id/comment | Comment on post | Yes |
| DELETE | /api/posts/:id | Delete post | Yes |

## Author
Ankan Laskar — ECE, NIT Agartala
GitHub: [@ankanlaskar2320](https://github.com/ankanlaskar2320)



