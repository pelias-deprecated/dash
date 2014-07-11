var esclient = require('pelias-esclient')(),
    SphericalMercator = require('sphericalmercator'),
    mercator = new SphericalMercator();

module.exports = function( req, res, next ){

  // Proxy request to ES backend & map response to a valid FeatureCollection
  esclient.search({
    index: 'pelias',
    type: req.params.type,
    body: buildSearchCommand( req )
  }, function( err, data ){

    if( err ){ return next( err ); }
    if( data && data.hits ){

      res.header('Content-type','application/json');
      res.header('Charset','utf8');

      // response object
      var obj = {
        type: 'FeatureCollection',
        features: data.hits.hits.map( function( row ){
          return {
            type: 'Feature',
            id: row._id,
            properties: row._source.name,
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

      // jsonp
      if( req.query.callback ){
        return res.send( req.query.callback + '('+ JSON.stringify( obj ) + ');');
      }

      // regular json
      return res.json( obj );

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
      'geo_bounding_box': {
        'center_point': {
          'top_left': [ bbox[0], bbox[3] ],
          'bottom_right': [ bbox[2], bbox[1] ]
        },
        '_cache' : true
      }
    },
    size: 1000
  }
}