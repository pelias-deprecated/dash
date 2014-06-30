// POST /pelias/_suggest?pretty
// {
//     "pelias" : {
//         "text" : "n",
//         "completion" : {
//             "field" : "suggest",
//             "fuzzy" : {
//                 "fuzziness" : 2
//             }
//         }
//     }
// }

app.controller( 'HeaderIndexController', function( $rootScope, $scope, $http ) {

  $scope.search = '';
  $scope.results = [];
  $scope.currentText = '';

  $scope.selectResult = function( result ){
    $scope.results = [];
    $scope.currentText = result.text;
    $scope.search = result.text;
    $rootScope.$emit( 'map.setView', result.payload.geo.split(',').reverse(), 13 );
  }

  $scope.$watch( 'search', function( input ){

    if( input === $scope.currentText ) return;
    if( !input.length ){
      $scope.results = [];
      return;
    }

    $http({
      url: '/suggest',
      method: 'GET',
      params: {
        input: input
      },
      headers: {'Accept': 'application/json'}
    }).success(function (data, status, headers, config) {
      if( data ){
        $scope.results = data.map( function( res ){
          var sections = [
            res.payload.name,
            res.payload.admin2 || res.payload.admin1,
            res.payload.admin0,
          ];
          var uniq = sections.filter(function(a){ return a; }).reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
          }).reverse();
          res.text = uniq.join(', ');

          // highlights
          var r = RegExp( '('+ input + ')', 'gi' );
          res.htmltext = res.text.replace( r, '<strong>$1</strong>' );

          if( res.payload.type === 'geoname' ){
            res.icon = 'tag';
          } else if( res.payload.type === 'osm' ){
            res.icon = 'globe';
          } else {
            res.icon = 'map-marker';
          }

          return res;
        });
        console.log( $scope.results );
      }
      else {
        $scope.results = [];
      }
    }).error(function (data, status, headers, config) {
      $scope.results = [];
    });

  });

  console.log( 'HeaderIndexController' );

});