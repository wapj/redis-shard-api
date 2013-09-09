var RedisShard = require('../index');

var servers = [
  {'name':'node1','host':'127.0.0.1','port':6379,'db':0},
  {'name':'node2','host':'127.0.0.1','port':6380,'db':0},
  {'name':'node3','host':'127.0.0.1','port':6381,'db':0},
  {'name':'node4','host':'127.0.0.1','port':6382,'db':0}
];

var redis = new RedisShard(servers);

redis.get("test1", function(err, result){
  console.log(result);
});