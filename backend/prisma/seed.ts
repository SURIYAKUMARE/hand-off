import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123!';

export async function seed() {
  console.log('Seeding HelpDesk 360 Enterprise database...');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. Seed Departments
  const departmentsData = [
    { name: 'Information Technology', description: 'Core IT infrastructure, hardware, and systems.' },
    { name: 'Human Resources', description: 'People operations, talent, and onboarding.' },
    { name: 'Finance', description: 'Accounting, payroll, and financial operations.' },
    { name: 'Operations', description: 'Business logistics and physical facilities.' },
    { name: 'Sales', description: 'Enterprise sales and customer accounts.' },
    { name: 'Marketing', description: 'Brand, growth, and communications.' },
    { name: 'Administration', description: 'Executive and operational administrative support.' },
  ];

  const deptMap: Record<string, any> = {};
  for (const d of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: d,
    });
    deptMap[d.name] = dept;
  }
  console.log(`Seeded ${Object.keys(deptMap).length} departments.`);

  // 2. Seed Users
  const usersData = [
    // Administrators
    {
      name: 'Vikram Aditya',
      email: 'admin@helpdesk.local',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      employeeId: 'ADM-0001',
      departmentId: deptMap['Information Technology'].id,
    },
    {
      name: 'Meera Patel',
      email: 'meera.patel@helpdesk.local',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      employeeId: 'ADM-0002',
      departmentId: deptMap['Administration'].id,
    },
    // Employees
    {
      name: 'Priya Nair',
      email: 'priya.nair@helpdesk.local',
      passwordHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: 'EMP-1001',
      departmentId: deptMap['Human Resources'].id,
    },
    {
      name: 'Kavya Raman',
      email: 'kavya.raman@helpdesk.local',
      passwordHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: 'EMP-1002',
      departmentId: deptMap['Finance'].id,
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@helpdesk.local',
      passwordHash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      employeeId: 'EMP-1003',
      departmentId: deptMap['Sales'].id,
    },
    // Technicians
    {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      employeeId: 'TECH-2001',
      departmentId: deptMap['Information Technology'].id,
    },
    {
      name: 'Rahul Menon',
      email: 'rahul.menon@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      employeeId: 'TECH-2002',
      departmentId: deptMap['Information Technology'].id,
    },
    {
      name: 'Neha Sharma',
      email: 'neha.sharma@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      employeeId: 'TECH-2003',
      departmentId: deptMap['Information Technology'].id,
    },
    {
      name: 'David Chen',
      email: 'david.chen@helpdesk.local',
      passwordHash,
      role: 'TECHNICIAN',
      status: 'ACTIVE',
      employeeId: 'TECH-2004',
      departmentId: deptMap['Information Technology'].id,
    },
  ];

  const userMap: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        status: u.status,
        employeeId: u.employeeId,
        departmentId: u.departmentId,
        passwordHash: u.passwordHash,
      },
      create: u,
    });
    userMap[u.email] = user;
    console.log(`User created/updated: ${user.name} (${user.role}) - ${user.email}`);
  }

  // 3. Seed Technician Profiles
  const techProfiles = [
    { email: 'arjun.mehta@helpdesk.local', specialization: 'HARDWARE', status: 'AVAILABLE' },
    { email: 'rahul.menon@helpdesk.local', specialization: 'NETWORK', status: 'BUSY' },
    { email: 'neha.sharma@helpdesk.local', specialization: 'SOFTWARE', status: 'AVAILABLE' },
    { email: 'david.chen@helpdesk.local', specialization: 'ACCOUNT_ACCESS', status: 'AVAILABLE' },
  ];

  for (const tp of techProfiles) {
    const u = userMap[tp.email];
    if (u) {
      await prisma.technicianProfile.upsert({
        where: { userId: u.id },
        update: {
          specialization: tp.specialization,
          status: tp.status,
        },
        create: {
          userId: u.id,
          specialization: tp.specialization,
          status: tp.status,
          maxActiveTickets: 5,
        },
      });
    }
  }

  // 4. Seed SLA Policies
  const slaPolicies = [
    { priority: 'URGENT', firstResponseMinutes: 15, resolutionMinutes: 120, businessHoursOnly: false },
    { priority: 'HIGH', firstResponseMinutes: 30, resolutionMinutes: 240, businessHoursOnly: false },
    { priority: 'MEDIUM', firstResponseMinutes: 120, resolutionMinutes: 1440, businessHoursOnly: true },
    { priority: 'LOW', firstResponseMinutes: 240, resolutionMinutes: 4320, businessHoursOnly: true },
  ];

  for (const p of slaPolicies) {
    await prisma.slaPolicy.upsert({
      where: { priority: p.priority },
      update: p,
      create: p,
    });
  }
  console.log('Seeded SLA Policies.');

  // 5. Seed Assets
  const assetsData = [
    {
      assetTag: 'LAP-0042',
      name: 'MacBook Pro 16" M3 Max',
      type: 'LAPTOP',
      serialNumber: 'C02G1829MD6R',
      assignedUserId: userMap['priya.nair@helpdesk.local'].id,
      departmentId: deptMap['Human Resources'].id,
      status: 'ACTIVE',
    },
    {
      assetTag: 'LAP-0045',
      name: 'Dell Precision 5570',
      type: 'LAPTOP',
      serialNumber: '8FK29A01',
      assignedUserId: userMap['kavya.raman@helpdesk.local'].id,
      departmentId: deptMap['Finance'].id,
      status: 'ACTIVE',
    },
    {
      assetTag: 'MON-0105',
      name: 'Dell UltraSharp 27" 4K Monitor',
      type: 'MONITOR',
      serialNumber: 'CN-0M912K',
      assignedUserId: userMap['rohan.verma@helpdesk.local'].id,
      departmentId: deptMap['Sales'].id,
      status: 'ACTIVE',
    },
    {
      assetTag: 'PRN-0012',
      name: 'HP LaserJet Enterprise M608',
      type: 'PRINTER',
      serialNumber: 'VNC3K92110',
      assignedUserId: null,
      departmentId: deptMap['Information Technology'].id,
      status: 'ACTIVE',
    },
  ];

  const assetMap: Record<string, any> = {};
  for (const a of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { assetTag: a.assetTag },
      update: a,
      create: a,
    });
    assetMap[a.assetTag] = asset;
  }
  console.log(`Seeded ${Object.keys(assetMap).length} IT assets.`);

  // 6. Seed Knowledge Base Articles
  const articlesData = [
    {
      title: 'How to connect to the corporate GlobalProtect VPN securely',
      category: 'NETWORK',
      content: `### Connecting to Corporate VPN\n\n1. Launch the **GlobalProtect** application from your system tray or taskbar.\n2. In the portal address field, enter: \`vpn.corp.company.internal\`.\n3. Enter your corporate email and SSO password.\n4. Approve the push notification on your Duo MFA authenticator app.\n5. Once connected, the shield icon will display a green checkmark.\n\n*Note: If you experience DNS resolution failures, flush your local DNS cache by running \`ipconfig /flushdns\` in PowerShell.*`,
      isPublished: true,
      authorId: userMap['admin@helpdesk.local'].id,
      views: 142,
    },
    {
      title: 'Troubleshooting meeting room Wi-Fi drops and latency',
      category: 'NETWORK',
      content: `### Resolving Conference Room Wi-Fi Issues\n\n- Ensure you are connected to the \`CORP-SECURE\` 5GHz SSID rather than \`GUEST-WIFI\`.\n- If roaming between Meeting Rooms 1-5, toggle Wi-Fi off for 5 seconds to force re-association with the nearest Cisco Catalyst access point.\n- Check whether your laptop has a static IP override enabled in network adapter settings.`,
      isPublished: true,
      authorId: userMap['rahul.menon@helpdesk.local'].id,
      views: 89,
    },
    {
      title: 'Resolving external display flickering with USB-C / Thunderbolt docking stations',
      category: 'HARDWARE',
      content: `### Display & Docking Station Troubleshooting\n\n1. Disconnect the Thunderbolt cable from your laptop.\n2. Power cycle the docking station by unplugging the 180W power supply for 10 seconds.\n3. Reconnect the power supply, then plug the Thunderbolt cable directly into the primary USB-C port.\n4. Update Intel Iris / NVIDIA graphics drivers via company Software Center.`,
      isPublished: true,
      authorId: userMap['arjun.mehta@helpdesk.local'].id,
      views: 215,
    },
    {
      title: 'Self-service password reset and Okta account recovery',
      category: 'ACCOUNT_ACCESS',
      content: `### Account Recovery Guide\n\n- Visit the internal identity portal at \`identity.corp.company.internal\` from a mobile device or verified backup session.\n- Click **Forgot Password** and follow SMS / Email OTP verification.\n- Password requirements: Minimum 12 characters, at least one uppercase letter, one number, and one symbol. Cannot reuse previous 5 passwords.`,
      isPublished: true,
      authorId: userMap['david.chen@helpdesk.local'].id,
      views: 310,
    },
  ];

  for (const art of articlesData) {
    const existing = await prisma.knowledgeArticle.findFirst({ where: { title: art.title } });
    if (!existing) {
      await prisma.knowledgeArticle.create({ data: art });
    }
  }
  console.log('Seeded Knowledge Base articles.');

  // 7. Seed Automation Rules
  const automationRules = [
    {
      name: 'Auto-assign tickets based on technician specialization',
      description: 'Automatically routes incoming tickets to available specialists matching category.',
      eventType: 'TICKET_CREATED',
      actionType: 'AUTO_ASSIGN',
      isEnabled: true,
    },
    {
      name: 'Escalate urgent tickets approaching SLA breach',
      description: 'Flags urgent tickets and alerts support leads if response delayed past 15 min.',
      eventType: 'SLA_WARNING',
      actionType: 'ESCALATE',
      isEnabled: true,
    },
    {
      name: 'Notify support queue on critical priority submissions',
      description: 'Dispatches real-time notification to all active technicians when Urgent ticket is filed.',
      eventType: 'TICKET_CREATED',
      actionType: 'NOTIFY_TEAM',
      isEnabled: true,
    },
  ];

  for (const rule of automationRules) {
    const existing = await prisma.automationRule.findFirst({ where: { name: rule.name } });
    if (!existing) {
      await prisma.automationRule.create({ data: rule });
    }
  }
  console.log('Seeded Automation Rules.');

  // 8. Seed Tickets & Timeline
  const existingTickets = await prisma.ticket.findMany({ select: { id: true, ticketNumber: true } });
  console.log(`Found ${existingTickets.length} existing tickets. Resetting ticket data for clean seed...`);

  await prisma.statusHistory.deleteMany({});
  await prisma.ticketEvent.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.ticketFeedback.deleteMany({});
  await prisma.ticket.deleteMany({});

  const now = new Date();
  const getPastDate = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000);

  const tickets = [
    {
      ticketNumber: 'HD-1042',
      title: 'Laptop does not boot after update',
      description: 'Following yesterday OS update, laptop displays blue screen with CRITICAL_PROCESS_DIED loop.',
      category: 'HARDWARE',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      reporterEmail: 'priya.nair@helpdesk.local',
      assignedTechEmail: 'arjun.mehta@helpdesk.local',
      departmentName: 'Human Resources',
      assetTag: 'LAP-0042',
      createdAt: getPastDate(2.5),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'arjun.mehta@helpdesk.local', at: getPastDate(2.1) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: getPastDate(2.5) },
        { type: 'ASSIGNED', actor: 'arjun.mehta@helpdesk.local', old: null, new: 'Arjun Mehta', at: getPastDate(2.2) },
        { type: 'STATUS_CHANGED', actor: 'arjun.mehta@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(2.1) },
      ],
      comments: [
        {
          author: 'arjun.mehta@helpdesk.local',
          content: 'Priya, please bring the laptop to IT support desk Level 2. We will attempt a restore point rollback.',
          isInternal: false,
          at: getPastDate(2.0),
        },
        {
          author: 'arjun.mehta@helpdesk.local',
          content: 'Internal Note: BitLocker recovery key located in Azure AD portal. Backing up user profile.',
          isInternal: true,
          at: getPastDate(1.8),
        },
        {
          author: 'priya.nair@helpdesk.local',
          content: 'Heading over now with the machine. Thanks Arjun.',
          isInternal: false,
          at: getPastDate(1.5),
        },
      ],
    },
    {
      ticketNumber: 'HD-1043',
      title: 'Wi-Fi drops in meeting room 3',
      description: 'Conference room 3 wireless connection continuously drops during Zoom calls.',
      category: 'NETWORK',
      priority: 'HIGH',
      status: 'OPEN',
      reporterEmail: 'kavya.raman@helpdesk.local',
      assignedTechEmail: null,
      departmentName: 'Finance',
      assetTag: null,
      createdAt: getPastDate(1.8),
      history: [],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: getPastDate(1.8) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1044',
      title: 'VPN licence expired',
      description: 'Cannot connect to Cisco AnyConnect VPN gateway. Client error: Subscription seat expired.',
      category: 'NETWORK',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      reporterEmail: 'priya.nair@helpdesk.local',
      assignedTechEmail: 'rahul.menon@helpdesk.local',
      departmentName: 'Human Resources',
      assetTag: null,
      createdAt: getPastDate(26),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'rahul.menon@helpdesk.local', at: getPastDate(25) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'rahul.menon@helpdesk.local', at: getPastDate(23) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: getPastDate(26) },
        { type: 'ASSIGNED', actor: 'rahul.menon@helpdesk.local', old: null, new: 'Rahul Menon', at: getPastDate(25.5) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(25) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: getPastDate(23) },
      ],
      comments: [
        {
          author: 'rahul.menon@helpdesk.local',
          content: 'Seat allocation renewed in Cisco Smart Licensing portal. Please re-authenticate.',
          isInternal: false,
          at: getPastDate(23.5),
        },
      ],
      feedback: {
        rating: 5,
        comment: 'Resolved quickly within the afternoon. Thank you Rahul!',
      },
    },
    {
      ticketNumber: 'HD-1045',
      title: 'Account locked after password reset',
      description: 'Locked out of Workday and Outlook following 90-day password change.',
      category: 'ACCOUNT_ACCESS',
      priority: 'LOW',
      status: 'CLOSED',
      reporterEmail: 'kavya.raman@helpdesk.local',
      assignedTechEmail: 'neha.sharma@helpdesk.local',
      departmentName: 'Finance',
      assetTag: null,
      createdAt: getPastDate(50),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'neha.sharma@helpdesk.local', at: getPastDate(48) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'neha.sharma@helpdesk.local', at: getPastDate(46) },
        { from: 'RESOLVED', to: 'CLOSED', by: 'neha.sharma@helpdesk.local', at: getPastDate(24) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: getPastDate(50) },
        { type: 'ASSIGNED', actor: 'neha.sharma@helpdesk.local', old: null, new: 'Neha Sharma', at: getPastDate(49) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(48) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: getPastDate(46) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'RESOLVED', new: 'CLOSED', at: getPastDate(24) },
      ],
      comments: [
        {
          author: 'neha.sharma@helpdesk.local',
          content: 'Active Directory lockout cleared and Kerberos token refreshed.',
          isInternal: false,
          at: getPastDate(46.5),
        },
      ],
    },
    {
      ticketNumber: 'HD-1046',
      title: 'Monitor flickers intermittently',
      description: 'External Dell 27-inch display flashes black every 5 to 10 minutes when connected via HDMI.',
      category: 'HARDWARE',
      priority: 'LOW',
      status: 'OPEN',
      reporterEmail: 'rohan.verma@helpdesk.local',
      assignedTechEmail: null,
      departmentName: 'Sales',
      assetTag: 'MON-0105',
      createdAt: getPastDate(5),
      history: [],
      events: [
        { type: 'CREATED', actor: 'rohan.verma@helpdesk.local', at: getPastDate(5) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1047',
      title: 'Unable to access shared network drive',
      description: 'Network mapping for Z: Finance Share returns System Error 67 (Network name cannot be found).',
      category: 'NETWORK',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      reporterEmail: 'kavya.raman@helpdesk.local',
      assignedTechEmail: 'rahul.menon@helpdesk.local',
      departmentName: 'Finance',
      assetTag: null,
      createdAt: getPastDate(6),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'rahul.menon@helpdesk.local', at: getPastDate(5.2) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: getPastDate(6) },
        { type: 'ASSIGNED', actor: 'rahul.menon@helpdesk.local', old: null, new: 'Rahul Menon', at: getPastDate(5.5) },
        { type: 'STATUS_CHANGED', actor: 'rahul.menon@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(5.2) },
      ],
      comments: [
        {
          author: 'rahul.menon@helpdesk.local',
          content: 'Investigating Samba permission ACLs on storage cluster node 2.',
          isInternal: false,
          at: getPastDate(5),
        },
      ],
    },
    {
      ticketNumber: 'HD-1048',
      title: 'Printer unavailable on office network',
      description: 'Floor 3 HP LaserJet does not accept print jobs from Mac workstations.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      reporterEmail: 'priya.nair@helpdesk.local',
      assignedTechEmail: 'arjun.mehta@helpdesk.local',
      departmentName: 'Human Resources',
      assetTag: 'PRN-0012',
      createdAt: getPastDate(15),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'arjun.mehta@helpdesk.local', at: getPastDate(14) },
        { from: 'IN_PROGRESS', to: 'RESOLVED', by: 'arjun.mehta@helpdesk.local', at: getPastDate(11) },
      ],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: getPastDate(15) },
        { type: 'ASSIGNED', actor: 'arjun.mehta@helpdesk.local', old: null, new: 'Arjun Mehta', at: getPastDate(14.5) },
        { type: 'STATUS_CHANGED', actor: 'arjun.mehta@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(14) },
        { type: 'STATUS_CHANGED', actor: 'arjun.mehta@helpdesk.local', old: 'IN_PROGRESS', new: 'RESOLVED', at: getPastDate(11) },
      ],
      comments: [
        {
          author: 'arjun.mehta@helpdesk.local',
          content: 'AirPrint daemon restarted and CUPS spooler cleared on print server.',
          isInternal: false,
          at: getPastDate(11),
        },
      ],
    },
    {
      ticketNumber: 'HD-1049',
      title: 'Microsoft Teams microphone not detected',
      description: 'Built-in microphone not recognized by Teams desktop client after privacy settings update.',
      category: 'SOFTWARE',
      priority: 'MEDIUM',
      status: 'OPEN',
      reporterEmail: 'rohan.verma@helpdesk.local',
      assignedTechEmail: null,
      departmentName: 'Sales',
      assetTag: null,
      createdAt: getPastDate(1.2),
      history: [],
      events: [
        { type: 'CREATED', actor: 'rohan.verma@helpdesk.local', at: getPastDate(1.2) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1050',
      title: 'Production database read replica latency spike',
      description: 'Reporting queries experiencing high replication lag on Postgres secondary node.',
      category: 'SOFTWARE',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      reporterEmail: 'kavya.raman@helpdesk.local',
      assignedTechEmail: 'neha.sharma@helpdesk.local',
      departmentName: 'Finance',
      assetTag: null,
      createdAt: getPastDate(1.0),
      history: [
        { from: 'OPEN', to: 'IN_PROGRESS', by: 'neha.sharma@helpdesk.local', at: getPastDate(0.8) },
      ],
      events: [
        { type: 'CREATED', actor: 'kavya.raman@helpdesk.local', at: getPastDate(1.0) },
        { type: 'ASSIGNED', actor: 'neha.sharma@helpdesk.local', old: null, new: 'Neha Sharma', at: getPastDate(0.9) },
        { type: 'STATUS_CHANGED', actor: 'neha.sharma@helpdesk.local', old: 'OPEN', new: 'IN_PROGRESS', at: getPastDate(0.8) },
      ],
      comments: [
        {
          author: 'neha.sharma@helpdesk.local',
          content: 'WAL receiver process re-anchored. Catching up with primary instance now.',
          isInternal: false,
          at: getPastDate(0.5),
        },
      ],
    },
    {
      ticketNumber: 'HD-1051',
      title: 'New hire GitHub Enterprise seat request',
      description: 'Provision repository access and assign Copilot license for incoming backend engineer.',
      category: 'ACCOUNT_ACCESS',
      priority: 'LOW',
      status: 'OPEN',
      reporterEmail: 'priya.nair@helpdesk.local',
      assignedTechEmail: null,
      departmentName: 'Human Resources',
      assetTag: null,
      createdAt: getPastDate(3.5),
      history: [],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: getPastDate(3.5) },
      ],
      comments: [],
    },
    {
      ticketNumber: 'HD-1052',
      title: 'Docking station USB ports unresponsive',
      description: 'CalDigit TS4 dock charges laptop, but connected keyboard and webcam do not respond.',
      category: 'HARDWARE',
      priority: 'MEDIUM',
      status: 'OPEN',
      reporterEmail: 'priya.nair@helpdesk.local',
      assignedTechEmail: null,
      departmentName: 'Human Resources',
      assetTag: 'LAP-0042',
      createdAt: getPastDate(0.7),
      history: [],
      events: [
        { type: 'CREATED', actor: 'priya.nair@helpdesk.local', at: getPastDate(0.7) },
      ],
      comments: [],
    },
  ];

  for (const item of tickets) {
    const reporter = userMap[item.reporterEmail];
    const tech = item.assignedTechEmail ? userMap[item.assignedTechEmail] : null;
    const department = item.departmentName && deptMap[item.departmentName] ? deptMap[item.departmentName] : null;
    const asset = item.assetTag && assetMap[item.assetTag] ? assetMap[item.assetTag] : null;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: item.ticketNumber,
        title: item.title,
        description: item.description,
        category: item.category,
        priority: item.priority,
        status: item.status,
        reporterId: reporter.id,
        assignedTechnicianId: tech ? tech.id : null,
        departmentId: department ? department.id : null,
        assetId: asset ? asset.id : null,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      },
    });

    // Create status histories
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
          oldValue: (ev as any).old || null,
          newValue: (ev as any).new || null,
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
          isInternal: c.isInternal ?? false,
          createdAt: c.at,
          updatedAt: c.at,
        },
      });
    }

    // Create feedback if present
    if ((item as any).feedback) {
      await prisma.ticketFeedback.create({
        data: {
          ticketId: ticket.id,
          employeeId: reporter.id,
          rating: (item as any).feedback.rating,
          comment: (item as any).feedback.comment,
        },
      });
    }

    console.log(`Ticket seeded: ${ticket.ticketNumber} - ${ticket.title} (${ticket.status})`);
  }

  // 9. Seed Initial Notifications
  const notificationsData = [
    {
      userId: userMap['admin@helpdesk.local'].id,
      title: 'High priority issue submitted',
      message: 'Ticket HD-1043 (Wi-Fi drops in meeting room 3) submitted without assigned technician.',
      type: 'TICKET_CREATED',
      link: '/technician/tickets/HD-1043',
    },
    {
      userId: userMap['arjun.mehta@helpdesk.local'].id,
      title: 'Ticket assigned to you',
      message: 'You have been assigned to HD-1042: Laptop does not boot after update.',
      type: 'TICKET_ASSIGNED',
      link: '/technician/tickets/HD-1042',
    },
    {
      userId: userMap['priya.nair@helpdesk.local'].id,
      title: 'Technician replied to your request',
      message: 'Arjun Mehta posted a response on HD-1042.',
      type: 'NEW_COMMENT',
      link: '/employee/tickets/HD-1042',
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // 10. Seed Initial Audit Logs
  const auditLogsData = [
    {
      actorId: userMap['admin@helpdesk.local'].id,
      action: 'SYSTEM_INITIALIZED',
      targetType: 'SETTINGS',
      targetId: 'INIT',
      metadataJson: JSON.stringify({ version: '2.0.0', mode: 'ENTERPRISE_MULTI_USER' }),
    },
    {
      actorId: userMap['admin@helpdesk.local'].id,
      action: 'SLA_POLICIES_CONFIGURED',
      targetType: 'SLA',
      targetId: 'ALL',
      metadataJson: JSON.stringify({ policiesCount: 4 }),
    },
    {
      actorId: userMap['admin@helpdesk.local'].id,
      action: 'DEPARTMENTS_CREATED',
      targetType: 'DEPARTMENT',
      targetId: 'ALL',
      metadataJson: JSON.stringify({ count: 7 }),
    },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({ data: log });
  }

  console.log('Enterprise Seeding completed successfully!');
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
