var hashValue = require('../lib/HashValue');
var format = require('util').format;

/**
 * Manages a hash ring.
 *
 * `nodes` is a list of object that have a toString representation.
 * `replicas` indicates how many virtual points should be used per node.
 *
 * @param nodes
 * @param replicas
 * @constructor
 */
module.exports = HashRing;
function HashRing(nodes, options){
  this.nodes = nodes || [];
  this.options = options || (options = {replicas:128, algorithm:"crc32"});
  this.replicas = options.replicas || 128;
  this.algorithm = options.algorithm || "crc32";
  this.ring = {};
  this.sorted_keys = [];

  //initialize
  for (var n = 0; n < this.nodes.length; n++){
    var node = this.nodes[n];
    for(var i = 0; i < this.replicas; i++){
      var nodeKey = format("%s:%d", node, i);
      var crckey = hashValue.hash(nodeKey, this.algorithm);
      this.ring[crckey] = node;
      this.sorted_keys.push(crckey);
    }
  }
  this.sorted_keys.sort(function(a,b){return a-b});
  return this;
}

var HashRingProto = HashRing.prototype;


/** Adds a `node` to the hash ring(including a number of replicas.) */
HashRingProto.addNode = function(node){
  var self = this;
  self.nodes.push(node);
  for(var i = 0; i < this.replicas; i++){
    var crc = hashValue.hash(format("%s:%d", node, i), this.algorithm);
    self.ring[crc] = node;
    self.sorted_keys.push(crc);
  }
  self.sorted_keys.sort();
};


/** Removes `node` from the hash ring and its replicas. */
HashRingProto.removeNode = function(node){
  var self = this;
  var idx = self.nodes.indexOf(node);
  self.nodes.splice(idx, 1); //remove
  for (var i = 0; i < self.replicas; i++){
    var crc = hashValue.hash(format("%s:%d", node, i), self.algorithm);
    idx = self.sorted_keys.indexOf(crc);
    delete self.ring[crc];
    self.sorted_keys.splice(idx, 1); //remove
  }
};


/**
 * Given a string key a corresponding node in the hash ring is returned.
 * If the hash ring is empty. undifined is returned.
 */
HashRingProto.getNode = function(key){
  var self = this;
  var nodePos = self.getNodePos(key);
  return nodePos.ring;
};


/**
 * Given a string key a corresponding node in the hash ring is returned
 * along with it's position in the ring.
 * @param key
 * @returns {Array}
 * TODO check it!
 */
HashRingProto.getNodePos = function(key){
  var self = this;
  if(Object.keys(self.ring).length == 0)
    return [null, null];
  var crc = hashValue.hash(key, self.algorithm);
  var idx = bisect(self.sorted_keys, crc);
  idx = Math.min(idx, (self.replicas * self.nodes.length) - 1);
  return {"ring":self.ring[self.sorted_keys[idx]], "idx":idx};
};


/**
 * TODO implement iterator function
 */

HashRingProto.iterNodes = function(key){

};


bisect = function(a, x, lo, hi) {
  lo || (lo = 0);
  hi || (hi = a.length);

  var mid;
  while(lo < hi)
  {
    mid = (lo+hi) >> 1;
    if(x < a[mid]) hi = mid;
    else lo = mid+1;
  }
  return lo;
};

bisect_left = function(a, x, lo, hi) {
  lo || (lo = 0);
  hi || (hi = a.length);

  var mid;
  while(lo < hi)
  {
    mid = (lo+hi) >> 1;
    if(a[mid] < x) lo = mid+1;
    else hi = mid;
  }
  return lo;
};