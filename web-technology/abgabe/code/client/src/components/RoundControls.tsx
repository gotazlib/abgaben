import './RoundControls.css'

interface RoundControlsProps {
  revealed: boolean
  // false as long as nobody has voted
  canReveal: boolean
  // true while any action of this user is running
  busy: boolean
  revealing: boolean
  resetting: boolean
  onReveal: () => void
  onReset: () => void
}

export default function RoundControls({
  revealed,
  canReveal,
  busy,
  revealing,
  resetting,
  onReveal,
  onReset,
}: RoundControlsProps) {
  return (
    <div className="round-controls">
      {!revealed && (
        <button type="button" className="button" disabled={!canReveal || busy} onClick={onReveal}>
          {revealing ? 'Wird aufgedeckt …' : 'Karten aufdecken'}
        </button>
      )}
      <button
        type="button"
        className={revealed ? 'button' : 'button button--secondary'}
        disabled={busy}
        onClick={onReset}
      >
        {resetting ? 'Wird zurückgesetzt …' : 'Neue Runde'}
      </button>
    </div>
  )
}
