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

			var args = null;

			var hnds = this._bkEventHandlers;
			if (!hnds) return;

			var lst = hnds[ev];
		    if (lst) {
		        args = slice.call(arguments, 1);
		        for (var i = 0, l = lst.length; i < l; ++i) {
		            lst[i].apply(null, args);
		        }
		    }

		    var cix = ev.lastIndexOf(':');
		    if (cix >= 0) {
		    	if (args === null) {
		    		args = slice.call(arguments, 1);
		    	}
		    	this.emitArray(ev.substring(0, cix), args);
		    }

		});

		def.method('emitArray', function(ev, args) {

			var hnds = this._bkEventHandlers;
			if (!hnds) return;
			
			var lst = hnds[ev];
		    if (lst) {
		        for (var i = 0, l = lst.length; i < l; ++i) {
		            lst[i].apply(null, args);
		        }
		    }

		    var cix = ev.lastIndexOf(':');
		    if (cix >= 0) {
		    	this.emitArray(ev.substring(0, cix), args);
		    }

		});

		def.method('emitAfter', function(delay, ev) {

			var self 	= this,
				timer 	= null,
				args 	= slice.call(arguments, 2);

			timer = setTimeout(function() {
				self.emitArray(ev, args);
			}, delay);

			return function() { clearTimeout(timer); }

		});

		def.method('emitEvery', function(interval, ev) {

			var self 	= this,
				timer 	= null,
				args 	= slice.call(arguments, 2);

			var timer = setInterval(function() {
				self.emitArray(ev, args);
			}, delay);

			return function() { clearTimeout(timer); }

		});

	}
	
});