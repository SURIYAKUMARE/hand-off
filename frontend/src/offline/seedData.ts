// Pre-seeded fallback data ensuring zero empty-state glitches across Admin views
import { TicketSummary, UserSummary, AssetItem, TechnicianWorkloadItem, AuditLogItem } from '@helpdesk360/shared';

export const SEED_TICKETS: Array<TicketSummary & { isPendingSync?: boolean }> = [
  {
    "id": "cmwol4loj004trtqkk9pur0hu",
    "ticketNumber": "HD-1053",
    "title": "Persistent Server Test Ticket",
    "description": "Testing that database records survive application restart and reconnect.",
    "category": "SOFTWARE",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": null,
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": null,
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4lkd004crtqkrtf2zgsy",
    "ticketNumber": "HD-1052",
    "title": "Docking station USB ports unresponsive",
    "description": "CalDigit TS4 dock charges laptop, but connected keyboard and webcam do not respond.",
    "category": "HARDWARE",
    "priority": "MEDIUM",
    "status": "OPEN",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4lhj003wrtqk9fwmqde0",
    "ticketNumber": "HD-1050",
    "title": "Production database read replica latency spike",
    "description": "Reporting queries experiencing high replication lag on Postgres secondary node.",
    "category": "SOFTWARE",
    "priority": "URGENT",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn100004lximwd7638uw",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn100004lximwd7638uw",
      "name": "Neha Sharma",
      "email": "neha.sharma@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4lgy003srtqk7151gd02",
    "ticketNumber": "HD-1049",
    "title": "Microsoft Teams microphone not detected",
    "description": "Built-in microphone not recognized by Teams desktop client after privacy settings update.",
    "category": "SOFTWARE",
    "priority": "MEDIUM",
    "status": "OPEN",
    "reporterId": "cmv9lzg27000gqcbep6elqvrm",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9lzg27000gqcbep6elqvrm",
      "name": "Rohan Verma",
      "email": "rohan.verma@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4l68001qrtqkbigkfv5v",
    "ticketNumber": "HD-1043",
    "title": "Wi-Fi drops in meeting room 3",
    "description": "Conference room 3 wireless connection continuously drops during Zoom calls.",
    "category": "NETWORK",
    "priority": "HIGH",
    "status": "OPEN",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4l3g001artqk0gjekqtn",
    "ticketNumber": "HD-1042",
    "title": "Laptop does not boot after update",
    "description": "Following yesterday OS update, laptop displays blue screen with CRITICAL_PROCESS_DIED loop.",
    "category": "HARDWARE",
    "priority": "URGENT",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4ljb0048rtqkravaks95",
    "ticketNumber": "HD-1051",
    "title": "New hire GitHub Enterprise seat request",
    "description": "Provision repository access and assign Copilot license for incoming backend engineer.",
    "category": "ACCOUNT_ACCESS",
    "priority": "LOW",
    "status": "OPEN",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4lcp002wrtqkyljtf9mm",
    "ticketNumber": "HD-1046",
    "title": "Monitor flickers intermittently",
    "description": "External Dell 27-inch display flashes black every 5 to 10 minutes when connected via HDMI.",
    "category": "HARDWARE",
    "priority": "LOW",
    "status": "OPEN",
    "reporterId": "cmv9lzg27000gqcbep6elqvrm",
    "assignedTechnicianId": null,
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9lzg27000gqcbep6elqvrm",
      "name": "Rohan Verma",
      "email": "rohan.verma@helpdesk.local"
    },
    "assignedTechnician": null,
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4ldd0030rtqkugrsr5s0",
    "ticketNumber": "HD-1047",
    "title": "Unable to access shared network drive",
    "description": "Network mapping for Z: Finance Share returns System Error 67 (Network name cannot be found).",
    "category": "NETWORK",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn0s0003lximsu42wpxf",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0s0003lximsu42wpxf",
      "name": "Rahul Menon",
      "email": "rahul.menon@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4lf4003crtqkz9clac25",
    "ticketNumber": "HD-1048",
    "title": "Printer unavailable on office network",
    "description": "Floor 3 HP LaserJet does not accept print jobs from Mac workstations.",
    "category": "HARDWARE",
    "priority": "MEDIUM",
    "status": "RESOLVED",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0l0002lxim967jnlkr",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0l0002lxim967jnlkr",
      "name": "Arjun Mehta",
      "email": "arjun.mehta@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4l6s001urtqkn3yh1iuw",
    "ticketNumber": "HD-1044",
    "title": "VPN licence expired",
    "description": "Cannot connect to Cisco AnyConnect VPN gateway. Client error: Subscription seat expired.",
    "category": "NETWORK",
    "priority": "MEDIUM",
    "status": "RESOLVED",
    "reporterId": "cmv9jxmzz0000lxim3ex2itdb",
    "assignedTechnicianId": "cmv9jxn0s0003lximsu42wpxf",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn0s0003lximsu42wpxf",
      "name": "Rahul Menon",
      "email": "rahul.menon@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  },
  {
    "id": "cmwol4l95002crtqkw2uma0zd",
    "ticketNumber": "HD-1045",
    "title": "Account locked after password reset",
    "description": "Locked out of Workday and Outlook following 90-day password change.",
    "category": "ACCOUNT_ACCESS",
    "priority": "LOW",
    "status": "CLOSED",
    "reporterId": "cmv9jxn0e0001lximndwbz221",
    "assignedTechnicianId": "cmv9jxn100004lximwd7638uw",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "slaDeadline": "2026-11-21T00:00:00.000Z",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z",
    "reporter": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "assignedTechnician": {
      "id": "cmv9jxn100004lximwd7638uw",
      "name": "Neha Sharma",
      "email": "neha.sharma@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "_count": {
      "comments": 1,
      "attachments": 0
    }
  }
] as unknown as Array<TicketSummary & { isPendingSync?: boolean }>;

