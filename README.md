# AgentAttest Demo UI

A clean, minimal, high-contrast demo UI for AgentAttest credential lifecycle management.

## Features

- **Complete Credential Lifecycle**: Apply → Audit → Issue → Verify → Revoke
- **Judge-Friendly Design**: High contrast, legible, fast, demoable in <2 minutes
- **Real-time Revocation**: Instant blocking of unauthorized transactions
- **Risk Assessment**: Automated scoring based on requested permissions
- **Transaction Simulation**: Test authorization with different amounts
- **Admin Dashboard**: Manage applications and monitor events

## Tech Stack

- **Next.js 14+** with TypeScript
- **React** with function components and hooks
- **Tailwind CSS** for styling (no theme overrides)
- **Lucide React** for icons
- **CryptoJS** for SHA256 hashing
- **Local Storage** for demo data persistence

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd agent-attest-demo
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
agent-attest-demo/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── apply/             # Application form
│   ├── dashboard/         # Admin dashboard
│   ├── demo/              # Scripted demo
│   ├── status/            # Application status
│   ├── verify/            # Credential verification
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── Header.tsx        # Navigation header
│   ├── LoadingStates.tsx # Skeleton loaders
│   └── ToastProvider.tsx # Toast notifications
├── lib/                  # Utilities
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── styles/              # Global styles
```

## Demo Flow

1. **Landing Page**: 30-second pitch and quick actions
2. **Apply**: Submit agent DID, artifact hash, and permissions
3. **Status**: Track application progress and risk assessment
4. **Verify**: Query credentials and simulate transactions
5. **Dashboard**: Admin panel for managing applications
6. **Demo**: Automated 2-minute complete lifecycle demo

## API Endpoints

### Application Management
- `POST /api/apply` - Submit new application
- `GET /api/status/[id]` - Get application status

### Verification
- `GET /api/verify` - Verify credential by ID or agent DID
- `POST /api/simulate-transaction` - Test transaction authorization

### Admin Actions
- `POST /api/admin/issue/[id]` - Issue credential
- `POST /api/admin/revoke/[id]` - Revoke credential

## Key Components

### ApplyForm
- File upload with SHA256 hashing
- Permission selection with risk preview
- Real-time validation

### VerifierPanel
- Credential lookup by ID or DID
- Transaction simulation
- Permission display

### AdminPanel
- Application management table
- Risk scoring visualization
- Event log monitoring

### DemoFlow
- Automated credential lifecycle
- Step-by-step visualization
- Result tracking

## Accessibility Features

- High contrast color scheme (4.5:1+ ratio)
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels and roles
- Focus indicators
- Screen reader friendly

## Demo Data

The application uses localStorage to persist demo data:
- Applications are stored with full lifecycle state
- Credentials include revocation status
- Event log tracks all actions
- All data is cleared on browser reset

## Customization

### Colors
Update `tailwind.config.js` to modify the color scheme while maintaining accessibility.

### Components
Components are modular and can be easily extended or replaced.

### API Integration
Replace mock API calls in `app/api/` with real backend integration.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository on Vercel
3. Deploy with default settings

### Netlify

1. Build: `npm run build`
2. Publish directory: `.next`
3. Add environment variables if needed

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development Tips

- Use the role selector in the header to switch between Agent/Verifier/Admin views
- Try the demo with different permission combinations to see risk scoring
- Test revocation by using credential IDs containing "revoked"
- All demo data is stored locally and persists across page refreshes

## License

MIT License - see LICENSE file for details.