'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AmadeusSDK, TransactionBuilder } from '@amadeus-protocol/sdk'

interface WalletContextType {
    isConnected: boolean
    address: string | null
    balance: number | null
    isExtensionInstalled: boolean
    isLoading: boolean
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    signTransaction: (txData: any) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Extend Window interface to include amadeus extension
declare global {
    interface Window {
        amadeus?: {
            isAmadeus: boolean
            isConnected: () => Promise<boolean>
            getAccount: () => Promise<string | null>
            requestAccounts: () => Promise<string[]>
            signTransaction: (tx: any) => Promise<string>
            on: (event: string, callback: (data: any) => void) => void
            off: (event: string, callback: (data: any) => void) => void
        }
    }
}

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<number | null>(null)
    const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Check if extension is installed on mount
    useEffect(() => {
        const checkExtension = () => {
            // Check if Amadeus extension is available
            if (typeof window !== 'undefined' && window.amadeus) {
                console.log('Amadeus extension detected:', window.amadeus)
                console.log('Available methods:', Object.keys(window.amadeus))
                setIsExtensionInstalled(true)

                // Check if already connected (persisted session)
                const savedAddress = localStorage.getItem('amadeus_connected_address')
                if (savedAddress) {
                    setAddress(savedAddress)
                    setIsConnected(true)
                    fetchBalance(savedAddress)
                }
            }
        }

        // Check immediately
        checkExtension()

        // Also check after a short delay in case extension loads async
        const timer = setTimeout(checkExtension, 1000)

        return () => clearTimeout(timer)
    }, [])

    // Listen for account changes
    useEffect(() => {
        if (!window.amadeus?.on) return

        const handleAccountsChanged = (account: string | null) => {
            if (!account) {
                disconnectWallet()
            } else if (account !== address) {
                setAddress(account)
                localStorage.setItem('amadeus_connected_address', account)
                fetchBalance(account)
            }
        }

        window.amadeus.on('accountChanged', handleAccountsChanged)

        return () => {
            if (window.amadeus?.off) {
                window.amadeus.off('accountChanged', handleAccountsChanged)
            }
        }
    }, [address])

    const fetchBalance = async (addr: string) => {
        try {
            // Amadeus extension doesn't provide a balance method
            // You would need to query the Amadeus network directly via SDK
            // For now, we'll set balance to null
            setBalance(null)
        } catch (error) {
            console.error('Failed to fetch balance:', error)
            setBalance(null)
        }
    }

    const connectWallet = async () => {
        if (!window.amadeus) {
            throw new Error('Amadeus extension not installed')
        }

        setIsLoading(true)
        try {
            // Request account access using the actual Amadeus API
            const accounts = await window.amadeus.requestAccounts()

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found')
            }

            const connectedAddress = accounts[0]
            setAddress(connectedAddress)
            setIsConnected(true)
            localStorage.setItem('amadeus_connected_address', connectedAddress)

            await fetchBalance(connectedAddress)
        } catch (error) {
            console.error('Failed to connect wallet:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const disconnectWallet = () => {
        setAddress(null)
        setBalance(null)
        setIsConnected(false)
        localStorage.removeItem('amadeus_connected_address')
        // Note: Amadeus extension doesn't have a disconnect method
        // The extension manages its own connection state
    }

    const signTransaction = async (txData: any): Promise<string> => {
        if (!window.amadeus || !isConnected) {
            throw new Error('Wallet not connected')
        }

        try {
            const signedTx = await window.amadeus.signTransaction(txData)
            return signedTx
        } catch (error) {
            console.error('Failed to sign transaction:', error)
            throw error
        }
    }

    const value: WalletContextType = {
        isConnected,
        address,
        balance,
        isExtensionInstalled,
        isLoading,
        connectWallet,
        disconnectWallet,
        signTransaction,
    }

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
