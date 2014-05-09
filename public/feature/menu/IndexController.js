
app.controller( 'MenuIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager ) {

  $rootScope.$on( 'peliasLayerUpdate', function( ev, layerData ){
    $scope.layers = layerData;
  });

  $scope.toggle = function( layerName ){
    PeliasGeoJsonLayerManager.toggle( layerName );
  }

});
