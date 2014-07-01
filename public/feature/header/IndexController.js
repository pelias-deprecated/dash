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

  // highlights
  var highlight = function( text, focus ){
    var r = RegExp( '('+ focus + ')', 'gi' );
    return text.replace( r, '<strong>$1</strong>' );
  }

  var icon = function( type ){
    if( type === 'geoname' ){
      return 'tag';
    } else if( type === 'osm' ){
      return 'globe';
    }
    return 'map-marker';
  }

  $scope.search = '';
  $scope.results = [];
  $scope.currentText = '';
  $scope.lastSuggest = 0;
  $scope.lastSearch = 0;

  $scope.selectResult = function( result ){
    $scope.currentText = result.text;
    $scope.search = result.text;
    $rootScope.$emit( 'map.setView', result.payload.geo.split(',').reverse(), 14 );
    $rootScope.$emit( 'hidesuggest' );
  }

  // clear search bar
  $scope.$watch( 'search', function( input ){
    if( !input.length ){
      $rootScope.$emit( 'hidesuggest' );
    }
  });

  $rootScope.$on( 'hidesuggest', function( ev ){
    $scope.results = [];
  });


  // --------- suggestions ---------

  $scope.$watch( 'search', function( input ){

    // skip
    if( !input || input === $scope.currentText ){
      return;
    }

    $http({
      url: '/suggest',
      method: 'GET',
      params: { input: input },
      headers: { 'Accept': 'application/json' }
    }).success(function (data, status, headers, config) {
      if( data ){

        // prevent older results loading over newer ones
        if( data.date < $scope.lastSuggest ) return;
        $scope.lastSuggest = data.date;

        $scope.results.length = 0;
        $scope.results = data.body.map( function( res ){
          var sections = [
            res.payload.name,
            res.payload.admin2 || res.payload.admin1,
            res.payload.admin0,
          ];
          var uniq = sections.filter(function(a){ return a; }).reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
          }).reverse();
          res.text = uniq.join(', ');
          res.htmltext = highlight( res.text, input );
          res.icon = icon( res.payload.type );

          return res;
        });
        console.log( 'suggest results', data );
      }
      else {
        $scope.results = [];
      }
    }).error(function (data, status, headers, config) {
      $scope.results = [];
    });

  });


  // --------- search ---------

  $scope.$watch( 'search', function( input ){

    // skip
    if( !input || input === $scope.currentText ){
      return;
    }

    $http({
      url: '/search',
      method: 'GET',
      params: { input: input },
      headers: { 'Accept': 'application/json' }
    }).success(function (data, status, headers, config) {
      if( data ){

        // prevent older results loading over newer ones
        if( data.date < $scope.lastSuggest ) return;
        $scope.lastSuggest = data.date;

        $rootScope.$emit( 'results', data.body || [] );
        console.log( 'search results', data );
      }
    }).error(function (data, status, headers, config) {
      $rootScope.$emit( 'results', [] );
    });

  });

});