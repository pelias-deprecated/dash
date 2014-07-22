
var esclient = require('pelias-esclient')();
var responder = require('./responder');

module.exports = function( req, res, next ){

  var obj = {
    date: new Date().getTime(),
    body: []
  };

  // Proxy request to ES backend & map response to a valid FeatureCollection
  esclient.suggest({
    index: 'pelias',
    body: buildSuggestCommand( req )
  }, function( err, data ){

    //console.log( JSON.stringify( data, null , 2 ) );

    if( err ){ return responder.error( req, res, next, err ); }
    if( data && data.pelias && data.pelias.length ){

      obj.body = data['pelias'][0].options;

      return responder.cors( req, res, obj );
    }

    else {
      // console.error( 'hits error', JSON.stringify( data, null , 2 ) );
      return responder.cors( req, res, obj );
    }
  });

}

// Build elasticsearch query object
function buildSuggestCommand( req )
{
  var cmd = {
    'pelias' : {
      'text' : req.query.input,
      'completion' : {
        'size' : req.query.size ? Math.min( req.query.size, 40 ) : 10,
        'field' : 'suggest',
        'context': {
          'dataset': req.query.datasets ? req.query.datasets.split(',') : 'geoname',
          'location': {
            'value': req.query.geobias.split(',').reverse().map( function( ll ){
              return Number( ll );
            }),
            'precision': "1500km"
          }
        }
      }
    }
  }
  // console.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;
}