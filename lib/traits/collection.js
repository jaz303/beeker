var T = require('traitor');

T.register('bk:collection', {
    
    requires: [
        'bk:events'
    ],
    
    prepare: function(def) {

    },
    
    apply: function(def) {

        def.init(function(opts) {

            opts = opts || {};

            this._sortBy    = opts.sortBy || null;
            this._items     = [];

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

    }
    
});