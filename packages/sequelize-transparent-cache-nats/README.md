# sequelize-transparent-cache-nats

[NATS](https://github.com/nats-io/nats.js) adaptor for [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache).

Stores sequelize objects in NATS using a KeyValue Bucket

## Example usage

## Example with Bucket TTL

```javascript
const { connect } = require('@nats-io/transport-node')
const { jetstream } = require('@nats-io/jetstream')
const { Kvm } = require('@nats-io/kv')

// connect to the default server 127.0.0.1:4222

async function start() {
  nc = await connect()

  const js = jetstream(nc)
  const kvBucket = await new Kvm(js).create('bucket', { ttl: 1_000 }) // ttl is specified in ms

  const NatsAdaptor = require('sequelize-transparent-cache-nats')
  const natsAdaptor = new NatsAdaptor({
    client: kvBucket,
    namespace: 'example',
  })
}

start()

```
### Example with Bucket TTL and per-key TTL

If per-Key TTLs are required then the bucket needs to be created with the `markerTTL` option. 


```javascript
const js = jetstream(nc)
const kvBucket = await new Kvm(js).create('bucket', { markerTTL: 1_000 }) // ttl are specified in ms

// set cache key, and set ttl
await User.cache('find-with-ttl', '30s').findAll({ where: { name: 'Dan' } })

```

## Constructor arguments

| Param       | Type             | Required | Description                                                                     |
|-------------|------------------|----------|---------------------------------------------------------------------------------|
| `client`    | Bucket instance  | yes      | Configured [KV Bucket]() |
| `namespace` | string           | no       | Prefix for all keys                                                             |

## Storing format
Each object stored as single JSON string.
Namespace delimeter is ".".

| Key                                  | Value           |
|--------------------------------------|-----------------|
| `<namespace>.<modelName>.<objectId>` | `{JSON string}` |

For more info see [sequelize-transparent-cache](https://www.npmjs.com/package/sequelize-transparent-cache)
