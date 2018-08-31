const ssbKeys = require('ssb-keys')
const ssbConfigInject = require('ssb-config/inject')
const path = require('path')

var sbot
module.exports = function startSSB () {
  if (sbot) return sbot
  const config = ssbConfigInject()
  config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
  config.logging.level = ''
  sbot = require('scuttlebot/index')
    .use(require('scuttlebot/plugins/plugins'))
    .use(require('scuttlebot/plugins/master'))
    .use(require('scuttlebot/plugins/gossip'))
    .use(require('scuttlebot/plugins/replicate'))
    .use(require('ssb-friends'))
    .use(require('ssb-blobs'))
    .use(require('ssb-serve-blobs'))
    .use(require('ssb-backlinks'))
    .use(require('ssb-private'))
    .use(require('ssb-about'))
    .use(require('ssb-contacts'))
    .use(require('ssb-query'))
    .use(require('scuttlebot/plugins/invite'))
    .use(require('scuttlebot/plugins/local'))
    .call(null, config)

  return sbot
}
