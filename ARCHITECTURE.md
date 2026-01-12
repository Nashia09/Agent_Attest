# AgentAttest Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │  Apply   │  │  Verify  │  │ Dashboard│     │
│  │   Page   │  │   Form   │  │   Panel  │  │  Admin   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Status  │  │   Demo   │  │  Shared  │                   │
│  │  Tracker │  │   Flow   │  │Components│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Apply   │  │  Status  │  │  Verify  │  │ Simulate │     │
│  │   API    │  │   API    │  │   API    │  │Transact. │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐                                │
│  │  Admin   │  │  Revoke  │                                │
│  │   API    │  │   API    │                                │
│  └──────────┘  └──────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Storage (Mock)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   App    │  │Credential│  │   Audit  │  │  Event   │     │
│  │Storage   │  │Registry  │  │  Reports │  │   Log    │     │
│  │(Local)   │  │(Local)   │  │(Local)   │  │(Local)   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Application Flow
```
User → Apply Form → API → Risk Assessment → Status Tracking
```

### 2. Verification Flow
```
Verifier → Query API → Credential Check → Transaction Simulation
```

### 3. Admin Flow
```
Admin → Dashboard → Action API → Status Update → Event Log
```

### 4. Revocation Flow
```
Admin → Revoke API → Registry Update → Block Transactions → Event Log
```

## Key Components

### Frontend
- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **High contrast** accessibility compliant
- **Responsive design** for all devices

### Backend (Mock)
- **API Routes** for all operations
- **Risk scoring** algorithm
- **Local storage** persistence
- **Event logging** for audit trail

### Security Features
- **SHA256 hashing** for file verification
- **DID validation** for agent identity
- **Permission-based** access control
- **Real-time revocation** blocking

## Demo Features

### Quick Demo (< 2 minutes)
1. Submit application with file upload
2. View risk assessment
3. Admin approves and issues credential
4. Verify credential validity
5. Simulate transaction authorization
6. Revoke credential
7. Confirm blocking works

### Interactive Elements
- **Role selector** (Agent/Verifier/Admin)
- **File upload** with hash calculation
- **Permission selection** with risk preview
- **Transaction simulation** with amount input
- **Real-time status** updates

## Deployment Ready

- **Vercel** optimized
- **Static generation** for speed
- **Edge runtime** support
- **Environment variables** ready
- **Production build** configured