/* global L, S2, omnivore */

/*
Setup the Leaflet map
*/

const map = L.map('map').setView([22.57, 88.32403643149632], 15)

// eslint-disable-next-line no-unused-vars
const hash = new L.Hash(map)

L.control.locate({
  flyTo: true,
  drawCircle: false,
  drawMarker: false,
}).addTo(map)

// The fabled Google Maps satellite layer :angelic choir:
// eslint-disable-next-line no-unused-vars
const tileSatellite = L.gridLayer.googleMutant({
  type: 'satellite', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
  opacity: 0,
}).addTo(map)

// And Mapbox' vector
// eslint-disable-next-line no-unused-vars
const tileStreet = L.tileLayer(
  'https://api.mapbox.com/styles/v1/scio/cjvuj7krb2j1g1cs29u8y3z49/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    accessToken: 'pk.eyJ1Ijoic2NpbyIsImEiOiJjanZocmp0aXAwNjZ2NDNsamE3dXNwc2I1In0.zfAzKEDrAmDSqiOfS_naVw',
    attribution: 'map tiles &copy; <a href="https://www.openstreetmap.org/">Mapbox</a>, <a href="https://creativecommons.org/licenses/by/3.0/us/">CC-BY</a> | map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | dataset from <a href="https://github.com/PoGOHWH/db-poi">pogohwh/db-poi</a>',
    maxZoom: 23,
  }).addTo(map)

const updateTiles = () => {
  const zoom = map.getZoom()
  if (zoom >= 17) tileStreet.setOpacity(1 - (zoom - 17) / 5)
  else tileSatellite.setOpacity(1)
  if (zoom <= 20) tileSatellite.setOpacity(1 - (20 - zoom) / 4)
  else tileSatellite.setOpacity(1)
}
map.on('zoomend', updateTiles)

// Google My Maps layers
// eslint-disable-next-line no-unused-vars
const addKML = (url, style) => {
  const layer = L.geoJSON(null, {
    onEachFeature: feature => {
      feature.properties.name = `${feature.properties.name} <${feature.geometry.coordinates[1]}, ${feature.geometry.coordinates[0]}>`
    },
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      stroke: true,
      color: '#FFFFFF',
      weight: 2,
      fill: true,
      fillColor: '#FB2165',
      radius: 3,
      fillOpacity: 1,
      text: feature.properties.name,
      ...style
    }),
    style: feature => {
      if (feature.properties.name.match(/(\?|\*)$/)) return { fillOpacity: 0.5 }
      return { fillOpacity: 1 }
    }
  })
    .bindTooltip(
      layer => layer.feature.properties.name, // Unfortunately the KMLs have no description property to
      {
        direction: 'top'
      }
    )
    .addTo(map)
  omnivore.kml(
    url,
    null,
    layer
  )
  return layer
}
// planned
const planned = addKML(
  'https://www.google.com/maps/d/kml?forcekml=1&mid=1V8ZPH-jR85lf00uSoBdnuFl7Nfkl9Pbx&lid=m0CmT0c9nv4', {
    fillColor: '#FB2165',
    radius: 7,
  }
)
new L.Control.Search({
  initial: false,
  layer: planned,
  propertyName: 'name',
  marker: {
    icon: false,
    circle: {
      stroke: true,
      color: '#f9af02',
      fill: false,
      radius: 12,
    }
  },
  moveToLocation: (latlng, title, map) => {
    console.log(latlng, title, map)
    map.setView(latlng, 17)
  },
})
  .addTo(map)
// nominated
addKML(
  'https://www.google.com/maps/d/kml?forcekml=1&mid=1V8ZPH-jR85lf00uSoBdnuFl7Nfkl9Pbx&lid=iGZV7vq4d4w', {
    fillColor: '#FB2165',
    opacity: 0.5,
  }
)
// invalid
addKML(
  'https://www.google.com/maps/d/kml?forcekml=1&mid=1V8ZPH-jR85lf00uSoBdnuFl7Nfkl9Pbx&lid=U2-kbDVGLfo', {
    fillColor: '#767676',
    opacity: 0.5,
  }
)

