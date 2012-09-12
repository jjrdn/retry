var retry = require('../');

var originalSetTimeout;

exports.setUp = function (callback) {
  originalSetTimeout = setTimeout;
  callback();
};

exports.tearDown = function (callback) {
  setTimeout = originalSetTimeout;
  callback();
};

var firstTime = true;
function failOnceThenSucceed(cb) {
  if (firstTime) {
    firstTime = false;
    return cb(new Error());
  }
  cb();
}

exports['should call setTimeout with correct constant timeout'] = function (test) {
  test.expect(1);

  var constantTimeout = 123;

  setTimeout = function (f, timeout) {
    test.strictEqual(constantTimeout, timeout);
    originalSetTimeout.apply(this, arguments);
  };

  var fn = retry(failOnceThenSucceed, { timeout: constantTimeout });
  fn(test.done);
};

