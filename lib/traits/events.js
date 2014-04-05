var T = require('traitor');

T.register('bk:events', {
	
	requires: [],
	
	prepare: function(def) {

	},
	
	apply: function(def) {

		var slice = Array.prototype.slice;

		def.method('on', function(ev, callback) {

			var hnds 	= this._bkEventHandlers || (this._bkEventHandlers = {}),
				lst 	= hnds[ev] || (hnds[ev] = []);

		    lst.push(callback);

		    var removed = false;
		    return function() {
		        if (!removed) {
		            lst.splice(lst.indexOf(callback), 1);
		            removed = true;
		        }
		    }

		});

		def.method('once', function(ev, callback) {
		    
		    var cancel = this.on(ev, function() {
		        callback.apply(null, arguments);
		        cancel();
		    });

		    return cancel;
		
		});

		def.method('emit', function(ev) {

			var hnds = this._bkEventHandlers;
			if (!hnds) {
				return;
			}

		    var lst = hnds[ev];
		    if (lst) {
		        var args = slice.call(arguments, 1);
		        for (var i = 0, l = lst.length; i < l; ++i) {
		            lst[i].apply(null, args);
		        }
		    }

		});

	}
	
});