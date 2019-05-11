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
  ? figure out how to do zoom-dependant styles
  ? add icons after a zoom level
  ? find out how dynamic labels can work
  ? find a way to do add landmark searching
*? v0.4
  ? automatic deployment through GitHub Actions
    ? automatically updated from iitc-pogo-json
  ? make offline capable
  ? make into a PWA
