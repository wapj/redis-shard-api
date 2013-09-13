var HashRing = require('../lib/HashRing');

var util = require('util');

var servers = ['127.0.0.1:6379', '127.0.0.1:6380', '127.0.0.1:6381', '127.0.0.1:6382'];

var ring = new HashRing(servers);

console.log(ring.constructor);


for (var n = 0; n < 100; n++){
  console.log(util.format("%d",n) + " " + ring.getNode("test" + (n +1)));
}

