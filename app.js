
var path = require('path'),
    express = require('express')

// Express
app = express();
app.set( 'env', 'development' );
app.set( 'port', process.env.PORT || 3000 );
app.set( 'baseDir', path.resolve( __dirname ) );

// Static route should come before authentication
app.use( '/', express.static( app.get( 'baseDir' ) + '/public' ) );

// Authentication
// app.use( express.logger() );
app.use( express.cookieParser() );
app.use( express.bodyParser() );
app.use( express.methodOverride() );
app.use( express.session({ secret: 'wjfjekfjkbfwbekf' }));
app.configure(function(){
  app.use(function(req, res, next){
    // res.locals.config = {};
    next();
  });
});

// Templating
app.set( 'views', app.get( 'baseDir' ) + '/public' ); 
app.set( 'view engine', 'jade' );
app.set( 'view options', { layout: false } );

// Routes
app.get( '/', function( req, res ){ res.render( 'index' ); });

// Shape Search
var shapeSearchController = require('./controller/shapeSearchController');
app.get( '/shapes/:type/:z/:y/:x', shapeSearchController );

// Point Search
var pointSearchController = require('./controller/pointSearchController');
app.get( '/points/:type/:z/:y/:x', pointSearchController );

// We're up & running!
app.listen( app.get( 'port' ) );
console.log( "Server running in env %s on port %d", app.get( 'env' ), app.get( 'port' ) );