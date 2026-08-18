import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold">משהו השתבש</h1>
          <p className="max-w-prose text-muted-foreground">
            אירעה שגיאה בלתי צפויה באפליקציה. ניתן לנסות לרענן את העמוד.
          </p>
          <Button onClick={() => window.location.reload()}>רענון העמוד</Button>
        </div>
      )
    }
    return this.props.children
  }
}
