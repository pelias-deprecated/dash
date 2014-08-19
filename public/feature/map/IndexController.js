
app.controller( 'MapIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager, $location ) {

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
    center: [51.505, -0.124],
    zoom: 12,
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

  // Center map
  // map.setView( [ 51.505, -0.124 ], 12 ); // London
  // map.setView( [ 40.75558, -74.00391 ], 8 ); // New York

  var setMapCoords = function(coords, zoom) {
    zoom = zoom || 15;
    if( !coords ){
      console.log( 'using default geolocation' );
      coords = [ 51.505, -0.124 ]; // London
    }
    $rootScope.geobase = coords;
    
    $rootScope.$emit( 'geobase', $rootScope.geobase, zoom );
    $rootScope.$emit( 'map.setView', [ Number( $rootScope.geobase[0] ).toFixed(7), Number( $rootScope.geobase[1] ).toFixed(7) ], zoom ); 
  }
  // console.log("cookie" + $cookies.loc)
  map.whenReady(function(){
    var loc = $location.search().loc;
    if (loc) {
      console.log("loc triggree"+loc)
      var locArr = loc.split(",");
      // var cokLoc = $cookies.loc;
      // setMapCoords( [ locArr[0], locArr[1] ], locArr[2] );
      console.log(locArr)
      // console.log(map.getCenter())
      console.log("----------")
      // if (cokLoc != loc) {
        map.setView( [ locArr[0], locArr[1] ], locArr[2] );
        // $cookies.loc = loc  
      // }
    } else {
      console.log("no loc");
      navigator.geolocation.getCurrentPosition( function( pos ){
        if( pos && pos.coords ){
          console.log(pos)
          setMapCoords( [ pos.coords.latitude, pos.coords.longitude ], 12 );
        }
      }, function(){
        console.log( 'geolocation error', arguments );
        setMapCoords();
      });
    }
  });
  
  map.on('moveend', function () {
    var pos = map.getCenter();
    console.log("mapend triggered")
    $location.search({"loc": Number( pos.lat ).toFixed(7) + ',' + Number( pos.lng ).toFixed(7) + ',' + map.getZoom()});
    // setMapCoords([pos.lat, pos.lng], map._zoom);
    $rootScope.$emit( 'geobase', [ pos.lat, pos.lng ], map.getZoom() );
  });

  $rootScope.$on( 'map.setView', function( ev, geo, zoom ){
    map.setView( geo, zoom || 8 );
  });

  // $rootScope.$on( 'geobase', function( ev, geobase, zoom ){
  //   console.log(geobase);
  //   // $rootScope.$emit( 'map.setView', geobase, zoom ); 
  //   // console.log( Number( geobase[0] ).toFixed(7) + ',' + Number( geobase[1] ).toFixed(7) + ',' + zoom);
  //   // $location.search({"loc": Number( geobase[0] ).toFixed(7) + ',' + Number( geobase[1] ).toFixed(7) + ',' + zoom});
  //   $rootScope.$emit( 'geobasechanged', geobase, zoom );
  // });

});
