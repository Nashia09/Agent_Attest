import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function truncateHash(hash: string, length: number = 8) {
  if (hash.length <= length * 2) return hash
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`
}

export function calculateRiskScore(application: any): number {
  // Mock risk calculation
  let score = 50 // Base score
  
  if (application.claimedPermissions?.includes('high-value')) score += 20
  if (application.claimedPermissions?.includes('sensitive')) score += 15
  if (!application.contactEmail) score += 10
  
  return Math.min(100, Math.max(0, score))
}