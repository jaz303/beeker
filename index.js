module.exports = Collection;

var EventBox = require('event-box');

var slice = Array.prototype.slice;

var DEFAULT_OPTS = { mute: false };

function Collection(items, opts) {
    if (items && !Array.isArray(items)) {
        opts = items;
        items = null;
    }

    opts = opts || {};

    this._sortBy    = opts.sortBy || null;
    this._eq        = opts.eq || null;
    this._items     = items ? items.slice(0) : [];
    
    this.length     = this._items.length;
    this.events     = new EventBox();
    
    this.sort();
}

//
// Event handling

Collection.prototype.off    = function(ev, cb) { return this.events.off(ev, cb); }
Collection.prototype.on     = function(ev, cb) { return this.events.on(ev, cb); }
Collection.prototype.on_c   = function(ev, cb) { return this.events.on_c(ev, cb); }
Collection.prototype.once   = function(ev, cb) { return this.events.once(ev, cb); }
Collection.prototype.once_c = function(ev, cb) { return this.events.once_c(ev, cb); }

//
// Non-destructive array method delegations

;[  'join',
    'slice',
    'forEach',
    'entries',
    'every',
    'some',
    'filter',
    'map',
    'reduce',
    'reduceRight'
].forEach(function(fn) {
    var impl = Array.prototype[fn];
    if (impl) {
        Collection.prototype[fn] = function() {
            return impl.apply(this._items, arguments);
        };
    }
});

//
// Retrieval

Collection.prototype.at = function(ix) {
    return this._items[ix];
}

Collection.prototype.contains = function(item) {
    return this.indexOf(item) >= 0;
}

Collection.prototype.indexOf = function(item, fromIndex) {
    if (this._eq) {
        var len = this._items.length;
        fromIndex = +fromIndex || 0;
        if (fromIndex < 0) {
            fromIndex += len;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }
        for (; fromIndex < len; ++fromIndex) {
            if (this._eq(item, this._items[fromIndex])) {
                return fromIndex;
            }
        }
        return -1;
    } else {
        return this._items.indexOf(item, fromIndex);
    }
}

Collection.prototype.items = function() {
    return this._items.slice(0);
}

Collection.prototype.lastIndexOf = function(item, fromIndex) {
    if (this._eq) {
        // TODO: copy from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
        throw new Error("lastIndexOf not implemented for user-defined equality");
    } else {
        return this._items.lastIndexOf(item, fromIndex)
    }
}

//
// Batch operations

Collection.prototype.send = function(method) {
    var args = slice.call(arguments, 1);
    this._items.forEach(function(item) {
        item[method].apply(item, args);
    });
}

//
// Mutation

Collection.prototype.add = function(item, pos, opts) {

    if (!opts && pos && typeof pos !== 'number') {
        opts = pos;
        pos = null;
    }

    if (pos === void 0) {
        pos = this._items.length;
    } else if (typeof pos !== 'number') {
        throw new ArgumentError("Collection::add() - if supplied, 'pos' must be a number");
    }

    opts = opts || DEFAULT_OPTS;

    if (this._sortBy) {
        for (pos = 0, l = this._items.length; pos < l; ++pos) {
            if (this._sortBy(item, this._items[pos]) < 0) {
                break;
            }
        }
    } else if (pos < 0 || pos > this.length) {
        throw new RangeError("Collection::add() - 'pos' out of range");
    }

    this._items.splice(pos, 0, item);
    this.length++;

    if (!opts.mute) {
        this.events.emit('change:add', item, pos);
    }

}

Collection.prototype.clear = function(item, opts) {
    opts = opts || DEFAULT_OPTS;

    this._items = [];
    this.length = 0;
    
    if (!opts.mute) {
        this.events.emit('change:clear');
    }
}

Collection.prototype.pop = function(opts) {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(this.length-1, opts);
    }
}

Collection.prototype.push = function(item) {
    return this.add(item, this._items.length);
}

Collection.prototype.remove = function(item) {
    return this.removeItemAtIndex(this.indexOf(item));
}

Collection.prototype.removeItemAtIndex = function(ix, opts) {
    this._rangeCheck(ix);

    opts = opts || DEFAULT_OPTS;

    var victim = this._items[ix];

    this._items.splice(ix, 1);
    this.length--;

    if (!opts.mute) {
        this.events.emit('change:remove', victim, ix);
    }

    return victim;
}

Collection.prototype.replace = function(oldItem, newItem, fromIndex, opts) {
    if (fromIndex && typeof fromIndex !== 'number') {
        opts = fromIndex;
        fromIndex = null;
    }
    return this.set(this.indexOf(oldItem, fromIndex), newItem, opts);
}

Collection.prototype.reset = function(newItems, opts) {
    opts = opts || DEFAULT_OPTS;

    this._items = newItems.slice(0);
    this.length = this._items.length;
    
    this.sort();

    if (!opts.mute) {
        this.events.emit('change:reset');
    }
}

Collection.prototype.set = function(ix, item, opts) {
    this._rangeCheck(ix);
    
    var victim = this._items[ix]
    this._items[ix] = item;

    opts = opts || DEFAULT_OPTS;
    if (!opts.mute) {
        this.events.emit('change:set', item, ix, victim);    
    }

    return victim;
}

Collection.prototype.shift = function() {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(0);
    }
}

Collection.prototype.unshift = function(item) {
    return this.add(item, 0);
}

//
// Sorting

Collection.prototype.sortBy = function(sortBy) {
    if (sortBy === this._sortBy) {
        return;
    }
    this._sortBy = sortBy;
    this.sort();
}

Collection.prototype.sort = function() {
    if (this.length === 0 || !this._sortBy) {
        return;
    }
    this._items.sort(this._sortBy);
    this.events.emit('sort');
}

//
// Internals

Collection.prototype._rangeCheck = function(ix) {
    if (ix < 0 || ix >= this.length) {
        throw new RangeError("invalid index for item removal: " + ix);
    }
}
