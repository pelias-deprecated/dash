var esclient = require('pelias-esclient')(),
    responder = require('./responder'),
    SphericalMercator = require('sphericalmercator'),
    mercator = new SphericalMercator();

module.exports = function( req, res, next ){

  // Proxy request to ES backend & map response to a valid FeatureCollection
  esclient.search({
    index: 'pelias',
    type: req.params.type,
    body: buildSearchCommand( req )
  }, function( err, data ){

    if( err ){ return responder.error( req, res, next, err ); }
    if( data && data.hits ){

      // console.log( 'hits length', data.hits.hits.length );

      // response object
      var obj = {
        type: 'FeatureCollection',
        features: data.hits.hits.map( function( row ){

          var props = {};
          if( 'object' === typeof row._source.suggest ){
            props = row._source.suggest.payload;
          }
          props.name = row._source.name;

          return {
            type: 'Feature',
            id: row._id,
            properties: props,
            geometry: {
              type: 'Point',
              coordinates: [
                row._source.center_point.lon,
                row._source.center_point.lat
              ]
            }
          }

        })
      };

      return responder.cors( req, res, obj );
    }

    else {
      console.error( data );
      return next( 'an error occurred' );
    }
  });

}

// Generate bbox from tile coords
function generateBbox( req )
{
  return mercator.bbox(
    Number( req.params.x ),
    Number( req.params.y ),
    Number( req.params.z )
  );
}

// Build elasticsearch query object
function buildSearchCommand( req )
{
  var bbox = generateBbox( req );
  // [ w lon, s lat, e lon, n lat ]

  // console.log( 'bbox', bbox );

  return {
    'query': {
      'filtered': {
        'query': {
          'match_all': {}
        },
        'filter' : {
          'geo_bounding_box': {
            'center_point': {
              'top_left': {
                'lat': bbox[3],
                'lon': bbox[0]
              },
              'bottom_right': {
                'lat': bbox[1],
                'lon': bbox[2]
              }
            },
            '_cache' : true
          }
        }
      }
    },
    'size': 1000
  }
}