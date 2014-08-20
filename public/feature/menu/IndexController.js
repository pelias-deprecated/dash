
app.controller( 'MenuIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager ) {

  $rootScope.$on( 'peliasLayerUpdate', function( ev, layerData ){
    $scope.layers = layerData;
  });

  $rootScope.$emit( 'peliasLayerUpdateNow' );

  $scope.toggle = function( layerName ){
    PeliasGeoJsonLayerManager.toggle( layerName );
  }

  $scope.show_layer_menu = function() {
  	$("#layer_menu").slideToggle();
  }
});
