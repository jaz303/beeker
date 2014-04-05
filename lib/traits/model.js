var T = require('traitor');

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

        def.method('set', function(attrib, value) {
            this.attributes[attrib] = value;
        });

    }

});