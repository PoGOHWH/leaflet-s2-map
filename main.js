/* global L, S2 */

/*
Setup the Leaflet map
*/

const accessToken = 'pk.eyJ1Ijoic2NpbyIsImEiOiJjanZocmp0aXAwNjZ2NDNsamE3dXNwc2I1In0.zfAzKEDrAmDSqiOfS_naVw'

const map = L.map('map').setView([22.5609, 88.3612], 12)

L.control.locate({
  flyTo: true,
  drawCircle: false,
  drawMarker: false,
}).addTo(map)

L.tileLayer(
  'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    accessToken,
    attribution: 'map tiles &copy; <a href="https://www.openstreetmap.org/">Mapbox</a>, <a href="https://creativecommons.org/licenses/by/3.0/us/">CC-BY</a> | map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a> | dataset from <a href="https://github.com/PoGOHWH/iitc-pogo-json">pogohwh/iitc-pogo-json</a>',
    maxZoom: 18,
  }).addTo(map)

fetch('https://raw.githubusercontent.com/PoGOHWH/iitc-pogo-json/master/IITC-pogo.geojson') // NOTE: cache w/ SW
  .then(response => response.json())
  .then(data => {
    const features = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        stroke: false,
        fill: true,
        radius: 5,
        fillOpacity: 1,
        text: feature.properties.name,
      }),
      style: feature => {
        switch (feature.properties.pogo_type) {
          case 'gym':
            return {
              fillColor: '#000000',
              radius: 7,
              fillOpacity: 1,
            }
          case 'stop':
            return {
              fillColor: '#13c193',
              radius: 5,
              fillOpacity: 0.75
            }
          default:
            return {
              fillColor: '#f000c4',
              radius: 1,
              fillOpacity: 0.5,
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

    const searchControl = new L.Control.Search({
      position: 'topright',
      initial: false,
      layer: features,
      propertyName: 'name',
      marker: {
        icon: false,
        circle: {
          stroke: true,
          color: '#e57002',
          fill: false,
          radius: 12,
        }
      },
      moveToLocation: (latlng, title, map) => {
        map.setView(latlng, 17)
      },
    })
    searchControl
      // .on('search:locationfound', e => {
      //   console.log(e)
      //   e.layer.setStyle({
      //     stroke: true,
      //     weight: 4,
      //     color: '#e57002',
      //   })
      //   e.layer.openPopup()
      // })
      // .on('search:collapsed', e => {
      //   features.eachLayer(layer => { // restore feature color
      //     features.resetStyle(layer)
      //   })
      // })
      .addTo(map)
  })

/*
Overlay the S2 cells
CREDIT: S2 cell drawing pretty much borrowed directly from
https://gitlab.com/AlfonsoML/pogo-s2/blob/93cc77c1973b4978610ff25a85273d290e2754a0/s2check.user.js
*/

let regionLayer

const updateMapGrid = () => {
  regionLayer.clearLayers()

  const bounds = map.getBounds()
  const seenCells = {}

  const levels = {
    17: {
      color: '#f9af02',
      opacity: 0.5,
      weight: 1,
    },
    14: {
      color: '#e57002',
      opacity: 0.3,
      weight: 3,
    },
    10: {
      color: '#e55102',
      opacity: 0.25,
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
    let cellStr = cell.toString()
    if (!seenCells[cellStr]) {
      // cell not visited - flag it as visited now
      seenCells[cellStr] = true
      // is it on the screen?
      let corners = cell.getCornerLatLngs()
      let cellBounds = L.latLngBounds([corners[0], corners[1]]).extend(corners[2]).extend(corners[3])
      if (cellBounds.intersects(bounds)) {
        // on screen - draw it
        drawCell(cell, options)
        // and recurse to our neighbors
        let neighbors = cell.getNeighbors()
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

regionLayer = L.layerGroup()
map.addLayer(regionLayer)
map.on('moveend', updateMapGrid)
updateMapGrid()
