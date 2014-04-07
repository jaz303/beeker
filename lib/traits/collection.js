var T = require('traitor');

var slice = Array.prototype.slice;

T.register('bk:collection', {
    
    requires: [
        'bk:events'
    ],
    
    prepare: function(def) {

    },
    
    apply: function(def, opts) {

        def.init(function(opts) {

            opts = opts || {};

            this._sortBy    = opts.sortBy || null;
            this._items     = [];

        });

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

        });

        def.method('at', function(ix) {
            return this._items[ix];
        });

        def.method('add', function(item) {

            var mute    = false,
                pos     = this._items.length;

            if (this._sortBy) {
                for (pos = 0, l = this._items.length; pos < l; ++pos) {
                    if (this._sortBy(item, this._items[pos]) < 0) {
                        break;
                    }
                }
            }

            this._items.splice(pos, 0, item);
            
            // if (!mute) {
            //     this.emit('change:item-added', item);   
            // }

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
                for (; fromIndex < len; ++i) {
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

        [   'join',
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
            if (fn in Array.prototype) {
                def.method(fn, function() {
                    return this._items[fn].apply(this._items, arguments);
                });
            }
        });

    }
    
});