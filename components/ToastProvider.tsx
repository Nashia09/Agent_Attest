'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }

const ToastContext = createContext<{
  state: ToastState
  dispatch: React.Dispatch<ToastAction>
} | null>(null)

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) }
    default:
      return state
  }
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  const { dispatch } = context

  const toast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString()
    dispatch({ type: 'ADD_TOAST', payload: { id, type, title, message } })
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id })
    }, 5000)
  }

  return { toast }
}

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-success-600" />
    case 'error':
      return <XCircle className="w-5 h-5 text-error-600" />
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-warning-600" />
    case 'info':
      return <AlertCircle className="w-5 h-5 text-primary-600" />
  }
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {state.toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-enter w-80 bg-white rounded-lg shadow-lg border border-accent-200 p-4 flex items-start space-x-3"
          >
            <div className="flex-shrink-0">
              <ToastIcon type={toast.type} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-accent-900">{toast.title}</h4>
              {toast.message && (
                <p className="text-sm text-accent-600 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="flex-shrink-0 text-accent-400 hover:text-accent-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider