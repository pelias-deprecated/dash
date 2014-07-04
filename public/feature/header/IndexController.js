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

  var databaseurl = 'http://localhost:9200/pelias/';

  $rootScope.$on( 'geobase', function( ev, geobase ){
    $scope.$apply( function(){
      $scope.geobase = Number( geobase[1] ).toFixed(7) + ', ' + Number( geobase[0] ).toFixed(7);
    })
  });

  // simple highlights
  // var highlight = function( text, focus ){
  //   var r = RegExp( '('+ focus + ')', 'gi' );
  //   return text.replace( r, '<strong>$1</strong>' );
  // }

  // advanced highlights
  // @todo: highlight per word instead of per phrase
  // @try: splitting stop words then ordering my smallest
  // stop word to largest; then replacing with html
  // @note: some will be double wrapped but that's probably ok
  var highlight = function( text, focus ){
    var r = RegExp( '('+ focus + ')', 'gi' );
    return text.replace( r, '<strong>$1</strong>' );
  }

  var icon = function( type ){
    if( type === 'geoname' ){
      return 'tag';
    } else if( type.match('osm') ){
      return 'globe';
    }
    return 'map-marker';
  }

  $scope.datasets = {
    '*':'all datasets',
    'geoname': 'geonames',
    'osmnode': 'openstreetmap'
  }

  $scope.selectDataset = function( datasetid ){
    $scope.dataset = $scope.datasets[ datasetid ];
    $scope.queryDatasets = ( datasetid !== '*' )
      ? [ datasetid ]
      : Object.keys( $scope.datasets ).filter( function( set ){
        if( set == '*' ) return false;
        return true;
    });
    $scope.suggest();
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

  $rootScope.$on( 'hidesuggest', function( ev ){
    $scope.results = [];
  });


  // --------- suggestions ---------

  $scope.suggest = function(){
    $http({
      url: '/suggest',
      method: 'GET',
      params: {
        input: $scope.search,
        datasets: $scope.queryDatasets.join(','),
        geobias: ( $rootScope.geobase || [] ).join(','),
        size: 15
      },
      headers: { 'Accept': 'application/json' }
    }).success(function (data, status, headers, config) {
      if( data ){

        // prevent showing suggestions when input is blank
        if( !$scope.search.length ) return;

        // prevent older results loading over newer ones
        if( data.date < $scope.lastSuggest ) return;
        $scope.lastSuggest = data.date;

        $scope.results.length = 0;
        $scope.results = data.body.map( function( res ){
          var sections = [
            res.text
              .replace(res.payload.admin2+' ','')
              .replace(res.payload.admin1+' ','')
              .replace(res.payload.admin0+' ',''),
            res.payload.admin2 || res.payload.admin1,
            res.payload.admin0,
          ];
          var uniq = sections.filter(function(a){ return a; }).reverse().filter(function (e, i, arr) {
            return arr.indexOf(e, i+1) === -1;
          }).reverse();
          res.text = uniq.join(', ');
          res.htmltext = highlight( res.text, $scope.search );
          res.icon = icon( res.payload.type );

          // refurl
          res.refurl = databaseurl + res.payload.type + '/' + res.payload.id;

          // distance 
          var p1 = new LatLon( $rootScope.geobase[0], $rootScope.geobase[1] );
          var p2 = new LatLon( res.payload.geo.split(',')[1], res.payload.geo.split(',')[0] );
          res.distance = Number( p1.distanceTo(p2) );
          res.distance = res.distance.toFixed( res.distance < 1 ? 2 : 0 );

          return res;
        });
      }
      else {
        $scope.results = [];
      }
      console.log( 'suggest data', data );
      console.log( '$scope.results', $scope.results );
    }).error(function (data, status, headers, config) {
      $scope.results = [];
    });
  }

  $scope.$watch( 'search', function( input ){

    $rootScope.$emit( 'hidesuggest' );

    // skip
    if( !input || input === $scope.currentText ){
      return;
    }

    $scope.suggest();

  });


  // --------- search ---------

  $scope.$watch( 'searchdisabled', function( input ){

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
        if( data.date < $scope.lastSearch ) return;
        $scope.lastSearch = data.date;

        $rootScope.$emit( 'results', data.body || [] );
        console.log( 'search results', data );
      }
    }).error(function (data, status, headers, config) {
      $rootScope.$emit( 'results', [] );
    });

  });

  $scope.selectDataset('*');

});