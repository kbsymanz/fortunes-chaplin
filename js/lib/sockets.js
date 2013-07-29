define([
  'chaplin',
  'socketio'
], function(Chaplin, io) {
  'use strict';

  var sockets = {}
    , server
    , isConnected = false
    ;

  /* --------------------------------------------------------
   * search()
   *
   * Private: send the search request to the server and handle the
   * response.
   *
   * param       options  (optional)
   * param       callback
   * return      undefined
   * -------------------------------------------------------- */
  var search = function(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    server.emit('search', options, function(data) {
      callback(data);
    });
  };

  /* --------------------------------------------------------
   * random()
   *
   * Private: send the request for a random fortune to the server
   * and handle the response.
   *
   * param       options  (optional)
   * param       callback
   * return      undefined
   * -------------------------------------------------------- */
  var random = function(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    server.emit('random', options, function(data) {
      callback(data);
    });
  };

  /* --------------------------------------------------------
   * randomInterval()
   *
   * Private: instruct the server to emit fortunes at specific
   * intervals. Server responds with the message key to listen
   * for.
   *
   * param       options
   * param       callback
   * return      undefined
   * -------------------------------------------------------- */
  var randomInterval = function(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    options || (options = {});
    if (! options.interval) {
      options.interval = 60;    // default seconds between fortunes
    }
    server.emit('random', options, function(msgKey) {
      server.on(msgKey, callback);
    });
  };

  /* --------------------------------------------------------
   * sessionExpired()
   *
   * Simplistic implementation to handle session expiration.
   *
   * param       location - the url of the login page possibly
   * return      undefined
   * -------------------------------------------------------- */
  var sessionExpired = function(location) {
    alert('Session has expired. Please login again.');
    console.dir(location);
    if (location) {
      window.location = location[0];
    }
  };

  /* --------------------------------------------------------
   * initialize()
   *
   * Public: initialize communications with the server and
   * listen for client-side events.
   *
   * param       undefined
   * return      undefined
   * -------------------------------------------------------- */
  sockets.initialize = function() {
    server = io.connect('/fortunes');

    // --------------------------------------------------------
    // Activate event handling.
    // --------------------------------------------------------
    server.on('connect', function() {
      isConnected = true;

      console.log('Connected');

      Chaplin.mediator.subscribe('search', search);
      //console.log('Subscribed to search');

      Chaplin.mediator.subscribe('random', random);
      //console.log('Subscribed to random');

      Chaplin.mediator.subscribe('randomInterval', randomInterval);
      //console.log('Subscribed to randomInterval');

      Chaplin.mediator.publish('online');
    });

    // --------------------------------------------------------
    // Deactivate event handling.
    // --------------------------------------------------------
    server.on('disconnect', function() {
      isConnected = false;

      console.log('Disconnect');

      Chaplin.mediator.publish('offline');

      Chaplin.mediator.unsubscribe('search', search);
      //console.log('Unsubscribed from search');

      Chaplin.mediator.unsubscribe('random', random);
      //console.log('Unsubscribed from random');

      Chaplin.mediator.unsubscribe('randomInterval', randomInterval);
      //console.log('Unsubscribed from randomInterval');
    });

    server.on('sessionExpired', sessionExpired);

    server.on('reconnect', function() {
      console.log('reconnect');
    });
    server.on('reconnecting', function() {
      console.log('reconnecting');
    });
    server.on('connecting', function() {
      console.log('connecting');
    });
    server.on('connect_failed', function() {
      console.log('connect_failed');
    });
    server.on('reconnect_failed', function() {
      console.log('reconnect_failed');
    });
    server.on('close', function() {
      console.log('close');
    });

  };

  /* --------------------------------------------------------
   * isOnline()
   *
   * Is the socket connected to the server now?
   *
   * param       undefined
   * return      boolean
   * -------------------------------------------------------- */
  sockets.isOnline = function() {
    return isConnected;
  };

  return sockets;
});
