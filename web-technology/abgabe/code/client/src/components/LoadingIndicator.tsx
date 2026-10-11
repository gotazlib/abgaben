import './LoadingIndicator.css'

interface LoadingIndicatorProps {
  label?: string
}

export default function LoadingIndicator({ label = 'Wird geladen…' }: LoadingIndicatorProps) {
  // role="status" lets screen readers announce the text without interrupting
  return (
    <p className="loading-indicator" role="status">
      <span className="loading-indicator__spinner" aria-hidden="true" />
      {label}
    </p>
  )
}
