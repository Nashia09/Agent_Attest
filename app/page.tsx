'use client'

import Link from 'next/link'
import { ArrowRight, Shield, FileCheck, Search, UserCheck, Ban } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-accent-900 mb-4">
            AgentAttest
          </h1>
          <p className="text-xl text-accent-600 max-w-3xl mx-auto leading-relaxed">
            <span className="bg-primary-50 px-2 py-1 rounded font-medium">Secure credential lifecycle management</span> 
            {' '}for autonomous agents with verifiable attestations, real-time revocation, and transaction-level access control.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/demo" className="btn-primary px-8 py-3 text-lg">
            <Shield className="w-5 h-5 mr-2" />
            Start Demo
          </Link>
          <Link href="/apply" className="btn-secondary px-8 py-3 text-lg">
            <FileCheck className="w-5 h-5 mr-2" />
            Apply Now
          </Link>
        </div>
      </section>

      {/* 30-Second Pitch */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-accent-900 mb-8">
            The Problem & Solution
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-accent-900 mb-4">The Challenge</h3>
              <p className="text-accent-700 leading-relaxed">
                Autonomous agents need verifiable credentials to prove their permissions and capabilities, 
                but traditional systems lack real-time revocation, audit trails, and transaction-level controls.
              </p>
            </div>
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-accent-900 mb-4">Our Solution</h3>
              <p className="text-accent-700 leading-relaxed">
                AgentAttest provides a complete credential lifecycle with cryptographic proofs, 
                risk scoring, and instant revocation that blocks unauthorized transactions in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Demo */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-accent-900 mb-12">
          Credential Lifecycle Demo
        </h2>
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { icon: FileCheck, title: 'Apply', desc: 'Submit DID & artifacts', color: 'primary' },
            { icon: Search, title: 'Audit', desc: 'Risk assessment & review', color: 'warning' },
            { icon: Shield, title: 'Issue', desc: 'Generate credential', color: 'success' },
            { icon: UserCheck, title: 'Verify', desc: 'Check validity', color: 'accent' },
            { icon: Ban, title: 'Revoke', desc: 'Instant blocking', color: 'error' },
          ].map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-${step.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${step.color}-600`} />
                </div>
                <h3 className="font-semibold text-accent-900 mb-2">{step.title}</h3>
                <p className="text-sm text-accent-600">{step.desc}</p>
                {index < 4 && (
                  <ArrowRight className="w-5 h-5 text-accent-300 absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-accent-900 mb-8">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/apply" className="card p-6 hover:shadow-md transition-shadow group">
              <FileCheck className="w-8 h-8 text-primary-600 mb-3 group-hover:text-primary-700" />
              <h3 className="font-semibold text-accent-900 mb-2">Submit Application</h3>
              <p className="text-sm text-accent-600">Apply for agent credentials with artifact verification</p>
            </Link>
            <Link href="/verify" className="card p-6 hover:shadow-md transition-shadow group">
              <Search className="w-8 h-8 text-success-600 mb-3 group-hover:text-success-700" />
              <h3 className="font-semibold text-accent-900 mb-2">Verify Credential</h3>
              <p className="text-sm text-accent-600">Check agent permissions and transaction limits</p>
            </Link>
            <Link href="/dashboard" className="card p-6 hover:shadow-md transition-shadow group">
              <Shield className="w-8 h-8 text-warning-600 mb-3 group-hover:text-warning-700" />
              <h3 className="font-semibold text-accent-900 mb-2">Admin Dashboard</h3>
              <p className="text-sm text-accent-600">Review applications and manage credentials</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-12 text-center">
        <div className="card p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-accent-900 mb-4">
            Ready for the Demo?
          </h2>
          <p className="text-accent-600 mb-6">
            Experience the complete credential lifecycle in under 2 minutes
          </p>
          <Link href="/demo" className="btn-primary px-8 py-3 text-lg inline-flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Launch Demo
          </Link>
        </div>
      </section>
    </div>
  )
}