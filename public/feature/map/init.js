
app.config( function( $routeProvider ) {
  $routeProvider
    .when( '/map', {
      controller: 'MapIndexController',
      templateUrl: '/feature/map/index.html'
    })
});

app.factory( 'PeliasGeoJsonLayer', function() {

  return function( geoJsonURL, options ){

    var options = options || {};

    var style = {
      'clickable': true,
      'color': options.color || '#00D',
      'fillColor': options.color || '#00D',
      'weight': 1.0,
      'opacity': 0.3,
      'fillOpacity': 0.2
    }

    var hoverStyle = {
      'fillOpacity': 0.5
    }

    var layerOptions = {
      clipTiles: true,
      unique: function (feature) {
        return feature.id;
      }
    }

    var geoJsonTileLayer = new L.TileLayer.GeoJSON( geoJsonURL, layerOptions, {

      style: style,
      onEachFeature: function (feature, layer) {

        if( feature.properties ){

          var popupString = '<div class="popup">';

          if( feature.properties.name ) {
            popupString += '<h3>' + feature.properties.name.default + '</h3>';
          }

          if( feature.properties.id ) {
            var id = feature.properties.id;
            var url = 'http://localhost:9200/pelias/' + id;
            popupString += '<a href="' + url + '" target="es">' + id + '<a />';
          }

          popupString += '<table class="table">';

          for( var k in feature.properties ) {
            if( k == 'name' ) continue;
            var v = feature.properties[k];
            popupString += '<tr><th>' + k + '</th><td>' + v + '</td></tr>';
          }

          popupString += '</table>';
          popupString += '</div>';
          layer.bindPopup( popupString );
        }

        if( !(layer instanceof L.Point) ){

          layer.on( 'mouseover', function() {
            layer.setStyle( hoverStyle );
          });

          layer.on( 'mouseout', function() {
            layer.setStyle( style );
          });
        }

      }
    });

    return geoJsonTileLayer;

  }
});


app.service( 'PeliasGeoJsonLayerManager', function( $rootScope, PeliasGeoJsonLayer ) {

  var map,
      layers = {},
      enabled = {};

  $rootScope.$on( 'peliasLayerUpdateNow', function( ev ){
    $rootScope.$emit( 'peliasLayerUpdate', enabled );
  });

  var bind = function( leafletMap ){
    map = leafletMap;
    return this;
  }

  var register = function( layerName, layerUrl, options ){
    layers[ layerName ] = PeliasGeoJsonLayer( layerUrl, options || {} );
    enabled[ layerName ] = null;
    return this;
  }

  var deregister = function( layerName ){
    delete layers[ layerName ];
    delete enabled[ layerName ];
    return this;
  }

  var enable = function( layerName ){
    map.addLayer( layers[ layerName ] );
    enabled[ layerName ] = true;
    $rootScope.$emit( 'peliasLayerUpdate', enabled );
    return this;
  }

  var disable = function( layerName ){
    map.removeLayer( layers[ layerName ] );
    enabled[ layerName ] = false;
    $rootScope.$emit( 'peliasLayerUpdate', enabled );
    return this;
  }

  var toggle = function( layerName ){
    if( enabled[ layerName ] ){
      disable( layerName );
    } else {
      enable( layerName );
    }
  }

  var layers = function(){
    return enabled;
  }

  return {
    bind: bind,
    register: register,
    deregister: deregister,
    enable: enable,
    disable: disable,
    toggle: toggle,
    layers: layers
  }

});
