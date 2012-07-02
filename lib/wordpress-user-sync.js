var wordpress = require('wordpress'),
	http = require('http'),
	crypto = require('crypto'),
	url = require('url');

// extend it with user management methods
require( 'wordpress/lib/wordpress-user-management' )( wordpress.Client );

module.exports = {
	run : function( options, callback ){
		var client = new UserSync( options );
		client.run( callback );
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
	- jquery_users_json_url : (required) URL with the array of users to sync
	- username : (required) WordPress account username
	- password : (required) WordPress account password
	- send_email: (optional) Defaults to `true` will deliver email to newly created users
	
	callback: method to call when sync is complete

*/
var UserSync = module.exports.UserSync = function( settings ){
	
	var settings = settings || {};
	
	settings.send_email = settings.send_email || true;
	
	if ( !settings.jquery_users_json_url )
		throw( "UserSync requires the jquery_users_json_url setting" );
	
	if( !settings.wordpress_api_url )
		throw( "UserSync require the wordpress_api_url setting" );
	
	var client = module.exports =	 wp = wordpress.createClient({
		url: settings.wordpress_api_url,
		username: settings.username,
		password: settings.password
	});
	
	this.run = function(){
		
		http.get( url.parse( settings.jquery_users_json_url ), function( res ){
		
			res.once( 'data', function( data ){
		
				// the canonical list if users for jQuery sites
				var users = JSON.parse( data );
		
				client.getUsers( function( error, wp_users ){
					if (error) {
						throw(error.toString());
					};
					console.log("Existing", wp_users.length);
					// compare users, loop through canonical users
					var create = users.filter( function( user, index ){
						var wp_user;
						for (var i=0; i < wp_users.length; i++) {
					
							// assign the user to a local value
							wp_user = wp_users[i];
							if (wp_user.email.toLowerCase() == user.email.toLowerCase()) {
						
								// remove the user from WordPress array
								wp_users.splice(i, 1);
						
								// call editUser remote method
								client.editUser( wp_user.user_id, {
									'email'				 : user.email,
									'first_name'	 : user.first_name,
									'last_name'		 : user.last_name,
									'website'			 : user.url,
									'display_name' : user.display_name,
									'bio'					 : user.bio,
									'user_contacts': user.contacts
								}, settings.send_email, function(e, response){
									if (e) {
										console.log("Error updateing!", e, user.email);
									}
									if (response === true) {
										// user was edited
										console.log("Success updating", user.email);
									} else {
										console.log("Failed updating", user.email);
									}
								} );
						
								return false;
							};
						};
						return true;
				
					} );
			
					console.log("Users to create", create.length);
			
					create.forEach(function(user){
						var hash = crypto.createHash('md5'),
								password,
								seed = new String(Math.random());
				
						hash.update(seed.toString());
						password = hash.digest('hex');
						user.password = password.slice(0,16);
				
						client.newUser(user, settings.send_email, function(e, response){
							if (!e) {
								console.log(user.email, response);
							};
						});
					});
			
			
					/*
					The Following will delete all users from the WordPress site that do not exist
					in the JSON file
					*/
					// console.log("Users to delete", wp_users.length);
					// wp_users.forEach(function(user){
					// 	client.deleteUser(user.user_id, function(e, response){
					// 		if (!e) {
					// 			if(response){
					// 				console.log("Deleted user", user.email);
					// 			} else {
					// 				console.log("Could not delete user", user.email);
					// 			}
					// 		} else {
					// 			console.log("Error deleting user", user.email);
					// 			console.log(e);
					// 		}
					// 	});
					// });
			
				} );
		
			} );
	
		} );
	}
}