export const SEED_USERS: UserSummary[] = [
  {
    "id": "cmv9jxmzz0000lxim3ex2itdb",
    "name": "Priya Nair",
    "email": "priya.nair@helpdesk.local",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employeeId": "EMP-1001",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9jxn0e0001lximndwbz221",
    "name": "Kavya Raman",
    "email": "kavya.raman@helpdesk.local",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employeeId": "EMP-1002",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9jxn0l0002lxim967jnlkr",
    "name": "Arjun Mehta",
    "email": "arjun.mehta@helpdesk.local",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "employeeId": "TECH-2001",
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9jxn0s0003lximsu42wpxf",
    "name": "Rahul Menon",
    "email": "rahul.menon@helpdesk.local",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "employeeId": "TECH-2002",
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9jxn100004lximwd7638uw",
    "name": "Neha Sharma",
    "email": "neha.sharma@helpdesk.local",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "employeeId": "TECH-2003",
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg120008qcbedh1en731",
    "name": "Vikram Aditya",
    "email": "admin@helpdesk.local",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employeeId": "ADM-0001",
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg1f000aqcbe1xmtbg7v",
    "name": "Meera Patel",
    "email": "meera.patel@helpdesk.local",
    "role": "ADMIN",
    "status": "ACTIVE",
    "employeeId": "ADM-0002",
    "departmentId": "cmv9lzg0o0006qcbewovx9o0x",
    "department": {
      "id": "cmv9lzg0o0006qcbewovx9o0x",
      "name": "Administration"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg27000gqcbep6elqvrm",
    "name": "Rohan Verma",
    "email": "rohan.verma@helpdesk.local",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "employeeId": "EMP-1003",
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg3b000oqcbe3jr861v9",
    "name": "David Chen",
    "email": "david.chen@helpdesk.local",
    "role": "TECHNICIAN",
    "status": "ACTIVE",
    "employeeId": "TECH-2004",
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  }
] as unknown as UserSummary[];

export const SEED_TECHNICIANS: TechnicianWorkloadItem[] = [
  {
    "technicianId": "cmv9jxn0l0002lxim967jnlkr",
    "name": "Arjun Mehta",
    "email": "arjun.mehta@helpdesk.local",
    "specialization": "HARDWARE",
    "status": "AVAILABLE",
    "assigned": 3,
    "inProgress": 1,
    "resolved": 2,
    "overdue": 0
  },
  {
    "technicianId": "cmv9jxn0s0003lximsu42wpxf",
    "name": "Rahul Menon",
    "email": "rahul.menon@helpdesk.local",
    "specialization": "NETWORK",
    "status": "BUSY",
    "assigned": 2,
    "inProgress": 1,
    "resolved": 2,
    "overdue": 0
  },
  {
    "technicianId": "cmv9jxn100004lximwd7638uw",
    "name": "Neha Sharma",
    "email": "neha.sharma@helpdesk.local",
    "specialization": "SOFTWARE",
    "status": "AVAILABLE",
    "assigned": 1,
    "inProgress": 1,
    "resolved": 2,
    "overdue": 0
  },
  {
    "technicianId": "cmv9lzg3b000oqcbe3jr861v9",
    "name": "David Chen",
    "email": "david.chen@helpdesk.local",
    "specialization": "ACCOUNT_ACCESS",
    "status": "AVAILABLE",
    "assigned": 0,
    "inProgress": 1,
    "resolved": 2,
    "overdue": 0
  }
] as unknown as TechnicianWorkloadItem[];

export const SEED_ASSETS: AssetItem[] = [
  {
    "id": "cmv9lzg4z0012qcbe750454jn",
    "assetTag": "LAP-0042",
    "name": "MacBook Pro 16\" M3 Max",
    "type": "LAPTOP",
    "serialNumber": "C02G1829MD6R",
    "status": "ACTIVE",
    "assignedUserId": "cmv9jxmzz0000lxim3ex2itdb",
    "departmentId": "cmv9lzfzi0001qcbetknpva8l",
    "assignedUser": {
      "id": "cmv9jxmzz0000lxim3ex2itdb",
      "name": "Priya Nair",
      "email": "priya.nair@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzi0001qcbetknpva8l",
      "name": "Human Resources"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg580014qcbewlhuroe7",
    "assetTag": "LAP-0045",
    "name": "Dell Precision 5570",
    "type": "LAPTOP",
    "serialNumber": "8FK29A01",
    "status": "ACTIVE",
    "assignedUserId": "cmv9jxn0e0001lximndwbz221",
    "departmentId": "cmv9lzfzp0002qcbefsqqtwsy",
    "assignedUser": {
      "id": "cmv9jxn0e0001lximndwbz221",
      "name": "Kavya Raman",
      "email": "kavya.raman@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzfzp0002qcbefsqqtwsy",
      "name": "Finance"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg5g0016qcbeldli1m34",
    "assetTag": "MON-0105",
    "name": "Dell UltraSharp 27\" 4K Monitor",
    "type": "MONITOR",
    "serialNumber": "CN-0M912K",
    "status": "ACTIVE",
    "assignedUserId": "cmv9lzg27000gqcbep6elqvrm",
    "departmentId": "cmv9lzg070004qcbexfll0i7j",
    "assignedUser": {
      "id": "cmv9lzg27000gqcbep6elqvrm",
      "name": "Rohan Verma",
      "email": "rohan.verma@helpdesk.local"
    },
    "department": {
      "id": "cmv9lzg070004qcbexfll0i7j",
      "name": "Sales"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  },
  {
    "id": "cmv9lzg5m0018qcbewikzic8g",
    "assetTag": "PRN-0012",
    "name": "HP LaserJet Enterprise M608",
    "type": "PRINTER",
    "serialNumber": "VNC3K92110",
    "status": "ACTIVE",
    "assignedUserId": null,
    "departmentId": "cmv9lzfyh0000qcbeitp15jsv",
    "assignedUser": null,
    "department": {
      "id": "cmv9lzfyh0000qcbeitp15jsv",
      "name": "Information Technology"
    },
    "createdAt": "2026-11-20T00:00:00.000Z",
    "updatedAt": "2026-11-20T00:00:00.000Z"
  }
] as unknown as AssetItem[];

export const SEED_AUDIT_LOGS: AuditLogItem[] = [
  {
    "id": "cmwol4lmy004qrtqkuxnsz8i1",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4lmr004ortqkzo2qwy6o",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4lmh004mrtqk2fxjai7v",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4iph004q909geiojhjzp",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4ip5004o909gdahqdj6b",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4iou004m909g8vbhui9x",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4fyq004q6f9til4opb47",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4fyi004o6f9tkepdvyen",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4fyc004m6f9t71vxmdzt",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4d9g004q149ti97kzk92",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4d95004o149tn5o39nif",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4d8t004m149tgwkl5zuf",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4aev004qwgesp97klwh7",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4aei004owgesq80z8l19",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4ae5004mwgesw992ejuf",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol4798004ql40pljtnl1ef",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol478z004ol40pxjtfggz9",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwol478l004ml40p90hn3irh",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi390g004qt04m3j8amkx0",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi3905004ot04mo3yz4jn6",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi38zv004mt04me9ug1xdu",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi35st004q2psw7n4wr62a",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi35sh004o2pswy5jqw452",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi35s4004m2psw9rxl4q34",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi31pb004qv4ng3p7o9c2u",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi31ox004ov4ngnv7jhiwk",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi31oe004mv4ngjkx3a2p6",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2udi004qez2chiorvmtf",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2ud9004oez2c4umaw9mo",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2ucu004mez2co15iy1kj",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2qa7004qxvyl8y5d0rye",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2q9h004oxvyltta50xia",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2q8y004mxvyldwxfhig4",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2lrq004qgit59470vvfb",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2lr6004ogit5orw07dip",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwoi2lqq004mgit5nm2c296a",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmyu8004qj9vvasv866t1",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmyu2004oj9vv3iju275u",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmytv004mj9vvjiehzb7m",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmwfn004qgplhcqxds85o",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmwfe004ogplhj9gljiex",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmwf7004mgplhjsbwmsps",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmu5s004qkr2ho3mqh4y4",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmu5i004okr2hv07t6r2r",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmu56004mkr2hq7nixd35",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmri2004q47a2q79f6dnt",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmrht004o47a2xfefo2ng",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmrhj004m47a2us3cyb4v",
    "action": "SYSTEM_INITIALIZED",
    "targetType": "SETTINGS",
    "entityType": "SETTINGS",
    "entityId": "INIT",
    "metadataJson": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "details": "{\"version\":\"2.0.0\",\"mode\":\"ENTERPRISE_MULTI_USER\"}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmoov004qm6vno1jkbvdv",
    "action": "DEPARTMENTS_CREATED",
    "targetType": "DEPARTMENT",
    "entityType": "DEPARTMENT",
    "entityId": "ALL",
    "metadataJson": "{\"count\":7}",
    "details": "{\"count\":7}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  },
  {
    "id": "cmwodmool004om6vn5pzbdth8",
    "action": "SLA_POLICIES_CONFIGURED",
    "targetType": "SLA",
    "entityType": "SLA",
    "entityId": "ALL",
    "metadataJson": "{\"policiesCount\":4}",
    "details": "{\"policiesCount\":4}",
    "createdAt": "2026-11-20T00:00:00.000Z",
    "user": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "actor": {
      "id": "cmv9lzg120008qcbedh1en731",
      "name": "Vikram Aditya",
      "email": "admin@helpdesk.local",
      "role": "ADMIN"
    },
    "ipAddress": "127.0.0.1"
  }
] as unknown as AuditLogItem[];
