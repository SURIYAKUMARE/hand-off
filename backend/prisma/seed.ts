import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

export async function seed() {
  console.log('Seeding HelpDesk 360 database...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. Seed Users
  const usersData = [
    {
      name: 'Priya Nair',
      email: 'priya.nair@helpdesk.local',
      passwordHash,
      role: 'EMPLOYEE',
    },
    {
      name: 'Kavya Raman',
      email: 'kavya.raman@helpdesk.local',
      passwordHash,
      role: 'EMPLOYEE',
    },
    {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
    },
    {
      name: 'Rahul Menon',
      email: 'rahul.menon@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
    },
    {
      name: 'Neha Sharma',
      email: 'neha.sharma@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
    },
  ];

  const userMap: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
    userMap[u.email] = user;
    console.log(`User created/updated: ${user.name} (${user.role}) - ${user.email}`);
  }

  // 2. Clear existing tickets to avoid conflict on fresh seed run
  const existingCount = await prisma.ticket.count();
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing tickets. Resetting ticket data for clean seed...`);
    await prisma.comment.deleteMany({});
    await prisma.ticketEvent.deleteMany({});
    await prisma.statusHistory.deleteMany({});
    await prisma.ticket.deleteMany({});
  }

  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 3600 * 1000);

  // 3. Seed Realistic Tickets with full history and events
  const ticketsToSeed = [
    {
      ticketNumber: 'HD-1042',
      title: 'Laptop does not boot after update',
      description: 'After applying the cumulative Windows OS update yesterday evening, my Dell Latitude laptop is stuck on a black screen with a flashing cursor. Force power cycle does not resolve the issue. I am unable to access local files or join standup calls.',
      category: 'HARDWARE',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: 'arjun.mehta@helpdesk.local',
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(1),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'arjun.mehta@helpdesk.local', at: hoursAgo(4) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: hoursAgo(5) },
        { type: 'ASSIGNED', actor: 'arjun.mehta@helpdesk.local', old: null, new: 'Arjun Mehta', at: hoursAgo(4.5) },
        { type: 'STATUS_CHANGED', actor: 'arjun.mehta@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: hoursAgo(4) },
      ],
      comments: [
        { author: 'arjun.mehta@helpdesk.local', content: 'Bringing a recovery USB drive to your desk at Floor 3. Will check BIOS boot partition.', at: hoursAgo(3.8) },
        { author: 'priya.nair@helpdesk.local', content: 'Thank you Arjun. I am at desk 304 near the cafeteria.', at: hoursAgo(3.5) },
      ],
    },
    {
      ticketNumber: 'HD-1043',
      title: 'Wi-Fi drops in meeting room 3',
      description: 'During client presentations in Executive Meeting Room 3, wireless connection intermittently drops every 10-15 minutes. Multiple attendees on different devices experienced the same disconnect issue.',
      category: 'NETWORK',
      priority: 'HIGH',
      status: 'OPEN',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: null,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(3),
      history: [],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: hoursAgo(3) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1044',
      title: 'VPN licence expired',
      description: 'Cisco AnyConnect client shows license validation failure code 403 when connecting to regional gateway. Unable to access internal staging cluster remotely.',
      category: 'SOFTWARE',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      reporterEmail: 'kavya.raman@helpdesk.local',
      technicianEmail: 'rahul.menon@helpdesk.local',
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(8),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'rahul.menon@helpdesk.local', at: hoursAgo(20) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'rahul.menon@helpdesk.local', at: hoursAgo(8) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: daysAgo(1) },
        { type: 'ASSIGNED', actor: 'rahul.menon@helpdesk.local', old: null, new: 'Rahul Menon', at: hoursAgo(21) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: hoursAgo(20) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: hoursAgo(8) },
      ],
      comments: [
        { author: 'rahul.menon@helpdesk.local', content: 'Renewed the security certificate and allocated a refreshed device seat in Cisco portal. Please reconnect.', at: hoursAgo(8) },
        { author: 'kavya.raman@helpdesk.local', content: 'Connection successful. Everything works now, thank you!', at: hoursAgo(7) },
      ],
    },
    {
      ticketNumber: 'HD-1045',
      title: 'Account locked after password reset',
      description: 'Self-service portal password change did not synchronize with Active Directory. Reached maximum 5 attempts on SSO workstation login.',
      category: 'ACCOUNT_ACCESS',
      priority: 'URGENT',
      status: 'CLOSED',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: 'neha.sharma@helpdesk.local',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(1),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'neha.sharma@helpdesk.local', at: daysAgo(1.9) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'neha.sharma@helpdesk.local', at: daysAgo(1.5) },
        { from: 'RESOLVED', to: 'CLOSED', by: 'neha.sharma@helpdesk.local', at: daysAgo(1) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: daysAgo(2) },
        { type: 'ASSIGNED', actor: 'neha.sharma@helpdesk.local', old: null, new: 'Neha Sharma', at: daysAgo(1.95) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: daysAgo(1.9) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: daysAgo(1.5) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'RESOLVED', new: 'CLOSED', at: daysAgo(1) },
      ],
      comments: [
        { author: 'neha.sharma@helpdesk.local', content: 'Unlocked account in domain controller and triggered directory replication. Temporary PIN sent via SMS.', at: daysAgo(1.5) },
      ],
    },
    {
      ticketNumber: 'HD-1046',
      title: 'Monitor flickers intermittently',
      description: 'External 27-inch secondary monitor flickers black for 2 seconds every few minutes over HDMI. Tested different cable with same behavior.',
      category: 'HARDWARE',
      priority: 'LOW',
      status: 'OPEN',
      reporterEmail: 'kavya.raman@helpdesk.local',
      technicianEmail: null,
      createdAt: hoursAgo(18),
      updatedAt: hoursAgo(18),
      history: [],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: hoursAgo(18) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1047',
      title: 'Unable to access shared network drive',
      description: 'Mapped Z: drive (\\\\nas-corp\\marketing) returns network path not found error 0x80070035 after domain controller patch.',
      category: 'NETWORK',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      reporterEmail: 'kavya.raman@helpdesk.local',
      technicianEmail: 'arjun.mehta@helpdesk.local',
      createdAt: hoursAgo(12),
      updatedAt: hoursAgo(2),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'arjun.mehta@helpdesk.local', at: hoursAgo(2) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: hoursAgo(12) },
        { type: 'ASSIGNED', actor: 'arjun.mehta@helpdesk.local', old: null, new: 'Arjun Mehta', at: hoursAgo(2.5) },
        { type: 'STATUS_CHANGED', actor: 'arjun.mehta@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: hoursAgo(2) },
      ],
      comments: [
        { author: 'arjun.mehta@helpdesk.local', content: 'Investigating Kerberos ticket cache on workstation.', at: hoursAgo(2) },
      ],
    },
    {
      ticketNumber: 'HD-1048',
      title: 'Printer unavailable on office network',
      description: 'Floor 2 East HP LaserJet printer is in offline state on Windows print spooler. IP ping replies but port 9100 is not accepting raw print jobs.',
      category: 'HARDWARE',
      priority: 'LOW',
      status: 'RESOLVED',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: 'rahul.menon@helpdesk.local',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(2),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'rahul.menon@helpdesk.local', at: daysAgo(2.8) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'rahul.menon@helpdesk.local', at: daysAgo(2) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: daysAgo(3) },
        { type: 'ASSIGNED', actor: 'rahul.menon@helpdesk.local', old: null, new: 'Rahul Menon', at: daysAgo(2.9) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: daysAgo(2.8) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: daysAgo(2) },
      ],
      comments: [
        { author: 'rahul.menon@helpdesk.local', content: 'Power cycled printer network card and cleared stuck paper queue in spooler.', at: daysAgo(2) },
      ],
    },
    {
      ticketNumber: 'HD-1049',
      title: 'Microsoft Teams microphone not detected',
      description: 'Built-in Realtek audio microphone works in Windows Voice Recorder but Teams app shows "No audio devices found" under device settings.',
      category: 'SOFTWARE',
      priority: 'MEDIUM',
      status: 'OPEN',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: null,
      createdAt: hoursAgo(7),
      updatedAt: hoursAgo(7),
      history: [],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: hoursAgo(7) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1050',
      title: 'Production database read replica latency spike',
      description: 'Read-only queries on European replica lag primary by over 450 seconds. Automated replication health check alert triggered.',
      category: 'NETWORK',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      reporterEmail: 'kavya.raman@helpdesk.local',
      technicianEmail: 'neha.sharma@helpdesk.local',
      createdAt: hoursAgo(1),
      updatedAt: hoursAgo(0.5),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'neha.sharma@helpdesk.local', at: hoursAgo(0.5) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: hoursAgo(1) },
        { type: 'ASSIGNED', actor: 'neha.sharma@helpdesk.local', old: null, new: 'Neha Sharma', at: hoursAgo(0.8) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: hoursAgo(0.5) },
      ],
      comments: [
        { author: 'neha.sharma@helpdesk.local', content: 'Analyzing slow query logs on Frankfurt reader instance. High IOPS throttle detected.', at: hoursAgo(0.3) },
      ],
    },
    {
      ticketNumber: 'HD-1051',
      title: 'New hire GitHub Enterprise seat request',
      description: 'New frontend developer joining next Monday requires organization membership and repo write permissions for web-core repository.',
      category: 'ACCOUNT_ACCESS',
      priority: 'HIGH',
      status: 'OPEN',
      reporterEmail: 'kavya.raman@helpdesk.local',
      technicianEmail: 'rahul.menon@helpdesk.local',
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(6),
      history: [],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: hoursAgo(10) },
        { type: 'ASSIGNED', actor: 'rahul.menon@helpdesk.local', old: null, new: 'Rahul Menon', at: hoursAgo(6) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1052',
      title: 'Docking station USB ports unresponsive',
      description: 'Kensington Thunderbolt dock connects to video output properly but connected mouse, keyboard, and webcam lose power intermittently.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'OPEN',
      reporterEmail: 'priya.nair@helpdesk.local',
      technicianEmail: null,
      createdAt: hoursAgo(14),
      updatedAt: hoursAgo(14),
      history: [],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: hoursAgo(14) },
      ],
      comments: [],
    },
  ];

  for (const item of ticketsToSeed) {
    const reporter = userMap[item.reporterEmail];
    const technician = item.technicianEmail ? userMap[item.technicianEmail] : null;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: item.ticketNumber,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        reporterId: reporter.id,
        assignedTechnicianId: technician ? technician.id : null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });

    // Create history
    for (const h of item.history) {
      const changer = userMap[h.by];
      await prisma.statusHistory.create({
        data: {
          ticketId: ticket.id,
          previousStatus: h.from,
          newStatus: h.to,
          changedBy: changer.id,
          changedAt: h.at,
        },
      });
    }

    // Create events
    for (const ev of item.events) {
      const actor = userMap[ev.actor];
      await prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          eventType: ev.type,
          actorId: actor.id,
          oldValue: ev.old || null,
          newValue: ev.new || null,
          createdAt: ev.at,
        },
      });
    }

    // Create comments
    for (const c of item.comments) {
      const author = userMap[c.author];
      await prisma.comment.create({
        data: {
          ticketId: ticket.id,
          authorId: author.id,
          content: c.content,
          createdAt: c.at,
          updatedAt: c.at,
        },
      });
    }

    console.log(`Ticket seeded: ${ticket.ticketNumber} - ${ticket.title} (${ticket.status})`);
  }

  console.log('Seeding completed successfully!');
}

if (require.main === module) {
  seed()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
