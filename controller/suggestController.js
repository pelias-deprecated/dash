
var request = require('request');

module.exports = function( req, res, next ){

  res.header('Content-type','application/json');
  res.header('Charset','utf8');

  var obj = {
    date: new Date().getTime(),
    body: []
  };

  // Generate a request to the ES backend service
  var payload = {
    url: 'http://localhost:9200/pelias/_suggest',
    method: 'POST',
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

    console.log( JSON.stringify( data, null , 2 ) );

    if( err ){ return next( err ); }
    if( data && data.pelias && data.pelias.length ){

      obj.body = data['pelias'][0].options;

      return sendReply();
    }

    else {
      // console.error( 'hits error', JSON.stringify( data, null , 2 ) );
      return sendReply();
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
  console.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;
}