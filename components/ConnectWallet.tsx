'use client'

import { useState } from 'react'
import { Wallet, ExternalLink, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useWallet } from '@/lib/WalletContext'
import { useToast } from '@/components/ToastProvider'

export default function ConnectWallet() {
    const {
        isConnected,
        address,
        balance,
        isExtensionInstalled,
        isLoading,
        connectWallet,
        disconnectWallet
    } = useWallet()
    const { toast } = useToast()
    const [showExtensionPrompt, setShowExtensionPrompt] = useState(false)

    const handleConnect = async () => {
        if (!isExtensionInstalled) {
            setShowExtensionPrompt(true)
            return
        }

        try {
            await connectWallet()
            toast('success', 'Wallet Connected', 'Your Amadeus wallet is now connected')
        } catch (error: any) {
            toast('error', 'Connection Failed', error.message || 'Failed to connect wallet')
        }
    }

    const handleDisconnect = () => {
        disconnectWallet()
        toast('info', 'Wallet Disconnected', 'Your wallet has been disconnected')
    }

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-3">
                {/* Balance Display */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface-100/30 border border-white/10 rounded-lg backdrop-blur-sm">
                    <Wallet className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-mono text-white">
                        {balance !== null ? `${balance.toFixed(2)} AMA` : '...'}
                    </span>
                </div>

                {/* Connected Address */}
                <div className="flex items-center gap-2 px-4 py-2 bg-success-500/10 border border-success-500/30 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 text-success-400" />
                    <span className="text-sm font-mono text-success-200">
                        {truncateAddress(address)}
                    </span>
                </div>

                {/* Disconnect Button */}
                <button
                    onClick={handleDisconnect}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    title="Disconnect Wallet"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <>
            <button
                onClick={handleConnect}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider relative overflow-hidden bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] px-6 py-2"
            >
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Connecting...
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                    </>
                )}
            </button>

            {/* Extension Not Installed Modal */}
            {showExtensionPrompt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-900 border border-primary-500/30 rounded-2xl max-w-md w-full p-8 relative shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowExtensionPrompt(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className="w-16 h-16 bg-warning-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-warning-500/30">
                            <AlertCircle className="w-8 h-8 text-warning-400" />
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl font-bold text-white mb-3 text-center">
                            Extension Required
                        </h2>
                        <p className="text-accent-400 text-center mb-6">
                            To connect your wallet, you need to install the Amadeus browser extension first.
                        </p>

                        {/* Actions */}
                        <div className="space-y-3">
                            <a
                                href="https://chrome.google.com/webstore"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 uppercase tracking-wider bg-primary-600 text-white hover:bg-primary-500 shadow-[0_0_15px_rgba(139,92,246,0.5)] w-full py-3"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Install Amadeus Extension
                            </a>
                            <button
                                onClick={() => setShowExtensionPrompt(false)}
                                className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 bg-surface-100 text-white hover:bg-surface-200 border border-white/10 hover:border-primary-400/50 w-full py-3"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500 text-center mt-6">
                            After installing, refresh this page and try connecting again.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
