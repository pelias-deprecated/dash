
app.controller( 'MapIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager ) {

  // Helper Functions ( For Context Menu )
  function showCoordinates (e) { alert( e.latlng ); }
  function centerMap (e) { map.panTo(e.latlng); }
  function zoomIn (e) { map.zoomIn(); }
  function zoomOut (e) { map.zoomOut(); }

  // Init map
  var map = L.map( 'map', {
    zoomControl: false,
    attributionControl: false,
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

  // Geonames
  layerManager.register( 'osm.node',
    hostString.replace(':st:','points').replace(':est:','osmnode'),
    { color: '#FF00FF' }
  ).disable( 'osm.node' );

  // // Admin0
  // layerManager.register( 'quattroshapes.admin0',
  //   hostString.replace(':st:','shapes').replace(':est:','admin0'),
  //   { color: '#FF00FF' }
  // ).disable( 'quattroshapes.admin0' );

  // // Admin1
  // layerManager.register( 'quattroshapes.admin1',
  //   hostString.replace(':st:','shapes').replace(':est:','admin1'),
  //   { color: '#00FFFF' }
  // ).disable( 'quattroshapes.admin1' );

  // // Admin2
  // layerManager.register( 'quattroshapes.admin2',
  //   hostString.replace(':st:','shapes').replace(':est:','admin2'),
  //   { color: '#FFFF00' }
  // ).disable( 'quattroshapes.admin2' );

  // // Local Admin
  // layerManager.register( 'quattroshapes.localadmin',
  //   hostString.replace(':st:','shapes').replace(':est:','local_admin'),
  //   { color: '#0D0' }
  // ).disable( 'quattroshapes.localadmin' );

  // // Locality
  // layerManager.register( 'quattroshapes.locality',
  //   hostString.replace(':st:','shapes').replace(':est:','locality'),
  //   { color: '#00D' }
  // ).disable( 'quattroshapes.locality' );

  // // Neighborhood
  // layerManager.register( 'quattroshapes.neighborhood',
  //   hostString.replace(':st:','shapes').replace(':est:','neighborhood'),
  //   { color: '#D00' }
  // ).disable( 'quattroshapes.neighborhood' );

  // Manually add layer
  // map.addLayer( PeliasGeoJsonLayer( '/shapes/locality/{z}/{y}/{x}' ) );

  // Center map
  // map.setView( [ 51.505, -0.124 ], 12 ); // London
  // map.setView( [ 40.75558, -74.00391 ], 8 ); // New York

  var setGeoBase = function( coords ){
    if( !coords ){
      console.log( 'using default geolocation' );
      $rootScope.geobase = [ 51.505, -0.124 ]; // London
    }
    else {
      $rootScope.geobase = coords;
    }
    $rootScope.$emit( 'geobase', $rootScope.geobase );
    map.setView( $rootScope.geobase, 15 ); // London
  }

  navigator.geolocation.getCurrentPosition( function( pos ){
    if( pos && pos.coords ){
      setGeoBase( [ pos.coords.latitude, pos.coords.longitude ] );
    }
  }, function(){
    console.log( 'geolocation error', arguments );
    setGeoBase();
  });

  $rootScope.$on( 'map.setView', function( ev, geo, zoom ){
    console.log( 'setView', geo, zoom || 8 );
    map.setView( geo, zoom || 8 );
  })

});
