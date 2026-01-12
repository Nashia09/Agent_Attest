import './globals.css'
import Header from '@/components/Header'
import ToastProvider from '@/components/ToastProvider'

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
      <body className="min-h-screen bg-white">
        <ToastProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
}