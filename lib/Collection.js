module.exports = Collection;

var EventBox = require('event-box');

var slice = Array.prototype.slice;

function Collection(opts) {

    opts = opts || {};

    this._sortBy    = opts.sortBy || null;
    this._eq        = opts.eq || null;
    this._items     = [];
    this._events    = new EventBox();

    this.length     = 0;

}

//
// Event handling

Collection.prototype.off    = function(ev, cb) { return this._events.off(ev, cb); }
Collection.prototype.on     = function(ev, cb) { return this._events.on(ev, cb); }
Collection.prototype.on_c   = function(ev, cb) { return this._events.on_c(ev, cb); }
Collection.prototype.once   = function(ev, cb) { return this._events.once(ev, cb); }
Collection.prototype.once_c = function(ev, cb) { return this._events.once_c(ev, cb); }

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
//

Collection.prototype.send = function(method) {
    var args = slice.call(arguments, 1);
    this._items.forEach(function(item) {
        item[method].apply(item, args);
    });
}

Collection.prototype.sortBy = function(sortBy) {

    if (sortBy === this._sortBy) {
        return;
    }

    this._sortBy = sortBy;
    this.sort();

}

Collection.prototype.sort = function() {
    
    if (!this._sortBy) {
        return;
    }

    this._items.sort(this._sortBy);

    this._events.emit('sort');

}

Collection.prototype.at = function(ix) {
    return this._items[ix];
}

Collection.prototype.set = function(ix, item) {
    
    if (ix < 0 || ix >= this._items.length) {
        throw new RangeError("invalid index: " + ix);
    }

    var victim = this._items[ix]
    this._items[ix] = item;

    this._events.emit('change:set', item, ix);

    return this._items[ix];

}

Collection.prototype.replace = function(oldItem, newItem, fromIndex) {
    return this.set(this.indexOf(oldItem, fromIndex), newItem);
}

Collection.prototype.add = function(item, opts) {

    var mute, pos;

    if (typeof opts === 'undefined') {
        mute = false;
        pos = this._items.length;
    } else if (typeof opts === 'number') {
        mute = false;
        pos = opts;
    } else if (typeof opts === 'boolean') {
        mute = opts;
        pos = this._items.length;
    } else {
        mute = ('mute' in opts) ? opts.mute : false;
        pos = ('position' in opts) ? opts.position : this._items.length;
    }

    if (this._sortBy) {
        for (pos = 0, l = this._items.length; pos < l; ++pos) {
            if (this._sortBy(item, this._items[pos]) < 0) {
                break;
            }
        }
    }

    this._items.splice(pos, 0, item);
    this.length++;

    if (!mute) {
        this._events.emit('change:add', item, pos);
    }

}

Collection.prototype.push = function(item) {
    return this.add(item, this._items.length);
}

Collection.prototype.unshift = function(item) {
    return this.add(item, 0);
}

Collection.prototype.remove = function(item) {
    return this.removeItemAtIndex(this.indexOf(item));
}

Collection.prototype.removeItemAtIndex = function(ix) {

    if (ix < 0) {
        throw new RangeError("invalid index for item removal: " + ix);
    }

    var mute    = false,
        victim  = this._items[ix];

    this._items.splice(ix, 1);
    this.length--;

    if (!mute) {
        this._events.emit('change:remove', victim, ix);
    }

    return victim;

}

Collection.prototype.pop = function() {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(this.length-1);    
    }
}

Collection.prototype.shift = function() {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(0);
    }
}

Collection.prototype.clear = function(item) {

    var mute = false;

    this._items = [];
    this.length = 0;

    if (!mute) {
        this._events.emit('change:clear');
    }

}

Collection.prototype.reset = function(items) {

    var mute = false;

    this._items = items.slice(0);
    this.length = this._items.length;
    this.sort();

    if (!mute) {
        this._events.emit('change:replace');
    }

}

Collection.prototype.items = function() {
    return this._items.slice(0);
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

Collection.prototype.lastIndexOf = function(item, fromIndex) {
    if (this._eq) {
        // TODO: copy from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
        throw new Error("lastIndexOf not implemented for user-defined equality");
    } else {
        return this._items.lastIndexOf(item, fromIndex)
    }
}
