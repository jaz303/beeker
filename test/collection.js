var test = require('./tape_helper');
var Collection = require('..');

//
// Defaults

test('defaults to empty array', function(a) {
    var c = new Collection();
    a.deepEqual(c.items(), []);
    a.equal(c.length, 0);
    a.end();
});

test('initial items', function(a) {
    var c = new Collection([1,2,3,4]);
    a.deepEqual(c.items(), [1,2,3,4]);
    a.equal(c.length, 4);
    a.end();
})

//
// Retrieval/querying

test('collection.at() returns item at index', function(a) {
    var c = new Collection();
    c.add('a');
    c.add('b');
    a.equal(c.at(0), 'a');
    a.equal(c.at(1), 'b');
    a.end();
});

test('collection.contains() returns false when no such item', function(a) {
    var c = new Collection([8, 9, 10]);
    a.notOk(c.contains(1));
    a.end();
});

test('collection.contains() returns true when item exists', function(a) {
    var c = new Collection([8, 9, 10]);
    a.ok(c.contains(8));
    a.end();
});

test('collection.indexOf() with default comparator returns -1 when no such item', function(a) {
    var c = new Collection(['a', 'b', 'c']);
    a.equal(c.indexOf('d'), -1);
    a.end();
});

test('collection.indexOf() with default comparator returns correct index', function(a) {
    var c = new Collection(['a', 'b', 'c']);
    a.equal(c.indexOf('b'), 1);
    a.end();
});

test('collection.indexOf() with custom comparator returns -1 when no such item', function(a) {
    var c = new Collection(['A', 'B', 'C'], {
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });
    a.ok(c.indexOf('d') === -1);
    a.end();
});

test('collection.indexOf() with custom comparator returns correct index', function(a) {
    var c = new Collection(['A', 'B', 'C'], {
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });
    a.ok(c.indexOf('b') === 1);
    a.end();
});

test('collection.indexOf() with custom comparator and fromIndex returns correct index', function(a) {
    var c = new Collection(['A', 'B', 'C', 'B'], {
        eq: function(v1, v2) {
            return v1.toLowerCase() === v2.toLowerCase();
        }
    });
    a.ok(c.indexOf('b', 2) === 3);
    a.end();
});

test('collection.items() returns array of all items', function(a) {
    var c = new Collection();
    c.add(1);
    c.add(2);
    c.add(3);
    a.deepEqual(c.items(), [1,2,3]);
    a.end();
});

test('collection.items() does not return internal array', function(a) {
    var c = new Collection();
    a.ok(c.items() !== c._items); // internals test
    a.end();
});

// TODO: lastIndexOf

//
// Batch operations

test('collection.send() calls a method on each item of the collection', function(a) {
    var x = 0;
    var c = new Collection([
        { add: function(a,b) { x += (a+b+1); } },
        { add: function(a,b) { x += (a+b+2); } },
        { add: function(a,b) { x += (a+b+3); } }
    ]);
    c.send('add', 1, 2);
    a.ok(x === 15);
    a.end();
});

//
// Mutation

test('collection.add() increments length', function(a) {
    var c = new Collection();
    c.add('a');
    c.add('b');
    c.add('c');
    a.equal(c.length, 3);
    a.end();
});

test('collection.clear() empties collection', function(a) {
    var c = new Collection([4, 8, 2]);
    c.clear();
    a.equal(c.length, 0);
    a.deepEqual(c.items(), []);
    a.end();
});

test('collection.pop() removes last item from collection', function(a) {
    var c = new Collection(['a', 'b', 'c']);
    a.equal(c.pop(), 'c');
    a.deepEqual(['a', 'b'], c.items());
    a.end();
});

test('collection.pop() returns null if collection is empty', function(a) {
    var c = new Collection();
    a.ok(c.pop() === null);
    a.end();
});

test('collection.push() adds item to end of collection', function(a) {
    var c = new Collection([10,12]);
    c.push(100);
    a.deepEqual(c.items(), [10, 12, 100]);
    a.end();
});

test('collection.removeItemAtIndex() removes item and returns it', function(a) {
    var c = new Collection([10, 20, 30]);
    var victim = c.removeItemAtIndex(2);
    a.equal(victim, 30);
    a.equal(c.length, 2);
    a.equal(c.indexOf(30), -1);
    a.end();
});

test('collection.remove() removes item and returns it', function(a) {
    var c = new Collection(['foo', 'bar', 'moose']);
    var victim = c.remove('bar');
    a.equal(victim, 'bar');
    a.equal(c.length, 2);
    a.equal(c.indexOf('bar'), -1);
    a.end();
});

test('collection.replace() replaces first occurrence of item', function(a) {
    var c = new Collection([4, 5, 6, 7]);
    c.replace(5, 'five');
    a.equal(c.at(1), 'five');
    a.deepEqual(c.items(), [4, 'five', 6, 7]);
    a.end();
});

test('collection.replace() replaces first occurrence of item after fromIndex', function(a) {
    var c = new Collection([1, 2, 2]);
    c.replace(2, 10, 2);
    a.equal(c.at(2), 10);
    a.deepEqual(c.items(), [1, 2, 10]);
    a.end();
});

test('collection.reset() sets all items to new list of items, respecting original sort order', function(a) {
    var c = new Collection(['a', 'b']);
    c.sortBy(function(l,r) { return r - l; });
    c.reset([1, 2, 3]);
    a.equal(c.length, 3);
    a.deepEqual(c.items(), [3, 2, 1])
    a.end();
});

test('collection.set() updates item at specified index and returns original item', function(a) {
    var c = new Collection(['t', 'u', 'v']);
    a.equal(c.set(2, 'w'), 'v');
    a.ok(c.length === 3);
    a.deepEqual(c.items(), ['t', 'u', 'w']);
    a.end();
});

test('collection.shift() removes first item from collection', function(a) {
    var c = new Collection(['a', 'b', 'c']);
    a.equal(c.shift(), 'a');
    a.deepEqual(['b', 'c'], c.items());
    a.end();
});

test('collection.shift() returns null if collection is empty', function(a) {
    var c = new Collection();
    a.ok(c.shift() === null);
    a.end();
});

test('collection.unshift() adds item to beginning of collection', function(a) {
    var c = new Collection([10, 12]);
    c.unshift('abc');
    a.deepEqual(c.items(), ['abc', 10, 12]);
    a.end();
});

//
// Sorting

test('sort order is applied to initial items', function(a) {
    var c = new Collection([1, 5, 4, 3, 2], {
        sortBy: function(l, r) { return r - l; }
    });
    a.deepEqual(c.items(), [5, 4, 3, 2, 1]);
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
    var c = new Collection([1, 2, 3, 4, 5]);
    c.sortBy(function(l,r) { return r - l; });
    a.deepEqual(c.items(), [5,4,3,2,1]);
    a.end();
});
