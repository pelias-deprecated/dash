
app.controller( 'MapIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager, $location ) {

  // Helper Functions ( For Context Menu )
  function showCoordinates (e) { alert( e.latlng ); }
  function centerMap (e) { map.panTo(e.latlng); }
  function zoomIn (e) { map.zoomIn(); }
  function zoomOut (e) { map.zoomOut(); }
  
  // Helper Functions ( For encoding/decoding lat/lon/zoom values to a cookie and back )
  function getLocStr(geo, zoom) { return Number( geo[0] ).toFixed(7) + ',' + Number( geo[1] ).toFixed(7) + ',' + zoom; }
  function getLatLonZoom(string) {
    var locArr = string.split(",");
    return {
      latitude: locArr[0],
      longitude:locArr[1],
      zoom:     locArr[2]
    }
  }
  
  var cLoc   = $.cookie("loc");
  var cPos   = cLoc ? getLatLonZoom(cLoc) : { latitude: 40.7259, longitude: -73.9805, zoom: 12 };

  var baseLat= cPos.latitude;
  var baseLng= cPos.longitude;
  var baseZm = cPos.zoom;

  // Init map
  var map = L.map( 'map', {
    zoomControl: false,
    attributionControl: false,
    contextmenu: true,
    center: [baseLat, baseLng],
    zoom: baseZm,
    contextmenuWidth: 140,
    contextmenuItems: [{
      text: 'Show coordinates',
      callback: showCoordinates
    }, {
      text: 'Center map here',
      callback: centerMap
    }, '-', {
      text: 'Zoom in',
      icon: 'images/zoom-in.png',
      callback: zoomIn
    }, {
      text: 'Zoom out',
      icon: 'images/zoom-out.png',
      callback: zoomOut
    }]
  });

  // Controls
  map.addControl(new L.Control.ZoomMin({ position: 'topright' }));
  L.control.locate({ position: 'topright' }).addTo(map);
  // L.control.fullscreen().addTo(map);
  L.Marker.include(L.Mixin.ContextMenu);

  // Configure map
  map.addLayer( L.tileLayer.provider( 'MapBox.missinglink.i3ook7ke' ) );
  var layerManager = PeliasGeoJsonLayerManager.bind( map );

  // Host String
  var hostMask = 'http://:domain::port:/:st:/:est:/{z}/{y}/{x}';

  // Use subdomains if configured at the DNS level
  // if( document.domain === 'pelias.wiz.co.nz' ){
  //   hostMask = 'http://{s}.:domain::port:/:st:/:est:/{z}/{y}/{x}';
  // }

  var hostString = hostMask.replace( ':domain:', document.domain )
                           .replace( ':port:', location.port ? ':' + location.port : '' );

  // Geonames
  layerManager.register( 'geonames',
    hostString.replace(':st:','points').replace(':est:','geoname'),
    { color: '#D00' }
  ).disable( 'geonames' );

  // OSM
  layerManager.register( 'osm.node',
    hostString.replace(':st:','points').replace(':est:','osmnode'),
    { color: '#FF00FF' }
  ).disable( 'osm.node' );

  // OSM
  layerManager.register( 'osm.way',
    hostString.replace(':st:','points').replace(':est:','osmway'),
    { color: '#00FF00' }
  ).disable( 'osm.way' );

  // Admin0
  layerManager.register( 'quattroshapes.admin0',
    hostString.replace(':st:','shapes').replace(':est:','admin0'),
    { color: '#FF00FF' }
  ).disable( 'quattroshapes.admin0' );

  // Admin1
  layerManager.register( 'quattroshapes.admin1',
    hostString.replace(':st:','shapes').replace(':est:','admin1'),
    { color: '#00FFFF' }
  ).disable( 'quattroshapes.admin1' );

  // Admin2
  layerManager.register( 'quattroshapes.admin2',
    hostString.replace(':st:','shapes').replace(':est:','admin2'),
    { color: '#FFFF00' }
  ).disable( 'quattroshapes.admin2' );

  // Local Admin
  layerManager.register( 'quattroshapes.localadmin',
    hostString.replace(':st:','shapes').replace(':est:','local_admin'),
    { color: '#0D0' }
  ).disable( 'quattroshapes.localadmin' );

  // Locality
  layerManager.register( 'quattroshapes.locality',
    hostString.replace(':st:','shapes').replace(':est:','locality'),
    { color: '#00D' }
  ).disable( 'quattroshapes.locality' );

  // Neighborhood
  layerManager.register( 'quattroshapes.neighborhood',
    hostString.replace(':st:','shapes').replace(':est:','neighborhood'),
    { color: '#D00' }
  ).disable( 'quattroshapes.neighborhood' );

  // Manually add layer
  // map.addLayer( PeliasGeoJsonLayer( '/shapes/locality/{z}/{y}/{x}' ) );


  var setMapCoords = function(coords, zoom) {
    $rootScope.geobase = coords;
    $rootScope.$emit( 'geobase', $rootScope.geobase, zoom );
    $rootScope.$emit( 'map.setView', [ Number( $rootScope.geobase[0] ).toFixed(7), Number( $rootScope.geobase[1] ).toFixed(7) ], zoom ); 
  }

  map.whenReady(function(){
    var loc = $location.search().loc;
    if (loc) {
      var pos = getLatLonZoom(loc);
      if (loc!=cLoc) {
        $rootScope.$emit( 'map.setView', [ pos.latitude, pos.longitude ], pos.zoom );
      }
      $rootScope.$emit( 'geobase', [ pos.latitude, pos.longitude ], pos.zoom );
      $.cookie("loc", loc )
    } else if (cLoc) {
      // do nothing, map is already set to baseLat, baseLng (which is equal to the cookie value in this case)
      $rootScope.$emit( 'geobase', [ cPos.latitude, cPos.longitude ], cPos.zoom );
      $location.search({"loc":  getLocStr([ cPos.latitude, cPos.longitude ], cPos.zoom)});
    } else {
      navigator.geolocation.getCurrentPosition( function( pos ){
        if( pos && pos.coords ){
          setMapCoords( [ pos.coords.latitude, pos.coords.longitude ], 12 );
        }
      }, function(){
        // do nothing, map is already set to baseLat, baseLng
        console.log( 'geolocation error', arguments );
      });
    }
  });
  
  map.on('moveend', function () {
    var pos = map.getCenter();
    var locStr = getLocStr([pos.lat, pos.lng ], map.getZoom());
    $location.search({"loc": locStr});
    $.cookie("loc",  locStr);
    $rootScope.$emit( 'geobase', [ pos.lat, pos.lng ], map.getZoom() );
  });

  $rootScope.$on( 'map.setView', function( ev, geo, zoom ){
    map.setView( geo, zoom || 8 );
  });

});
