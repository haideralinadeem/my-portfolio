# Personal Portfolio — HTML + CSS + JavaScript + Node.js + JSON

A dependency-free, responsive full-stack starter portfolio.

## Requirements
- Node.js 18 or newer

## Run locally
1. Open the `personal-portfolio` folder in VS Code.
2. Open its terminal.
3. Run `npm start`.
4. Visit http://localhost:3000

You can use `npm run dev` to restart the server automatically when backend files change.

## Customize
- `public/index.html` — your name, bio, email address, GitHub, LinkedIn, and skills.
- `public/style.css` — design, layout, and colors.
- `public/script.js` — interactive project cards and contact form.
- `data/projects.json` — replace all three demo project ideas with projects you have actually made; add public project URLs in `link`.
- `server.js` — Node.js API and static file server.
- `data/messages.json` — saved form submissions, stored **locally on your server**.
- `package.json` — application scripts.

## API
- `GET /api/projects` — reads `data/projects.json`
- `POST /api/contact` — validates and stores form submissions in `data/messages.json`

## Deployment warning
This contact form **does not send email**. It saves messages locally, so you must access `data/messages.json` on the server to read them. For a publicly deployed site, replace file storage with a database or trusted email/contact service, add spam/rate protection and a privacy notice, and ensure contact data is protected. On serverless or ephemeral hosting, local messages can disappear.
