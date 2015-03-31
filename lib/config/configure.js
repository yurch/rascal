'use strict'

var debug = require('debug')('amqp-nice:tasks:configure')
var format = require('util').format
var url = require('url')
var _ = require('lodash').runInContext()

_.mixin({ 'defaultsDeep': require('merge-defaults') });

module.exports = _.curry(function(config, next) {
    _.each(config.vhosts, function(vhost, name) {
        configureVhost(config, name, vhost)
        configureConnection(config.vhosts[name])
        configureExchanges(config.vhosts[name])
        configureQueues(config.vhosts[name])
        configureBindings(config.vhosts[name])
        configurePublications(config)
    })
    next(null, config)
})

function configureVhost(config, name, vhost) {
    debug(format('Configuring vhost: %s', name))
    config.vhosts[name] = _.defaultsDeep(vhost, { name: name }, { defaults: config.defaults })
}

function configureConnection(config) {
    config.connection = _.defaultsDeep(config.connection || {}, config.defaults.connection)
    config.connection.url = config.connection.url || url.format(config.connection)
    config.connection.loggableUrl = config.connection.url.replace(/:[^:]*?@/, ':***@')
}

function configurePublications(config) {
    _.each(config.publications, function(options, name) {
        debug(format('Configuring publication: %s', name))
        config.publications[name] = _.defaultsDeep(options, { name: name }, config.defaults.publications)
    })
}

var configureExchanges = _.curry(configureObjects)('exchanges')
var configureQueues = _.curry(configureObjects)('queues')
var configureBindings = _.curry(configureObjects)('bindings')

function configureObjects(type, config) {
    console.log(config)
    config[type] = config[type] || {}
    _.each(config[type], function(options, name) {
        debug(format('Configuring %s: %s', type, name))
        config[type][name] = _.defaultsDeep(options, { name: name }, config.defaults[type])
        config[type][name].fullyQualifiedName = config.namespace ? config.namespace + ':' + name : name
    })
}