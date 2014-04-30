var request = require('request'),
    SphericalMercator = require('sphericalmercator'),
    mercator = new SphericalMercator();

module.exports = function( req, res, next ){

  // Generate a request to the ES backend service
  var payload = {
    url: 'http://localhost:9200/pelias/' + req.params.type + '/_search',
    method: 'POST',
    json: buildSearchCommand( req )
  }

  // Proxy request to ES backend & map response to a valid FeatureCollection
  request( payload, function( err, resp, data ){

    if( err ){ return next( err ); }
    if( data && data.hits ){

      return res.json({
        type: 'FeatureCollection',
        features: data.hits.hits.map( function( row ){
          return {
            type: 'Feature',
            id: row._source.gn_id,
            properties: {
              name: row._source.suggest
            },
            geometry: row._source.boundaries
          }

        })
      });

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