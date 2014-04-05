var tape = require('tape');

var splice = Array.prototype.slice;

tape.Test.prototype.emits = function(obj, evt, expectedArgs, cb) {

    if (arguments.length === 3) {
        cb = expectedArgs;
        expectedArgs = null;
    }

    var test = this;

    var received = false;

    obj.on(evt, function() {
        received = true;
        if (expectedArgs) {
            test.deepEqual(slice.call(arguments), expectedArgs);
        } else {
            test.pass();
        }
    });

    cb();

    if (!received) {
        test.fail();
    }

}

module.exports = tape;