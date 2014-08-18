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
            geometry: row._source.boundaries
          };

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

  return {
    query: { "match_all": {} },
    filter : {
      and: [{
          'geo_shape' : {
            'boundaries' : {
              'shape': {
                'type': 'envelope',
                'coordinates': [
                  [ bbox[0], bbox[3] ],
                  [ bbox[2], bbox[1] ]
                ]
              }
            },
            '_cache' : true
          }
      }]
    },
    size: 1000
  }
}