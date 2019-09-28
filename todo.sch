*! requisites
  ! get leaflet working
  ! get Alfonso's S2 cell rendering code working
  ! load our own geojson data
  ! implement basic tooltips
  ! basic deployment to Now.sh
*! minimum-viable
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
*! nominations
  ! permanently switch the Nominations fork to Google Satellite
    @ https://gist.github.com/bencevans/4504864
  !~ add descriptions and coords to Nominations markers
    - Omnivore doesn't give me descriptions; can't do.
  ! make planned points searchable
  ? switch to a single export from Google My Maps
    ? conditional style points based on their layer name
  ? implement query parameter Google My Maps for visualization!
    ? switch search between existing and planned points if present
    ? default to our own when parameter is specified but no value given
*! merge/replace master with howrah
*! presentation and attribution
  - expandable attribution
  - update timestamp
*? v0.4
  ? add more complex custom icons after a zoom level
    ? figure out how to do zoom-dependant styles
    ? draw simple and custom icons as necessary
*? fancier presentation and usability
  ~? add a toggle for Google "satellite" tiles
  ? do dynamic collision-based labels
  ? extend with general location search
  *? expose query parameters for custom datasets graphically
*? automation and offline
  ! automatic deployment through GitHub Actions
    ! automatically updated from iitc-pogo-json    
  *? make offline capable
    @ https://filipbech.github.io/2017/02/service-worker-and-caching-from-other-origins
      - SW can't cache cross origin resources unless they have `access-control-allow-originL *`
      - which GitHack does, thankfully
      ? but Google My Maps does not
        - perhaps write a Now.sh lambda that transparently does this for you
    @ https://github.com/MazeMap/Leaflet.TileLayer.PouchDBCached
      - at least the tiles can be cached
  *? make into a PWA
    ? icons
    ? manifest
    ? install hook
    ? Lighthouse audit
*? post-release
  ? add instructions and schemata for custom datasets
  ? rename repository to `leaflet-map-pogohwh`
  ? make repo public