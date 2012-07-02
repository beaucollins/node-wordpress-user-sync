var Queue = function( items, operator ){  
  var queue = items.slice();
  this.operator = operator;
  
  this.run = function( operator, callback ){
    
    if ( !callback ) {
      callback = operator;
      operator = this.operator;
    }
    
    if (typeof(operator) != 'function') {
      throw( "operator must be a function" );
    }
    
    if (typeof(callback) != 'function') {
      throw( "callback must be a function" );
    }
    
    if ( queue.length == 0 ) {
      callback( null, items );
      return;
    };
    
    // shift an item off
    var item = queue.shift(), next, self = this;
    
    if ( queue.length == 0 ) {
      // queue is done, so we're going
      next = function( e ){
        callback( e, items );
      };
    } else {
      next = function(){
        self.run( operator, callback );
      }
    }
    
    try{
      operator( item, next );      
    } catch( e ){
      callback( e );
    }
        
  }
  
}

module.exports = {
  createQueue: function( items, operation, callback ){
    var queue = new Queue( items );
    queue.operation = operation;
    queue.run(operation, callback)
  },
  Queue: Queue
}