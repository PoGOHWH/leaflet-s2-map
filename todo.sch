*! v0.1
  ! get leaflet working
  ! get Alfonso's S2 cell rendering code working
  ! load our own geojson data
  ! implement basic tooltips
  ! basic deployment to Now.sh
*! v0.2
  ! standardize html
  ! fix scaling on mobile
  ! color S2 cells by level
  ! add geolocation 
  ! add feature searching
    ! find a way to search duplicate feature names
      - perhaps iterate over the features and extend them with an additional property that is a concatenation of name and guid
  ! get planned Pokéstops rendering with KML
    ! get the KML render remotely!
      - would make it harder to enable offline, but so be it
    ! style it properly
  ! get existing poi geojson to load remotely!
  ! add attribution
  ! persist state with url
*? v0.3
  ? extend information
    - use an about modal
    - data can't be 100% due to Ingress–PoGO anomalies
    - data is manually tagged, report to iitc-pogo-json if errors are noticed
    - data will always be a bit stale, 
      ? timestamp with date for the latest update to `IITC-pogo.geojson`
    - warn about eyeballing cell boundaries as the Nomination form uses Google Maps Satellite and everything else uses
  ? add a toggle for Google "satellite" tiles
  ? switch all styles to the simpler bordered versions
*? v0.4
  ? add more complex custom icons after a zoom level
    ? figure out how to do zoom-dependant styles
    ? draw simple and custom icons as necessary
  ? do dynamic collision-based labels
  ? extend with general location search
*? v0.5
  ? automatic deployment through GitHub Actions
    ? automatically updated from iitc-pogo-json
  ? make offline capable
  ? make into a PWA
