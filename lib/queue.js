var Queue = function( items ){  
  var queue = items.slice();
  
  this.run = function( callback ){
    
    // shift an item off
    var item = queue.shift();
    
    try {
      this.operate( item )      
    } catch(e) {
      // fire the callback with the error and stop operating
    }
    // operate on the item
    // do it again
    
  }
}

module.exports = {
  createQueue: function( items, operation, callback ){
    var queue = new Queue( items );
    queue.operation = operation;
  },
  Queue: Queue
}