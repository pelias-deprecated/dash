
var request = require('request');

module.exports = function( req, res, next ){

  res.header('Content-type','application/json');
  res.header('Charset','utf8');

  var obj = {
    date: new Date().getTime(),
    data: []
  };

  // Generate a request to the ES backend service
  var payload = {
    url: 'http://localhost:9200/pelias/_search',
    method: 'GET',
    json: buildSuggestCommand( req )
  }

  var sendReply = function(){
    // jsonp
    if( req.query.callback ){
      return res.send( req.query.callback + '('+ JSON.stringify( obj ) + ');');
    }

    // regular json
    return res.json( obj );
  }

  // Proxy request to ES backend & map response to a valid FeatureCollection
  request( payload, function( err, resp, data ){

    // console.log( 'resp', data );

    if( err ){ return next( err ); }
    if( data && data.hits && data.hits.total ){

      obj.body = data.hits.hits.map( function( hit ){
        return hit._source;
      });

      return sendReply();
    }

    else {
      console.error( 'hits error', JSON.stringify( data, null , 2 ) );
      return sendReply();
    }
  });

}

// Build elasticsearch query object
function buildSuggestCommand( req )
{
  return {
    "query": {
      "query_string": {
        "query": req.query.input,
        "fields": ['suggest'],
        "default_operator": 'OR'
      }
    }
  }
}