import { useState, useMemo } from 'react'

const LEGEND = [
  { label: '> 100 000', color: '#084594' },
  { label: '50 001 – 100 000', color: '#2171b5' },
  { label: '20 001 – 50 000', color: '#4292c6' },
  { label: '10 001 – 20 000', color: '#6baed6' },
  { label: '5 001 – 10 000', color: '#9ecae1' },
  { label: '2 001 – 5 000', color: '#c6dbef' },
  { label: '≤ 2 000', color: '#eff3ff' },
]

export default function Filter({
  features, query, onQueryChange, onSelect,
  totalCount, filteredCount, colorEnabled, onToggleColor,
}) {
  const [legendOpen, setLegendOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const suggestions = useMemo(() => {
    if (!query.trim() || !features) return []
    const lower = query.toLowerCase()
    return features
      .filter(f => f.properties.name.toLowerCase().includes(lower))
      .slice(0, 8)
  }, [query, features])

  const showDropdown = focused && suggestions.length > 0

  function pickSuggestion(feature) {
    onSelect(feature)
    setFocused(false)
    setHighlightIndex(-1)
  }

  function handleKeyDown(e) {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const target = highlightIndex >= 0 ? suggestions[highlightIndex] : suggestions[0]
      if (target) pickSuggestion(target)
    } else if (e.key === 'Escape') {
      onQueryChange('')
      setFocused(false)
    }
  }

  return (
    <div className="ui-overlay">
      {/* ── Search group (top) ── */}
      <div className="search-group">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="18" y2="18" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => { onQueryChange(e.target.value); setHighlightIndex(-1) }}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Hae kuntaa..."
            className="search-input"
            autoComplete="off"
          />
          {query && <span className="search-count">{filteredCount}/{totalCount}</span>}
          {query && (
            <button className="search-clear" onMouseDown={e => e.preventDefault()} onClick={() => onQueryChange('')}>
              ✕
            </button>
          )}
        </div>

        {showDropdown && (
          <ul className="suggestions">
            {suggestions.map((f, i) => (
              <li
                key={f.properties.code}
                className={`suggestion-item${i === highlightIndex ? ' highlighted' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => pickSuggestion(f)}
              >
                {f.properties.name}
                <span className="suggestion-pop">
                  {f.properties.population.toLocaleString('fi-FI')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Bottom controls (legend + color toggle) ── */}
      <div className="legend-wrapper">
        {legendOpen && (
          <div className="legend-panel">
            <p className="legend-title">Väestö</p>
            {LEGEND.map(({ label, color }) => (
              <div key={color} className="legend-row">
                <span className="legend-swatch" style={{ background: color }} />
                <span className="legend-label">{label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bottom-btns">
          <button
            className={`chip-btn${colorEnabled ? ' chip-btn--active' : ''}`}
            onClick={onToggleColor}
          >
            {colorEnabled ? 'Värit päällä' : 'Värit pois'}
          </button>
          <button
            className="legend-toggle"
            onClick={() => setLegendOpen(v => !v)}
            aria-label="Toggle legend"
          >
            {legendOpen ? '✕' : '▲ Väestö'}
          </button>
        </div>
      </div>
    </div>
  )
}
