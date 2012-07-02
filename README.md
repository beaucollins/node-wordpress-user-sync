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

npm install git://github.com/beaucollins/node-jquery-user-sync.git

Usage
-----------------

Step 1) Create a JSON file with user account data and put it somewhere 
publicly. See [users.json][] for an example.

Step 2) Run the jquery-user-sync command providing the necessary arguments:

    > jquery-user-sync JSON_URL --endpoint=http://site.wordpress.com/ --username=admin --password=123456

Step 3) That's it

[users.json]: http://github.com/beaucollins/node-jquery-user-sync/master/examples/users.json