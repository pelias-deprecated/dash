
var esclient = require('pelias-esclient')();
var responder = require('./responder');

module.exports = function( req, res, next ){

  var obj = {
    date: new Date().getTime(),
    data: []
  };

  // Proxy request to ES backend & map response to a valid FeatureCollection
  esclient.search({
    index: 'pelias',
    body: buildSearchCommand( req )
  }, function( err, data ){

    if( err ){ return responder.error( req, res, next, err ); }
    if( data && data.hits && data.hits.total ){

      obj.body = data.hits.hits.map( function( hit ){
        return hit._source;
      });

      return responder.cors( req, res, obj );
    }

    else {
      // console.error( 'hits error', JSON.stringify( data, null , 2 ) );
      return responder.cors( req, res, obj );
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
        "fields": ['name.default'],
        "default_operator": 'OR'
      }
    },
    "size": 30
  }
}