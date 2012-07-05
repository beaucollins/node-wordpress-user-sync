var wordpress = require('wordpress'),
  crypto = require('crypto'),
  url = require('url'),
  queue = require('./queue');

module.exports = {
  run : function( options, stream, callback ){
    var client = new UserSync( options );
    client.run( stream, callback );
    return client;
  }
}

/*

UserSync

Manages the syncing of users between a URL of JSON defining users and
a WordPress installation with the added RPC method calls that enable
user management.

Arguments:
  settings : a hash containing these options
  - wordpress_api_url : (required) the XML-RPC endpoint for the WordPress site
  - username : (required) WordPress account username
  - password : (required) WordPress account password
  - send_email: (optional) Defaults to `true` will deliver email to newly created users
  
  callback: method to call when sync is complete

*/
var UserSync = module.exports.UserSync = function( settings ){
  
  var settings = settings || {}, client;
  
  settings.send_email = settings.send_email || true;
  
  
  if ( settings.client ){
    client = settings.client
  } else {
    
    if( !settings.wordpress_api_url ){ throw( "UserSync requires the wordpress_api_url setting" ); }
    
    client = module.exports =  wp = wordpress.createClient({
      url: settings.wordpress_api_url,
      username: settings.username,
      password: settings.password
    });
  }
  
  // extend it with user management methods
  require( './wordpress-user-methods' )( client );
  
  var operateOnUsers = function( jq_users, wp_users, callback ){
    console.log("jQuery Users: ", wp_users.length);
    // compare users, loop through canonical users
    var users = { edit:[], create:[], destroy:[] };
    
    
    users.create = jq_users.filter( function( user, index ){
      var wp_user;
      for (var i=0; i < wp_users.length; i++) {
          
        // assign the user to a local value
        wp_user = wp_users[i];
        if (wp_user.email.toLowerCase() == user.email.toLowerCase()) {
            
          // remove the user from WordPress array
          wp_users.splice(i, 1);
          users.edit.push( [wp_user, user] );
          
          return false;
        };
      };
      return true;
        
    } );
    
    users.destroy = wp_users;
    
    var editQueue = new queue.Queue( users.edit, function( pair, next ){
          var wp_user = pair[0], user = pair[1];
          // call editUser remote method
          client.editUser( wp_user.user_id, {
            'email'        : user.email,
            'first_name'   : user.first_name,
            'last_name'    : user.last_name,
            'website'      : user.url,
            'display_name' : user.display_name,
            'bio'          : user.bio,
            'user_contacts': user.contacts
          }, settings.send_email, function(e, response){
            if (e) {
              next(e);
              return;
            }
            if (response === true) {
              // user was edited
              console.log("Success updating", user.email);
            } else {
              console.log("Failed updating", user.email);
            }
            next();
          } );
        } ),
        destroyQueue = new queue.Queue( users.destroy, function( wp_user, next ){
          client.deleteUser(wp_user.user_id, function(e, response){
            next(e);
            if (!e) {
              if(response){
                console.log("Deleted user", user.email);
              } else {
                console.log("Could not delete user", user.email);
              }
            } else {
              console.log("Error deleting user", user.email);
              console.log(e);
            }
          });
        } ),
        createQueue = new queue.Queue( users.create, function( jq_user, next ){
          
          var hash = crypto.createHash('md5'),
              password,
              seed = new String(Math.random());
        
          hash.update(seed.toString());
          password = hash.digest('hex');
          jq_user.password = password.slice(0,16);
        
          client.newUser(jq_user, settings.send_email, function(e, response){
            next(e);
          });
          
        } );
        
    editQueue.run( function( e, items ){
      createQueue.run( function( e, items ){
        // destroyQueue.run( function( e, items ){
          callback( e, users );
        // } );
      } )
    } );
      
    
  }
  
  this.run = function( stream, callback ){
    
    var json = "";
      
    stream.on( 'data', function( data ){
      json += data;
    } );
    
    stream.on( 'end', function(){
      
      // the canonical list if users for jQuery sites
      var users = JSON.parse( json );
    
      client.getUsers( function( error, wp_users ){
        if (error) {
          throw(error.toString());
        };
        
        operateOnUsers( users, wp_users, callback );
        
        
      } );
      
    } );
    
    stream.resume();
    
  }
}

