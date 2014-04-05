var T = require('traitor');

/*
 * bk:model
 *
 * Represents an object with an observable map of attributes.
 *
 */

T.register('bk:model', {
    
    requires: [
        'bk:events'
    ],
    
    prepare: function(def, topts) {

    },
    
    apply: function(def, topts) {

        def.init(function(opts, attrs) {

            attrs = attrs || {};

            this.attributes = attrs;

        });

        def.method('has', function(attrib) {
            return attrib in this.attributes;
        });

        def.method('get', function(attrib) {
            return this.attributes[attrib];
        });

        def.method('set', function(attrib, value, mute) {

            var oldValue = this.attributes[attrib];
            this.attributes[attrib] = value;
            
            if (!mute) {

                var patch = {};
                patch[attrib] = [oldValue, value];

                this.emit('change:' + attrib, this, patch);

            }

        });

    }

});