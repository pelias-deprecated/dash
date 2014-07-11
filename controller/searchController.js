
var esclient = require('pelias-esclient')();

module.exports = function( req, res, next ){

  res.header('Content-type','application/json');
  res.header('Charset','utf8');

  var obj = {
    date: new Date().getTime(),
    data: []
  };

  var sendReply = function(){
    // jsonp
    if( req.query.callback ){
      return res.send( req.query.callback + '('+ JSON.stringify( obj ) + ');');
    }

    // regular json
    return res.json( obj );
  }

  // Proxy request to ES backend & map response to a valid FeatureCollection
  esclient.search({
    index: 'pelias',
    body: buildSearchCommand( req )
  }, function( err, data ){

    if( err ){ return next( err ); }
    if( data && data.hits && data.hits.total ){

      obj.body = data.hits.hits.map( function( hit ){
        return hit._source;
      });

      return sendReply();
    }

    else {
      // console.error( 'hits error', JSON.stringify( data, null , 2 ) );
      return sendReply();
    }
  });

}

// Build elasticsearch query object
function buildSearchCommand( req )
{
  return {
    "query": {
      "query_string": {
        "query": req.query.input,
        "fields": ['suggest'],
        "default_operator": 'OR'
      }
    },
    "size": 30
  }
}