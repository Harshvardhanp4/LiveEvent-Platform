const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@liveevent.com" },
        update: {},
        create: {
        name: "Admin User",
        email: "admin@liveevent.com",
        passwordHash: adminPassword,
        role: "ADMIN",
        },
    });

    // Create host user
    const hostPassword = await bcrypt.hash("host123", 12);
    const host = await prisma.user.upsert({
        where: { email: "host@liveevent.com" },
        update: {},
        create: {
        name: "Event Host",
        email: "host@liveevent.com",
        passwordHash: hostPassword,
        role: "HOST",
        },
    });

    // Create participant user
    const participantPassword = await bcrypt.hash("user123", 12);
    const participant = await prisma.user.upsert({
        where: { email: "user@liveevent.com" },
        update: {},
        create: {
        name: "John Participant",
        email: "user@liveevent.com",
        passwordHash: participantPassword,
        role: "PARTICIPANT",
        },
    });

    // Create sample event
    const event = await prisma.event.create({
        data: {
        title: "Tech Conference 2024",
        description:
            "Join us for an exciting tech conference with interactive sessions, live polls, and Q&A.",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        hostId: host.id,
        bannerUrl:
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
        },
    });

    // Add participant to event
    await prisma.participant.create({
        data: {
        userId: participant.id,
        eventId: event.id,
        },
    });

    // Create sample quiz
    await prisma.quiz.create({
        data: {
        eventId: event.id,
        question: "What is the most popular programming language in 2024?",
        options: ["JavaScript", "Python", "Java", "TypeScript"],
        correctAnswer: 1,
        timeLimit: 30,
        },
    });

    // Create sample poll
    await prisma.poll.create({
        data: {
        eventId: event.id,
        question: "Which technology are you most excited about?",
        options: ["AI/ML", "Web3", "Cloud Computing", "Mobile Development"],
        responses: {},
        },
    });

    console.log("✅ Database seeded successfully!");
    console.log("👤 Admin: admin@liveevent.com / admin123");
    console.log("🎤 Host: host@liveevent.com / host123");
    console.log("👥 User: user@liveevent.com / user123");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
