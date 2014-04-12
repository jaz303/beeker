var test    = require('./tape_helper'),
    beeker  = require('..'),
    T       = require('traitor');

var Collection = T.make(['bk:collection']);

test('defaults to empty array', function(a) {

    var c = new Collection();

    a.deepEqual(c.items(), []);
    a.equal(c.length, 0);

    a.end();

});

test('collection.items() returns a copy of items', function(a) {

    var c = new Collection();

    c.add('a');
    c.add('b');
    c.add('c');

    a.deepEqual(c.items(), ['a', 'b', 'c']);

    // internals test
    a.ok(c.items() !== c._items);

    a.end();

});

test('collection.add() increments length', function(a) {

    var c = new Collection();

    c.add('a');
    c.add('b');
    c.add('c');

    a.equal(c.length, 3);

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

test('collection.push() adds item to end of collection', function(a) {

    var c = new Collection();

    c.add(10);
    c.add(12);

    c.push(100);

    a.deepEqual(c.items(), [10, 12, 100]);

    a.end();

});

test('collection.unshift() adds item to beginning of collection', function(a) {

    var c = new Collection();

    c.add(10);
    c.add(12);

    c.unshift('abc');

    a.deepEqual(c.items(), ['abc', 10, 12]);

    a.end();

});

test('collection.remove() removes item and returns it', function(a) {

    var c = new Collection();

    c.add('foo');
    c.add('bar');
    c.add('moose');

    var victim = c.remove('bar');

    a.equal(victim, 'bar');
    a.equal(c.length, 2);
    a.equal(c.indexOf('bar'), -1);

    a.end();

});

test('collection.removeItemAtIndex() removes item and returns it', function(a) {

    var c = new Collection();

    c.add(10);
    c.add(20);
    c.add(30);

    var victim = c.removeItemAtIndex(2);

    a.equal(victim, 30);
    a.equal(c.length, 2);
    a.equal(c.indexOf(30), -1);

    a.end();

});

test('collection.pop() removes last item from collection', function(a) {

    var c = new Collection();

    c.add('a');
    c.add('b');
    c.add('c');

    c.pop();

    a.deepEqual(['a', 'b'], c.items());

    a.end();

});

test('collection.shift() removes first item from collection', function(a) {

    var c = new Collection();

    c.add('a');
    c.add('b');
    c.add('c');

    c.shift();

    a.deepEqual(['b', 'c'], c.items());

    a.end();

});

test('collection.clear() empties collection', function(a) {

    var c = new Collection();

    c.add(4);
    c.add(8);

    c.clear();

    a.equal(c.length, 0);
    a.deepEqual(c.items(), []);

    a.end();

});

test('collection.reset() sets all items to new list of items, respecting original sort order', function(a) {

    var c = new Collection();

    c.add('a');
    c.add('b');

    c.sortBy(function(l,r) { return r - l; });

    c.reset([1, 2, 3]);

    a.equal(c.length, 3);
    a.deepEqual(c.items(), [3, 2, 1])

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

test('collection.set() updates item at specified index', function(a) {

    var c = new Collection();

    c.add('t');
    c.add('u');
    c.add('v');

    c.set(2, 'w');

    a.ok(c.length === 3);
    a.ok(c.at(2) === 'w');

    a.end();

});

test('collection.replace() replaces first occurrence of item after fromIndex', function(a) {

    var c = new Collection();

    c.add(1);
    c.add(1);
    c.add(1);

    c.replace(1, 2, 2);

    a.equal(c.at(2), 2);
    a.deepEqual(c.items(), [1, 1, 2]);

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

test('collection.indexOf() with custom comparator returns -1 when no such item', function(a) {

    var c = new Collection({
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });

    c.add('A');
    c.add('B');
    c.add('C');

    a.ok(c.indexOf('d') === -1);

    a.end();

});

test('collection.indexOf() with custom comparator returns correct index', function(a) {

    var c = new Collection({
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });

    c.add('A');
    c.add('B');
    c.add('C');

    a.ok(c.indexOf('b') === 1);

    a.end();

});

test('collection.indexOf() with custom comparator and fromIndex returns correct index', function(a) {

    var c = new Collection({
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });

    c.add('A');
    c.add('B');
    c.add('C');
    c.add('B');

    a.ok(c.indexOf('b', 2) === 3);

    a.end();

});