// existing points
fetch('https://raw.githubusercontent.com/PoGOHWH/db-poi/master/poi.geojson') // NOTE: cache w/ SW
  .then(response => response.json())
  .then(data => {
    // add unique concatenation of name and guid for searching
    data.features.forEach(feature => {
      feature.properties.search = `${feature.properties.name} [${feature.properties.guid}]`
    })
    return data
  })
  .then(data => {
    const features = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        stroke: true,
        color: '#FFFFFF',
        weight: 2,
        fill: true,
        radius: 5,
        text: feature.properties.name,
      }),
      style: feature => {
        switch (feature.properties.pogo_type) {
          case 'gym':
            return {
              fillColor: '#13c193',
              radius: 5,
              fillOpacity: 1,
            }
          case 'stop':
            return {
              fillColor: '#13c193',
              radius: 3,
              fillOpacity: 1
            }
          default:
            return {
              fillColor: '#f000c4',
              radius: 1,
              fillOpacity: 1,
            }
        }
      }
    })
    features
      // .bindPopup(layer => layer.feature.properties.name)
      .bindTooltip(layer => layer.feature.properties.name, {
        direction: 'top'
      })
      .addTo(map)
  })

/*
Overlay the S2 cells
CREDIT: S2 cell drawing pretty much borrowed directly from
https://gitlab.com/AlfonsoML/pogo-s2/blob/93cc77c1973b4978610ff25a85273d290e2754a0/s2check.user.js
*/

// eslint-disable-next-line prefer-const
let regionLayer

const updateMapGrid = () => {
  regionLayer.clearLayers()

  const bounds = map.getBounds()
  const seenCells = {}

  const levels = {
    17: {
      color: '#f9af02',
      opacity: 1,
      weight: 1,
    },
    14: {
      color: '#e57002',
      opacity: 0.3,
      weight: 3,
    },
    10: {
      color: '#e55102',
      opacity: 0.2,
      weight: 5,
    },
  }

  const drawCell = (cell, options) => {
    // corner points
    const corners = cell.getCornerLatLngs()
    // the level 6 cells have noticible errors with non-geodesic lines - and the larger level 4 cells are worse
    // NOTE: we only draw two of the edges. as we draw all cells on screen, the other two edges will either be drawn
    // from the other cell, or be off screen so we don't care
    const region = L.polyline([corners[0], corners[1], corners[2]], {
      fill: false,
      clickable: false,
      ...options,
    })
    regionLayer.addLayer(region)
  }

  const drawCellAndNeighbors = (cell, options) => {
    const cellStr = cell.toString()
    if (!seenCells[cellStr]) {
      // cell not visited - flag it as visited now
      seenCells[cellStr] = true
      // is it on the screen?
      const corners = cell.getCornerLatLngs()
      const cellBounds = L.latLngBounds([corners[0], corners[1]]).extend(corners[2]).extend(corners[3])
      if (cellBounds.intersects(bounds)) {
        // on screen - draw it
        drawCell(cell, options)
        // and recurse to our neighbors
        const neighbors = cell.getNeighbors()
        for (let i = 0; i < neighbors.length; i++) {
          drawCellAndNeighbors(neighbors[i], options)
        }
      }
    }
  }

  // center cell
  const zoom = map.getZoom()

  Object.keys(levels).forEach(level => {
    const options = levels[level]
    if (zoom >= level) {
      const cell = S2.S2Cell.FromLatLng(map.getCenter(), level)
      drawCellAndNeighbors(cell, options)
    }
  })
}

map.attributionControl.setPrefix('getting last update')
fetch('https://api.github.com/repos/pogohwh/db-poi/commits?path=poi.geojson')
  .then(res => res.json())
  .then(json => new Date(json[0].commit.author.date))
  .then(date => date.toLocaleString('en-IN-u-ca-iso8601', { dateStyle: 'medium', timeStyle: 'short' }))
  .then(dateString => map.attributionControl.setPrefix(`last updated on <strong>${dateString}</strong>`))

regionLayer = L.layerGroup()
map.addLayer(regionLayer)
map.on('moveend', updateMapGrid)
updateTiles()
updateMapGrid()
