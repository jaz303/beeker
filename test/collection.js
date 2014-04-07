var test    = require('./tape_helper'),
    beeker  = require('..'),
    T       = require('traitor');

var Collection = T.make(['bk:collection']);

test('defaults to empty array', function(a) {

    var c = new Collection();

    a.deepEqual(c.items(), []);

    a.end();

});

test('when no sort operator specified, add appends items', function(a) {

    var c = new Collection();

    c.add(3);
    c.add(2);
    c.add(1);
    c.add(4);

    a.deepEqual(c.items(), [3, 2, 1, 4]);

    a.end();

});

test('when sort function is specified, list is maintained in sorted order', function(a) {

    var c = new Collection({
        sortBy: function(l, r) { return l - r; }
    });

    c.add(3);
    c.add(2);
    c.add(5);
    c.add(1);
    c.add(4);

    a.deepEqual(c.items(), [1, 2, 3, 4, 5]);

    a.end();

});

test('collection.sortBy() should apply new sort order to collection', function(a) {

    var c = new Collection();

    c.add(1);
    c.add(2);
    c.add(3);
    c.add(4);
    c.add(5);

    c.sortBy(function(l,r) { return r - l; });

    a.deepEqual(c.items(), [5,4,3,2,1]);

    a.end();

});

test('collection.at() returns item at the given index', function(a) {

    var c = new Collection();

    c.add(1);
    c.add(2);
    c.add(3);

    a.ok(c.at(0) === 1);
    a.ok(c.at(1) === 2);
    a.ok(c.at(2) === 3);

    a.end();

});

test('collection.send() calls a method on each item of the collection', function(a) {

    var c = new Collection();

    var x = 0;

    c.add({ add: function(a,b) { x += (a+b+1); } });
    c.add({ add: function(a,b) { x += (a+b+2); } });
    c.add({ add: function(a,b) { x += (a+b+3); } });

    c.send('add', 1, 2);

    a.ok(x === 15);

    a.end();

});