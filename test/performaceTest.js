var HashRing = require('../lib/HashRing');
var kakaoDummyId = "12345678901234567";

var nodes = [];
for(var i = 0;i < 100; i++){
  nodes.push("node" + i);
}

//Check HashRing GetNode
var ring = new HashRing(nodes);
var start = new Date();
for(var i =0;i<1000000;i++){
  ring.getNode(kakaoDummyId + i);
}
var end = new Date();
console.log("[getNode] elapsed time : %s ms", (end - start));


//Check HashValue with crc32 algorithm
var hashValue = require("../lib/HashValue");
start = new Date();
for (var i =0; i < 1000000; i++){
  hashValue.hash(kakaoDummyId + i, "crc32");
}
console.log("[crc32] elapsed time : %s ms", (new Date() - start));


//Check HashValue with md5 algorithm
var hashValue = require("../lib/HashValue");
start = new Date();
for (var i =0; i < 1000000; i++){
  hashValue.hash(kakaoDummyId + i, "md5");
}
console.log("[md5] elapsed time : %s ms", (new Date() - start));