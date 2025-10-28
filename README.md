# Pilates Scheduler

A **Next.js calendar scheduling app** built for self-employed Pilates professionals.  
Manage sessions, clients, and time blocks all in one intuitive weekly and monthly view.

**Live Demo:** [pilates-scheduler.vercel.app](https://pilates-scheduler.vercel.app/) - Free, secure login via Google 

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-18181B?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Features

- **Month and Week Views** — switch easily between layouts  
- **Create Booking form** — populate the calendar with new sessions
- **Edit Booking form** — switch between the recurring series or individual booking 
- **Colour-coded events** — indicate paid, unpaid, blocked, or held sessions  
- **Responsive design** — works smoothly on mobile, tablet and desktop  
- **User authentication** — each user’s calendar is stored privately  
- **Supabase + Prisma backend** — scalable, secure data storage  
- **Deployed on Vercel**

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/) |
| Backend | Supabase (Auth + DB), Prisma ORM |
| Deployment | Vercel |

---

## Folder Structure

```app/ 
      (actions)/ # Server actions to create and update bookings
      (root)/ # Day and Week pages
      signin/ # Signin page
      components/ # UI components
      lib/ # Helpers and validation```

