
app.controller( 'ResultsIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager ) {

  $rootScope.$on( 'peliasLayerUpdate', function( ev, layerData ){
    $scope.layers = layerData;
  });

  $rootScope.$emit( 'peliasLayerUpdateNow' );

  $scope.toggle = function( layerName ){
    PeliasGeoJsonLayerManager.toggle( layerName );
  }

});
