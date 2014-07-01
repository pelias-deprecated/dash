
var request = require('request');

module.exports = function( req, res, next ){

  var reqDate = new Date().getTime();

  // Generate a request to the ES backend service
  var payload = {
    url: 'http://localhost:9200/pelias/_suggest',
    method: 'GET',
    json: buildSuggestCommand( req )
  }

  // Proxy request to ES backend & map response to a valid FeatureCollection
  request( payload, function( err, resp, data ){

    if( err ){ return next( err ); }
    if( data && data.pelias && data.pelias.length ){

      res.header('Content-type','application/json');
      res.header('Charset','utf8');

      var obj = {
        date: reqDate,
        body: data['pelias'][0].options
      };

      // jsonp
      if( req.query.callback ){
        return res.send( req.query.callback + '('+ JSON.stringify( obj ) + ');');
      }

      // regular json
      return res.json( obj );

    }

    else {
      console.error( JSON.stringify( data, null , 2 ) );
      return next( 'an error occurred' );
    }
  });

}

// Build elasticsearch query object
function buildSuggestCommand( req )
{
  return {
    'pelias' : {
      'text' : req.query.input,
      'completion' : {
        'size' : 10,
        'field' : 'suggest',
        'fuzzy' : {
          'fuzziness' : 0
        }
      }
    }
  }
}