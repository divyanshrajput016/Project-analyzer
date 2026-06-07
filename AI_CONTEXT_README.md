# AI Powered Resume Analyser - Project Context

This file is for giving context to any AI assistant before asking it to edit this project.

The project is mostly written manually by the owner, especially the backend. Future code should follow the existing backend style closely.

## Important Note

The analyze and reports pages in the frontend were created by AI.

Ignore these files when learning the owner's coding style:

- `client/app/(feature)/analyze/page.jsx`
- `client/app/(feature)/reports/page.jsx`
- `client/app/(feature)/reports/[slug]/page.jsx`

Do not copy the style from those pages unless the user specifically asks to work on them.

## Project Overview

This is an AI powered resume analyser application.

The app allows users to:

- Register and login
- Upload a resume PDF
- Add self description data
- Add job description data
- Generate an AI interview report
- Store generated reports in MongoDB
- Fetch all previous reports
- Fetch a single report by id

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Cookie based auth
- Multer for file upload
- pdf-parse for PDF text extraction
- Google GenAI for AI report generation

Frontend:

- Next.js
- React
- Tailwind CSS
- Axios
- Context API
- Custom hooks

DevOps:

- Docker
- Docker Compose

## Folder Structure

```txt
.
├── client
│   ├── app
│   │   ├── (auth)
│   │   │   ├── login
│   │   │   └── signup
│   │   ├── (feature)
│   │   │   ├── analyze
│   │   │   └── reports
│   │   ├── about
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   ├── context
│   ├── hooks
│   ├── services
│   └── public
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controller
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── service
│   ├── app.js
│   ├── server.js
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## Backend Style To Follow

The backend uses simple CommonJS modules.

Use this style:

```js
const express = require("express")
const router = express.Router();

module.exports = router;
```

Prefer:

- `require(...)`
- `module.exports`
- normal async functions
- simple file names
- direct controller logic
- plain object responses
- small modules
- simple route/controller/model/service separation

Avoid:

- unnecessary classes
- over abstracted service layers
- TypeScript in the backend
- complex helper factories
- decorators
- dependency injection patterns
- too many new folders

## Backend Naming Style

The project commonly uses names like:

- `authRoutes`
- `interviewRoutes`
- `authMiddleware`
- `fileMiddleware`
- `authController`
- `interviewController`
- `userModel`
- `blacklistModel`
- `reportModel`
- `generateResumeReport`

Controller function names are direct and action based:

- `registerUser`
- `loginUser`
- `logoutUser`
- `getMe`
- `generteReport`
- `getAllReports`
- `getReportById`

Keep future function names simple and similar.

## Backend Route Pattern

Routes are defined in route files and connected in `server/app.js`.

Example:

```js
router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.get("/get-me",authMiddleware, getMe)
```

Keep the route file small.

Do not put business logic in route files.

## Backend Controller Pattern

Controllers are async functions that receive `req,res`.

Example style:

```js
async function loginUser(req,res) {
    const {identifier,password} = req.body

    const user = await userModel.findOne({
        $or : [
            {username : identifier},
            {email : identifier}
        ]
    })

    if(!user) {
        return res.status(409).json({
            message : "User not Found"
        })
    }

    return res.status(200).json({
        message : "User logged in successfully",
        user : {
            id : user._id,
            username : user.username,
            email : user.email
        }
    })
}
```

Use simple validation with early returns:

```js
if(!username || !email || !password) {
    return res.status(400).json({
        message : "All fields are required"
    })
}
```

Use direct JSON messages.

## Error Handling Style

For small auth functions, the code currently uses direct async logic.

For bigger flows like report generation, use `try/catch`:

```js
try {
    // main logic
} catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating report" });
}
```

Keep errors simple and readable.

Do not add a global error handler unless the user asks for it.

## Auth Style

Authentication uses:

- JWT token
- cookie named `token`
- blacklist collection for logout
- `authMiddleware` to protect routes

Token is created with:

```js
const token = jwt.sign({id : user._id , username : user.username, time: new Date()},process.env.JWT_SECRET,{
    expiresIn : "1d",
    jwtid: require("crypto").randomUUID()
})
```

The middleware reads:

```js
const token = req.cookies.token;
```

Then it verifies token and sets:

```js
req.user = decoded
```

Follow this pattern for protected backend routes.

## Mongoose Model Style

Models are in `server/src/models`.

Use direct schemas and export the model.

Example:

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        require: true,
        unique:true
    }
})

const user = mongoose.model("user",userSchema);

module.exports = user
```

