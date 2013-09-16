var redisShard = require('../');

var redisServerConfigs = [
  {'name':'node1','host':'127.0.0.1','port':6379,'db':0}
  , {'name':'node2','host':'127.0.0.1','port':6380,'db':0}
  , {'name':'node3','host':'127.0.0.1','port':6381,'db':0}
  , {'name':'node4','host':'127.0.0.1','port':6382,'db':0}
]

var shardedRedis = new redisShard(global.redisServerConfigs);

var rs = [];

for (var i = 0; i < global.redisServerConfigs.length ; i ++){
  rs[i] = shardedRedis.getConnectionByName(redisServerConfigs[i].name);
}

/**
 * this will be
 * 6379
 * 6380
 * 6381
 * 6382
 *
  */
for (var x in rs){
  console.log(rs[x].port);
}
