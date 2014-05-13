
app.controller( 'MapIndexController', function( $scope, PeliasGeoJsonLayerManager ) {

  // Helper Functions ( For Context Menu )
  function showCoordinates (e) { alert( e.latlng ); }
  function centerMap (e) { map.panTo(e.latlng); }
  function zoomIn (e) { map.zoomIn(); }
  function zoomOut (e) { map.zoomOut(); }

  // Init map
  var map = L.map( 'map', {
    zoomControl: false,
    contextmenu: true,
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
  map.addControl(new L.Control.ZoomMin());
  L.control.locate().addTo(map);
  // L.control.fullscreen().addTo(map);
  L.Marker.include(L.Mixin.ContextMenu);

  // Configure map
  map.addLayer( L.tileLayer.provider( 'MapBox.missinglink.i3ook7ke' ) );
  var layerManager = PeliasGeoJsonLayerManager.bind( map )
  
  // Geonames
  layerManager.register( 'geonames.all',
    '/points/geoname/{z}/{y}/{x}',
    { color: '#D00' }
  ).disable( 'geonames.all' );

  // Admin0
  layerManager.register( 'quattroshapes.admin0',
    '/shapes/admin0/{z}/{y}/{x}',
    { color: '#FF00FF' }
  ).enable( 'quattroshapes.admin0' );

  // Admin1
  layerManager.register( 'quattroshapes.admin1',
    '/shapes/admin1/{z}/{y}/{x}',
    { color: '#00FFFF' }
  ).enable( 'quattroshapes.admin1' );

  // Admin2
  layerManager.register( 'quattroshapes.admin2',
    '/shapes/admin2/{z}/{y}/{x}',
    { color: '#FFFF00' }
  ).enable( 'quattroshapes.admin2' );

  // Local Admin
  layerManager.register( 'quattroshapes.localadmin',
    '/shapes/local_admin/{z}/{y}/{x}',
    { color: '#0D0' }
  ).enable( 'quattroshapes.localadmin' );

  // Locality
  layerManager.register( 'quattroshapes.locality',
    '/shapes/locality/{z}/{y}/{x}',
    { color: '#00D' }
  ).enable( 'quattroshapes.locality' );

  // Neighborhood
  layerManager.register( 'quattroshapes.neighborhood',
    '/shapes/neighborhood/{z}/{y}/{x}',
    { color: '#D00' }
  ).enable( 'quattroshapes.neighborhood' );

  // Manually add layer
  // map.addLayer( PeliasGeoJsonLayer( '/shapes/locality/{z}/{y}/{x}' ) );

  // Center map
  // map.setView( [ 51.505, -0.124 ], 12 ); // London
  map.setView( [ 40.75558, -74.00391 ], 8 ); // New York

});
