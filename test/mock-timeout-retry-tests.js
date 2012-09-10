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

exports['should call setTimeout with correct backoff'] = function (test) {
  test.expect(1);

  setTimeout = function (f, timeout) {
    test.strictEqual(100, timeout);
    originalSetTimeout.apply(this, arguments);
  };

  var fn = retry(failOnceThenSucceed, {backoff: 100});
  fn(test.done);
};



