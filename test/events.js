var test    = require('./tape_helper'),
    beeker  = require('..'),
    T       = require('traitor');

var Emitter = T.make(['bk:events']);

test('emit', function(a) {

    var em = new Emitter();

    var i = 0;
    em.on('foo', function(val) { i += val; });

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 6);

    a.end();

});

test('emit once', function(a) {

    var em = new Emitter();

    var i = 0;
    em.once('foo', function(val) { i += val; });

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 1);

    a.end();

});

test('multiple listeners', function(a) {

    var em = new Emitter();

    var x = 0, y = 0, z = 0;

    em.on('foo', function() { x++; });
    em.on('foo', function() { y++; });
    em.on('foo', function() { z++; });

    em.emit('foo');
    em.emit('foo');

    a.ok(x === 2);
    a.ok(y === 2);
    a.ok(z === 2);

    a.end();

});

test('cancellation', function(a) {

    var em = new Emitter();

    var i = 0;
    var cancel = em.on('foo', function() { i++; });

    cancel();

    em.emit('foo');

    a.ok(i === 0);
    
    a.end();

});