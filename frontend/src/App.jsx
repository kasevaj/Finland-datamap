import { useState, useEffect, useMemo, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import Map from './components/Map'
import Filter from './components/Filter'

export default function App() {
  const [geoData, setGeoData] = useState(null)
  const [finlandOutline, setFinlandOutline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [colorEnabled, setColorEnabled] = useState(true)
  const [zoomTarget, setZoomTarget] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/municipalities.geojson').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() }),
      fetch('/finland_outline.geojson').then(r => r.ok ? r.json() : null),
    ])
      .then(([muni, outline]) => {
        setGeoData(muni)
        setFinlandOutline(outline)
        setLoading(false)
      })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(timer)
  }, [query])

  const filteredGeoData = useMemo(() => {
    if (!geoData) return null
    if (!debouncedQuery.trim()) return geoData
    const lower = debouncedQuery.toLowerCase()
    return {
      ...geoData,
      features: geoData.features.filter(f =>
        f.properties.name.toLowerCase().includes(lower)
      ),
    }
  }, [geoData, debouncedQuery])

  const handleSelect = useCallback((feature) => {
    setQuery(feature.properties.name)
    setZoomTarget({ feature, key: Date.now() })
  }, [])

  if (loading) return <div className="status-screen">Ladataan kuntadata...</div>

  if (error) {
    return (
      <div className="status-screen error">
        <p>Karttadata puuttuu: {error}</p>
        <p><code>python scripts/export_geojson.py</code></p>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="map-wrapper">
        <Map
          featureCollection={filteredGeoData}
          finlandOutline={finlandOutline}
          colorEnabled={colorEnabled}
          zoomTarget={zoomTarget}
        />
      </div>
      <Filter
        features={geoData.features}
        query={query}
        onQueryChange={setQuery}
        onSelect={handleSelect}
        totalCount={geoData.features.length}
        filteredCount={filteredGeoData.features.length}
        colorEnabled={colorEnabled}
        onToggleColor={() => setColorEnabled(v => !v)}
      />
    </div>
  )
}
