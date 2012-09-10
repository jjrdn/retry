function retry (fn, options) {
  options = options || {};
  var maxTimeout  = options.maxTimeout  || Infinity;
  var minTimeout  = options.minTimeout  || 0;
  var maxAttempts = options.maxAttempts || 10;
  var backoff     = options.backoff;

  if (maxTimeout < minTimeout) {
    throw new Error('maxTimeout cannot be less than minTimeout');
  }

  if (maxAttempts < 1) {
    throw new Error('maxAttempts cannot be less than 1');
  }

  if (backoff == null) {
    backoff = 0;
  }

  if (typeof backoff === 'number') {
    (function(){
      var backoffTimeout = backoff;
      backoff = function() { return backoffTimeout; };
    })();
  }

  if (typeof backoff !== 'function') {
    throw new Error('backoff must be a number or a function');
  }

  // TODO: test for this
  function coerceTimeout (timeout) {
    timeout = Math.min(timeout, maxTimeout);
    timeout = Math.max(timeout, minTimeout);
    return timeout;
  }

  function operation () {
    var attempts = 0;
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();

    // TODO: test for this.. hmm how to do that though
    if (typeof callback !== 'function') {
      args.push(callback);
      callback = function () {};
    }

    // push wrapped callback onto arguments
    function retryCallback(error) {
      attempts += 1;
      if (!error || attempts >= maxAttempts) {
        return callback.apply(this, arguments);
      }

      setTimeout(function() {
        fn.apply(this, args);
      }, 100);
    }

    args.push(retryCallback);
    fn.apply(this, args);
  }

  return operation;
}

function exponentialBackoff(options) {
  var factor  = options.factor  || 2;
  var initial = options.initial || 100;

  return function (attempts) {
    var timeout = Math.round(initial * Math.pow(factor, attempts));
    return timeout;
  };
}

function linearBackoff (options) {
  var factor;

  options = options || 1;

  if (typeof options === 'number') {
    factor = options;
  }

  if (typeof options.factor === 'number') {
    factor = options.factor;
  }

  if (!factor) {
    throw new Error('invalid factor');
  }

  return function (attempts) {
    return attempts * factor;
  };
}


exports = module.exports = retry;

exports.backoff = {
  exponential: exponentialBackoff,
  linear: linearBackoff
};
