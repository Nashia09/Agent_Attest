'use client'

import Link from 'next/link'
import { ArrowRight, Shield, FileCheck, Search, UserCheck, Ban } from 'lucide-react'
import { motion } from 'framer-motion'

export default function HomePage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-primary-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              AgentAttest
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed border-l-4 border-primary-500 pl-6 text-left py-2 bg-gradient-to-r from-primary-900/40 to-transparent backdrop-blur-sm rounded-r-xl">
            Secure credential lifecycle management for <span className="text-primary-400 font-semibold">autonomous agents</span> with verifiable attestations, real-time revocation, and transaction-level access control.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/demo" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] px-8 py-4 text-lg group relative overflow-hidden">
            <span className="relative z-10 flex items-center">
              <Shield className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              Start Demo
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link href="/apply" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 backdrop-blur-sm px-8 py-4 text-lg flex items-center group">
            <FileCheck className="w-5 h-5 mr-3 text-secondary-400 group-hover:text-white transition-colors" />
            Apply Now
          </Link>
        </motion.div>
      </section>

      {/* 30-Second Pitch */}
      <section className="py-12">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">The Problem & Solution</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-transparent mx-auto"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 border-l-4 border-l-error-500/50 hover:border-l-error-500 transition-colors">
              <h3 className="text-xl font-bold text-error-400 mb-4 flex items-center">
                <Ban className="w-5 h-5 mr-2" /> The Challenge
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Autonomous agents need verifiable credentials to prove their permissions,
                but traditional systems lack <span className="text-white font-semibold">real-time revocation</span>, audit trails, and transaction-level controls in a decentralized environment.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 border-l-4 border-l-success-500/50 hover:border-l-success-500 transition-colors">
              <h3 className="text-xl font-bold text-success-400 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" /> Our Solution
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                AgentAttest provides a complete lifecycle with <span className="text-white font-semibold">cryptographic proofs</span>,
                dynamic risk scoring, and instant revocation that blocks unauthorized transactions in real-time across the network.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Lifecycle Demo */}
      <section className="py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>

        <motion.h2
          className="text-3xl font-bold text-center text-white mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Credential Lifecycle Demo
        </motion.h2>

        <div className="grid md:grid-cols-5 gap-6 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary-900 via-primary-500/30 to-primary-900 hidden md:block -z-10"></div>

          {[
            { icon: FileCheck, title: 'Apply', desc: 'Submit DID & artifacts', color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/30' },
            { icon: Search, title: 'Audit', desc: 'Risk assessment & review', color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30' },
            { icon: Shield, title: 'Issue', desc: 'Generate credential', color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/30' },
            { icon: UserCheck, title: 'Verify', desc: 'Check validity', color: 'text-secondary-400', bg: 'bg-secondary-500/10', border: 'border-secondary-500/30' },
            { icon: Ban, title: 'Revoke', desc: 'Instant blocking', color: 'text-error-400', bg: 'bg-error-500/10', border: 'border-error-500/30' },
          ].map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                className={`rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-6 text-center backdrop-blur-md border ${step.border} hover:bg-surface-200/50 transition-all duration-300 group`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${step.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                  <Icon className={`w-8 h-8 ${step.color} drop-shadow-[0_0_5px_currentColor]`} />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <Link href="/apply" className="block transform transition-transform hover:-translate-y-2">
              <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 h-full bg-gradient-to-br from-surface-100 to-surface-50 border-white/5 hover:border-primary-500/40">
                <FileCheck className="w-10 h-10 text-primary-400 mb-6" />
                <h3 className="font-bold text-xl text-white mb-3">Submit Application</h3>
                <p className="text-gray-400">Apply for agent credentials with artifact verification</p>
              </motion.div>
            </Link>
            <Link href="/verify" className="block transform transition-transform hover:-translate-y-2">
              <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 h-full bg-gradient-to-br from-surface-100 to-surface-50 border-white/5 hover:border-success-500/40">
                <Search className="w-10 h-10 text-secondary-400 mb-6" />
                <h3 className="font-bold text-xl text-white mb-3">Verify Credential</h3>
                <p className="text-gray-400">Check agent permissions and transaction limits</p>
              </motion.div>
            </Link>
            <Link href="/dashboard" className="block transform transition-transform hover:-translate-y-2">
              <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-surface-900 shadow-xl transition-all hover:border-primary-500/30 relative overflow-hidden p-8 h-full bg-gradient-to-br from-surface-100 to-surface-50 border-white/5 hover:border-warning-500/40">
                <Shield className="w-10 h-10 text-warning-400 mb-6" />
                <h3 className="font-bold text-xl text-white mb-3">Admin Dashboard</h3>
                <p className="text-gray-400">Review applications and manage credentials</p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}