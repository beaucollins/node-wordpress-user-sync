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

    jquery-user-sync JSON_URL --endpoint=http://site.wordpress.com/ --username=admin --password=123456

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

Then require and run:

    var sync = require('wordpress-user-sync');
  
    sync.run({
      wordpress_api_url: 'http://blog.com/',
      jquery_users_json_url: 'http://example.com/somejson.json',
      username: 'admin',
      password: 'password'
    });
    
TODO:
-----

Add a way to provide a callback for when the syncing is done.