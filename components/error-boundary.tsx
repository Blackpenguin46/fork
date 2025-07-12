'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught error:', error)
    console.error('🚨 Error Info:', errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900/20 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-red-950/50 border border-red-500/30 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 Academy Page Error Caught</h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Error Message:</h2>
                <pre className="bg-black/50 p-3 rounded text-red-300 text-sm overflow-auto">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Stack Trace:</h2>
                <pre className="bg-black/50 p-3 rounded text-red-300 text-xs overflow-auto max-h-40">
                  {this.state.error?.stack || 'No stack trace available'}
                </pre>
              </div>

              {this.state.errorInfo && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Component Stack:</h2>
                  <pre className="bg-black/50 p-3 rounded text-red-300 text-xs overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="mt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}