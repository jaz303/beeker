var test    = require('./tape_helper'),
    beeker  = require('..'),
    T       = require('traitor');

var Model = T.make(['bk:model']);

test('default attributes', function(a) {

    var m = new Model();

    a.ok(typeof m.attributes === 'object');
    a.ok(Object.keys(m.attributes).length === 0);

    a.end();

});

test('has', function(a) {

    var m = new Model();

    a.ok(!m.has('banjo'));

    m.set('banjo', 'gotbanjo');
    a.ok(m.has('banjo'));

    a.end();

});

test('get/set', function(a) {

    var m = new Model();

    a.ok(typeof m.get('duck') == 'undefined');

    m.set('duck', 'quack');
    a.ok(m.get('duck') === 'quack');

    a.end();

});
