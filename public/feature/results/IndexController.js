
app.controller( 'ResultsIndexController', function( $rootScope, $scope, PeliasGeoJsonLayerManager ) {

  $scope.results = [];

  $scope.selectResult = function( result ){
    $rootScope.$emit( 'map.setView', [ result.center_point.lat, result.center_point.lon ], 14 );
    $rootScope.$emit( 'hidesuggest' );
  }

  $rootScope.$on( 'results', function( ev, results ){

    console.log( 'got results here!', results );
    $scope.results = results.map( function( result ){

      result.displayname = ( 'string' == typeof result.name ) ? result.name : result.name.default;
      result.displayaddress = [ result.admin2, result.admin1, result.admin0 ].filter( function( x ){
        return x;
      }).join(', ');

      return result;
    });
  });

});
