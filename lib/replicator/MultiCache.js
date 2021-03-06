/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var redis = require('redis');
var util = require('util');

function MultiCache(client) {
    redis.Multi.apply(this, arguments);
    this._client = client;
    this.cache = {};
}
util.inherits(MultiCache, redis.Multi);

MultiCache.prototype.set = function (key, value) {
    this.cache[key] = value;
    redis.Multi.prototype.set.apply(this, arguments);
};

MultiCache.prototype.smembers = function () {
    this._client.smembers.apply(this._client, arguments);
};

MultiCache.prototype.get = function (key, cb) {
    var self = this;
    if (this.cache[key]) {
        setImmediate(function () {
            cb(null, self.cache[key]);
        });
    } else {
        this._client.get(key, function (err, res) {
            self.cache[key] = res;
            cb(err, res);
        });
    }
};

module.exports = {
    MultiCache: MultiCache,
    multi: function (client) {
        return (new MultiCache(client));
    }
};
