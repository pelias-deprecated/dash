
app.controller( 'MapIndexController', function( $scope, PeliasGeoJsonLayerManager ) {

  // Init map
  var map = L.map( 'map', { zoomControl: false } );

  // Configure map
  map.addLayer( L.tileLayer.provider( 'MapBox.missinglink.i3ook7ke' ) );
  var layerManager = PeliasGeoJsonLayerManager.bind( map )
  
  // Geonames
  layerManager.register( 'geonames.all',
    'http://localhost:3000/shapes/geonames/{z}/{y}/{x}',
    { color: '#D00' }
  );

  // Admin0
  layerManager.register( 'quattroshapes.admin0',
    'http://localhost:3000/shapes/admin0/{z}/{y}/{x}',
    { color: '#D00' }
  );

  // Admin1
  layerManager.register( 'quattroshapes.admin1',
    'http://localhost:3000/shapes/admin1/{z}/{y}/{x}',
    { color: '#D00' }
  );

  // Admin2
  layerManager.register( 'quattroshapes.admin2',
    'http://localhost:3000/shapes/admin2/{z}/{y}/{x}',
    { color: '#D00' }
  );

  // Locality
  layerManager.register( 'quattroshapes.locality',
    'http://localhost:3000/shapes/locality/{z}/{y}/{x}',
    { color: '#D00' }
  ).enable( 'quattroshapes.locality' );

  // Locality
  layerManager.register( 'quattroshapes.neighborhood',
    'http://localhost:3000/shapes/neighborhood/{z}/{y}/{x}',
    { color: '#D00' }
  ).enable( 'quattroshapes.neighborhood' );

  // Manually add layer
  // map.addLayer( PeliasGeoJsonLayer( 'http://localhost:3000/shapes/locality/{z}/{y}/{x}' ) );

  // Center map
  map.setView( [ 51.505, -0.124 ], 12 );

});
