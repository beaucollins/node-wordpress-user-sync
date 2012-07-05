
module.exports = function( client ){
	
	[ 'getUsers', 'getUser', 'newUser', 'editUser', 'deleteUser' ].forEach( function( method ){
		client[method] = function(){
			var args = Array.prototype.slice.call( arguments );
			args.unshift( 'wp.' + method );
			this.authenticatedCall.apply( this, args );
		};
	} );
	
	return client;

};