The code uses both single quotes and double quotes in some places, but backend files mostly use simple CommonJS and readable schema blocks.

When adding schemas:

- keep fields explicit
- use nested schemas if needed
- use `{ _id: false }` for embedded objects when needed
- use `timestamps: true` when records need created/updated time

## AI Service Style

AI logic is placed in:

```txt
server/src/service/aiService.js
```

The AI service:

- creates a prompt
- defines a response schema
- calls Gemini
- parses JSON
- returns parsed data to controller

Keep AI logic inside service files, not controllers.

Controller should call service like:

```js
const interviewReportByAI = await generateResumeReport({resumeDescriptionData , selfDescriptionData , jobDescriptionData});
```

## File Upload Style

File upload uses Multer memory storage.

The middleware is in:

```txt
server/src/middleware/fileMiddleware.js
```

Current style:

```js
const multer = require("multer")

const upload = multer({
    Storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
})

module.exports = upload
```

Use this middleware in routes with:

```js
upload.single("resume")
```

## Frontend Style To Follow

For frontend code written by the owner, the style is:

- simple React components
- Tailwind classes directly in JSX
- Context API for global state
- custom hooks for actions
- service files for API calls
- `use client` for client components
- simple state with `useState`
- direct navigation with `useRouter`

Example frontend pattern:

```js
"use client";
import { useContext } from "react";
import { authContext } from "@/context/auth.context";

export const useAuth = () => {
    const context = useContext(authContext);
    const {user , setUser , loading , setLoading} = context;

    return { user, setUser, loading, setLoading };
}
```

Frontend API calls are usually inside `client/services`.

Example:

```js
const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    identifier , password
}, {
    withCredentials: true
})
```

## Frontend Visual Style

The owner-written frontend uses:

- black background
- white text
- Tailwind gradients
- rounded forms/buttons
- simple navbar
- large headings
- direct layout using flex

Examples:

- `bg-black`
- `text-white`
- `bg-linear-to-r from-blue-500 to-purple-500`
- `rounded-4xl`
- `flex justify-center`
- `w-120`
- `h-130`

Do not make the frontend too polished or too different unless asked.

## Docker Style

The backend Dockerfile is simple:

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Docker Compose has two services:

- `client`
- `server`

Each service uses an `.env` file and maps ports.

## Current Backend API

Auth routes:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/get-me
```

AI/report routes:

```txt
POST /api/ai/analyze
GET  /api/ai/reports
GET  /api/ai/report/:id
```

## Environment Variables

Server expects:

```txt
MONGO_URI=
JWT_SECRET=
GOOGLE_API_KEY=
FRONTEND_URL=
```

Client expects:

```txt
NEXT_PUBLIC_API_URL=
```

## How To Add New Backend Code

When adding a new backend feature:

1. Add or update the Mongoose model in `server/src/models`
2. Add controller function in `server/src/controller`
3. Add route in `server/src/routes`
4. Add middleware only if needed
5. Register route in `server/app.js` if it is a new route group
6. Keep response messages simple

Example response:

```js
return res.status(200).json({
    message : "Something fetched successfully",
    data
})
```

## Style Rules For Future AI Assistants

Follow these rules:

- Read the existing backend code before editing
- Keep code simple and close to the current style
- Do not rewrite large parts of the project
- Do not introduce new architecture unless requested
- Do not convert backend to ES modules
- Do not convert backend to TypeScript
- Do not copy style from the AI-created analyze/reports pages
- Avoid unnecessary comments
- Use simple names
- Keep controllers readable
- Keep services focused
- Keep routes thin
- Use the existing cookie auth pattern
- Use Mongoose directly
- Prefer small changes

## Known Style Details

The project has some informal formatting choices:

- semicolons are mixed
- spacing around commas is mixed
- function parameters often use `req,res`
- object keys often use spaces around colon like `message : "..."`
- JSX uses direct Tailwind class strings
- backend code is practical and direct

Future edits do not need to perfectly copy every spacing inconsistency, but should feel like they belong in the same project.

## Short Prompt To Give AI Later

Use this prompt when asking another AI to work on this project:

```txt
Read AI_CONTEXT_README.md first.

This project is mostly manually written, especially the backend. Follow the existing backend style closely: CommonJS, simple Express controllers, Mongoose models, thin routes, direct JSON responses, and minimal abstraction.

Ignore the frontend analyze and reports pages when learning style because those were AI-created.
```

