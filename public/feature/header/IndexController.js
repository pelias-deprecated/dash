// POST /pelias/_suggest?pretty
// {
//     "locality-suggest" : {
//         "text" : "n",
//         "completion" : {
//             "field" : "suggest",
//             "fuzzy" : {
//                 "fuzziness" : 2
//             }
//         }
//     }
// }


app.controller( 'HeaderIndexController', function( $scope, $http ) {

  $scope.search = '';
  $scope.results = [];

  $scope.$watch( 'search', function( input ){

    $http({
      url: 'http://' + document.domain + ':9200/pelias/_suggest',
      method: 'POST',
      data: {
        'locality-suggest' : {
          'text' : input,
          'completion' : {
            'field' : 'suggest',
            'fuzzy' : {
              'fuzziness' : 2
            }
          }
        }
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function (data, status, headers, config) {
      if( data && data['locality-suggest'] && data['locality-suggest'].length ){
        $scope.results = data['locality-suggest'][0].options;
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