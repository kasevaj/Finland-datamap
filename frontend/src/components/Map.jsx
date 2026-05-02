import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { geoJSON as leafletGeoJSON } from 'leaflet'

const FINLAND_BOUNDS = [[55, 13], [72, 37]]

function getColor(pop) {
  return pop > 100000 ? '#084594'
       : pop > 50000  ? '#2171b5'
       : pop > 20000  ? '#4292c6'
       : pop > 10000  ? '#6baed6'
       : pop > 5000   ? '#9ecae1'
       : pop > 2000   ? '#c6dbef'
       :                '#eff3ff'
}

function calcStyle(pop, colorEnabled, isSelected) {
  if (!colorEnabled && !isSelected) {
    return { fillOpacity: 0, fillColor: 'transparent', color: 'transparent', weight: 0 }
  }
  const fillColor = getColor(pop)
  if (!colorEnabled && isSelected) {
    return { fillColor, fillOpacity: 0.85, color: '#fff', weight: 1.8 }
  }
  return { fillColor, fillOpacity: 1, color: '#fff', weight: 0.5 }
}

function MapController({ zoomTarget, onBackgroundClick, featureClickedRef }) {
  const map = useMap()

  useEffect(() => {
    if (!zoomTarget) return
    try {
      const bounds = leafletGeoJSON(zoomTarget.feature).getBounds()
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 11, duration: 1 })
    } catch (e) {
      console.warn('flyToBounds failed:', e)
    }
  }, [zoomTarget, map])

  useEffect(() => {
    const handle = () => {
      if (featureClickedRef.current) { featureClickedRef.current = false; return }
      onBackgroundClick()
    }
    map.on('click', handle)
    return () => map.off('click', handle)
  }, [map, onBackgroundClick, featureClickedRef])

  return null
}

export default function Map({ featureCollection, finlandOutline, colorEnabled, zoomTarget }) {
  const [selectedCode, setSelectedCode] = useState(null)
  const layersRef = useRef({})
  const currentKeyRef = useRef('')   // tracks which GeoJSON render owns layersRef
  const featureClickedRef = useRef(false)
  const colorEnabledRef = useRef(colorEnabled)
  const selectedCodeRef = useRef(selectedCode)

  useEffect(() => { colorEnabledRef.current = colorEnabled }, [colorEnabled])
  useEffect(() => { selectedCodeRef.current = selectedCode }, [selectedCode])

  const geoJsonKey = useMemo(
    () => featureCollection?.features.map(f => f.properties.code).join(',') ?? '',
    [featureCollection]
  )

  // Reset selection when the visible municipality set changes
  useEffect(() => { setSelectedCode(null) }, [geoJsonKey])

  // Imperatively restyle layers when colorEnabled or selectedCode changes.
  // Skip layers no longer on the map (stale refs from a previous render).
  useEffect(() => {
    Object.entries(layersRef.current).forEach(([code, layer]) => {
      if (!layer.feature || !layer._map) return
      layer.setStyle(calcStyle(
        layer.feature.properties.population,
        colorEnabled,
        code === selectedCode
      ))
    })
  }, [colorEnabled, selectedCode])

  const handleBackgroundClick = useCallback(() => setSelectedCode(null), [])

  return (
    <MapContainer
      center={[64.5, 26]}
      zoom={5}
      minZoom={5}
      maxZoom={13}
      maxBounds={FINLAND_BOUNDS}
      maxBoundsViscosity={1.0}
      preferCanvas={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController
        zoomTarget={zoomTarget}
        onBackgroundClick={handleBackgroundClick}
        featureClickedRef={featureClickedRef}
      />

      {featureCollection && (
        <GeoJSON
          key={geoJsonKey}
          data={featureCollection}
          style={feature => calcStyle(
            feature.properties.population,
            colorEnabled,
            feature.properties.code === selectedCode
          )}
          onEachFeature={(feature, layer) => {
            const { code, name, population } = feature.properties

            // First feature of a new GeoJSON mount: clear stale layer refs
            if (currentKeyRef.current !== geoJsonKey) {
              layersRef.current = {}
              currentKeyRef.current = geoJsonKey
            }
            layersRef.current[code] = layer

            layer.bindPopup(
              `<strong>${name}</strong><br/>Väestö: ${population.toLocaleString('fi-FI')}`
            )

            layer.on('click', () => {
              featureClickedRef.current = true
              setSelectedCode(prev => prev === code ? null : code)
            })

            layer.on('mouseover', () => {
              const col = colorEnabledRef.current
              const sel = selectedCodeRef.current === code
              if (col) {
                layer.setStyle({ fillOpacity: 0.7 })
              } else if (!sel) {
                layer.setStyle({ fillOpacity: 0.22, fillColor: '#93c5fd', color: 'transparent', weight: 0 })
              }
            })

            layer.on('mouseout', () => {
              layer.setStyle(calcStyle(
                population,
                colorEnabledRef.current,
                selectedCodeRef.current === code
              ))
            })
          }}
        />
      )}

      {/* Finland outer border — only when colors are on, on top, no fill, non-interactive */}
      {finlandOutline && colorEnabled && (
        <GeoJSON
          key="finland-border"
          data={finlandOutline}
          style={{ color: '#334155', weight: 2.2, fillOpacity: 0, interactive: false }}
        />
      )}
    </MapContainer>
  )
}
