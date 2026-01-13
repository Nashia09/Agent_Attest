import './globals.css'
import Header from '@/components/Header'
import ToastProvider from '@/components/ToastProvider'
import ParticlesBackground from '@/components/ParticlesBackground'

export const metadata = {
  title: 'AgentAttest - Credential Lifecycle Demo',
  description: 'Demo UI for AgentAttest credential lifecycle: Apply → Audit → Issue → Verify → Revoke',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-gray-100 antialiased overflow-x-hidden">
        <ToastProvider>
          <ParticlesBackground />
          <Header />
          <main className="container mx-auto px-4 py-8 relative z-10">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}