<br />
<div align="center">
  <h3 align="center">KnotExam</h3>

  <p align="center">
    KnotExam is a modern online exam platform that’s clean, simple, and easy to use!
    <br />
    <br />
    <a href="https://knot.nizar.my.id">View Demo</a>
    &middot;
    <a href="https://github.com/nizaralghifary/knot/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
  </p>
  <p align="center">
    It's an online exam platform designed for schools and teachers that need a fast, secure, and easy to manage examination system
  </p>
</div>

### Tech Stack
- Next.js
- React
- Tailwind
- Shadcn UI
- Auth.js
- Resend
- Drizzle ORM 
- Neon DB

### Features
#### User
- Dark Mode
- Responsive UI
- OTP Verification with Resend
- Exam Timer
- Auto Submit When Timeout
- View Exam Result

#### Admin
- Dark Mode
- Responsive UI
- Create, Edit, Delete, and View Exam
- Manage User Account
- View Exam Result per User

> If you want to try Admin Features login with `Test` username and `XEF6ZVVBUC4KdQs` password

### Installation

**Clone Repository**
```bash
git clone https://github.com/nizaralghifary/knot.git
cd knot
bun install
```

> Make sure `bun` is installed on your device, if your device doesn't installed it, run `curl -fsSL https://bun.com/install | bash` or `npm i -g bun`. See https://bun.com/docs/installation

**Setup `.env.local`**

Replace `.env.example` to `.env.local` and fill every variable below
```env
AUTH_SECRET= # bunx auth secret
AUTH_RESEND_KEY= # your resend api key
DATABASE_URL= # your neon postgresql url
```

> Note: You have to setup Resend SMTP, change my domain with your own domain in `/app/api/auth/request/route.ts`. See https://resend.com/docs/send-with-smtp

**Upload Database Schema**
```bash
bun db:generate
bun db:migrate
```
or 
```bash
bun db:push 
```

> If you want to upload the database schema without migration file just choice option 2

**Run**
```bash
bun dev 
```