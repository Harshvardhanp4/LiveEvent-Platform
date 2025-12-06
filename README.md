# LiveEvent Platform

A comprehensive live event platform with real-time interactive features including polls, quizzes, Q&A, and live chat.

## Features

### 🎯 Core Features
- **User Authentication** - Role-based access (Admin, Host, Participant)
- **Event Management** - Create, manage, and join live events
- **Real-time Interactions** - Live chat, polls, quizzes, and Q&A
- **Live Streaming** - Integrated video streaming capabilities
- **Analytics Dashboard** - Event statistics and participant insights
- **Admin Panel** - User management and platform oversight

### 🚀 Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Real-time**: Socket.IO
- **Authentication**: JWT with bcrypt
- **UI Components**: shadcn/ui, Radix UI

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd live-event-platform
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env` file in the root directory:
\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/liveevent"
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
\`\`\`

4. **Set up the database**
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
node scripts/seed-database.js
\`\`\`

5. **Start the development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Tailwind CSS v4

This project uses Tailwind CSS v4 with the new `@import "tailwindcss"` syntax and `@theme` configuration. The color system uses OKLCH color space for better color consistency and accessibility.

### Key Changes in v4:
- New `@import "tailwindcss"` syntax
- `@theme` configuration block
- OKLCH color space for better color handling
- Simplified configuration

## Default Users

After seeding the database, you can log in with these accounts:

- **Admin**: admin@liveevent.com / admin123
- **Host**: host@liveevent.com / host123  
- **Participant**: user@liveevent.com / user123

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── events/            # Event pages
│   ├── live/              # Live event room
│   ├── admin/             # Admin panel
│   └── settings/          # User settings
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utility libraries
├── prisma/                # Database schema
└── scripts/               # Database scripts
\`\`\`

## Key Features Explained

### 🔐 Authentication System
- JWT-based authentication with role-based access control
- Three user roles: Admin, Host, and Participant
- Secure password hashing with bcrypt

### 🎪 Event Management
- Hosts can create and manage events
- Public event discovery and registration
- Event scheduling and banner customization

### ⚡ Real-time Features
- **Live Chat**: Real-time messaging during events
- **Interactive Polls**: Create and respond to polls with live results
- **Quizzes**: Timed quizzes with leaderboards
- **Q&A Sessions**: Submit questions for host approval
- **Live Updates**: Real-time participant count and activity

### 📊 Admin Dashboard
- User management (ban/unban users)
- Event oversight and monitoring
- Activity logs and system analytics
- Platform-wide statistics

### 🎥 Live Event Room
- Integrated video streaming placeholder
- Multi-tab interface (Chat, Q&A)
- Real-time leaderboard
- Interactive quiz and poll participation

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (Host only)
- `GET /api/events/[id]` - Get event details
- `POST /api/events/[id]/join` - Join event

### Admin
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/[id]/ban` - Ban/unban user
- `GET /api/admin/events` - List all events
- `GET /api/admin/logs` - Get activity logs

## Socket.IO Events

### Client to Server
- `join-room` - Join event room
- `new-message` - Send chat message
- `quiz-response` - Submit quiz answer
- `poll-response` - Submit poll vote
- `question-submitted` - Submit Q&A question

### Server to Client
- `new-message` - Receive chat message
- `new-quiz` - New quiz started
- `new-poll` - New poll started
- `question-approved` - Q&A question approved
- `score-update` - Leaderboard update

## Deployment

### Database Setup
1. Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. Update the `DATABASE_URL` in your environment variables
3. Run database migrations: `npm run db:push`

### Environment Variables
Set these environment variables in your deployment platform:
\`\`\`env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
NEXT_PUBLIC_SITE_URL=your_deployed_url
\`\`\`

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.
