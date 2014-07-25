module.exports = Collection;

var slice = Array.prototype.slice;

function Collection(opts) {

    opts = opts || {};

    this._sortBy    = opts.sortBy || null;
    this._eq        = opts.eq || null;
    this._items     = [];

    this.length     = 0;

}

require('util').inherits(Collection, require('events').EventEmitter);

var def = {
    method: function(name, fn) {
        Collection.prototype[name] = fn;
    }
};

def.method('send', function(method) {
    var args = slice.call(arguments, 1);
    this._items.forEach(function(item) {
        item[method].apply(item, args);
    });
});

def.method('sortBy', function(sortBy) {

    if (sortBy === this._sortBy) {
        return;
    }

    this._sortBy = sortBy;
    this.sort();

});

def.method('sort', function() {
    
    if (!this._sortBy) {
        return;
    }

    this._items.sort(this._sortBy);

    this.emit('sort');

});

def.method('at', function(ix) {
    return this._items[ix];
});

def.method('set', function(ix, item) {
    
    if (ix < 0 || ix >= this._items.length) {
        throw new RangeError("invalid index: " + ix);
    }

    var victim = this._items[ix]
    this._items[ix] = item;

    this.emit('change:set', item, ix);

    return this._items[ix];

});

def.method('replace', function(oldItem, newItem, fromIndex) {
    return this.set(this.indexOf(oldItem, fromIndex), newItem);
});

def.method('add', function(item, opts) {

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
        this.emit('change:add', item, pos);
    }

});

def.method('push', function(item) {
    return this.add(item, this._items.length);
});

def.method('unshift', function(item) {
    return this.add(item, 0);
});

def.method('remove', function(item) {
    return this.removeItemAtIndex(this.indexOf(item));
});

def.method('removeItemAtIndex', function(ix) {

    if (ix < 0) {
        throw new RangeError("invalid index for item removal: " + ix);
    }

    var mute    = false,
        victim  = this._items[ix];

    this._items.splice(ix, 1);
    this.length--;

    if (!mute) {
        this.emit('change:remove', victim, ix);
    }

    return victim;

});

def.method('pop', function() {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(this.length-1);    
    }
});

def.method('shift', function() {
    if (this.length === 0) {
        return null;
    } else {
        return this.removeItemAtIndex(0);
    }
});

def.method('clear', function(item) {

    var mute = false;

    this._items = [];
    this.length = 0;

    if (!mute) {
        this.emit('change:clear');
    }

});

def.method('reset', function(items) {

    var mute = false;

    this._items = items.slice(0);
    this.length = this._items.length;
    this.sort();

    if (!mute) {
        this.emit('change:replace');
    }

});

def.method('items', function() {
    return this._items.slice(0);
});

def.method('indexOf', function(item, fromIndex) {
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
});

def.method('lastIndexOf', function(item, fromIndex) {
    if (this._eq) {
        // TODO: copy from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
        throw new Error("lastIndexOf not implemented for user-defined equality");
    } else {
        return this._items.lastIndexOf(item, fromIndex)
    }
});

[ 'join', 'slice', 'forEach', 'entries', 'every', 'some',
  'filter', 'map', 'reduce', 'reduceRight' ].forEach(function(fn) {
    var impl = Array.prototype[fn];
    if (impl) {
        def.method(fn, function() {
            return impl.apply(this._items, arguments);
        });
    }
});
