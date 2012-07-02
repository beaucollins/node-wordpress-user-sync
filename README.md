jQuery WordPress user sync
==========================

Command line tool for syncing a JSON file of users with the user accounts on a WordPress install.

Requirements
------------

WordPress must be running the XML-RPC Modernization plugin:
  http://wordpress.org/extend/plugins/xml-rpc-modernization/
  
Or: http://core.trac.wordpress.org/ticket/18428

Installation
-----------------

    npm install git://github.com/beaucollins/node-jquery-user-sync.git -g

Usage
-----------------

Step 1) Create a JSON file with user account data and put it somewhere 
publicly. See [users.json][] for an example.

Step 2) Run the jquery-user-sync command providing the necessary arguments:

    jquery-user-sync http://example.com/users.json --endpoint=http://site.wordpress.com/ \
      --username=admin --password=123456
    
Or you can pipe the users in too:

    curl http://example.com/users.json | jquery-user-sync --endpoint=http://site.wordpress.com/ \
      --username=admin --password=123456

Step 3) That's it

[users.json]: https://github.com/beaucollins/node-jquery-user-sync/blob/master/examples/users.json "Example JSON file for user accounts"

Using from within node
-------------------------------------

If you don't want to use the command line, you can also run from within node.

Update your <code>package.json</code>:
  
    ...
    "dependencies": {
        "wordpress-user-sync": "git://github.com/beaucollins/node-jquery-user-sync.git"
    },
    ...

Then require and run, provide the WP settings, a stream of JSON of users and a success callback:

    var http = require('http'),
      url = require('url'),
      sync = require('wordpress-user-sync'),
      settings = {
      wordpress_api_url: 'http://blog.com/',
      username: 'admin',
      password: 'password'
    }
    
    http.get( url.parse('http://example.com/users.json'), function(res){
      sync.run( settings, res, function( error, users ){
        if(error){
          console.log(error);
        } else {
          console.log("All done");
        }
      } );
    } );
    
    