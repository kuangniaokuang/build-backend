const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const grpc = require('grpc');
const R = require('ramda');
const fs = require('fs');
const { promisify } = require('es6-promisify');
const config = require('../../config/env/resolveConfig')
const protoPaths = [
  path.join(__dirname, '../proto/analysis-proto/gateway/code_analytics.proto'),
];
const pkgs = R.reduce(
  R.mergeDeepLeft,
  {},
  R.map(protoPath => grpc.loadPackageDefinition(
    protoLoader.loadSync(
      protoPath,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    ),
  ),
  protoPaths),
);
if (!config.custom.CA_GRPC_SERVER) {
    return {};
}

let creds;
if (config.custom.GRPC_NO_SSL) {
  creds = grpc.credentials.createInsecure();
} else {
  const backendCerts = fs.readFileSync(config.custom.CA_CERT_FILE);
  creds = grpc.credentials.createSsl(backendCerts);
}

// FROM https://github.com/grpc/grpc-node/issues/284#issuecomment-415543782
const maxRetries = 3;
const retryInterceptor = (options, nextCall) => {
  var savedMetadata;
  var savedSendMessage;
  var savedReceiveMessage;
  var savedMessageNext;
  var requester = {
      start: function(metadata, listener, next) {
          savedMetadata = metadata;
          var newListener = {
              onReceiveMessage: function(message, next) {
                  savedReceiveMessage = message;
                  savedMessageNext = next;
              },
              onReceiveStatus: function(status, next) {
                  var retries = 0;
                  var retry = function(message, metadata) {
                      retries++;
                      var newCall = nextCall(options);
                      var retryListener = {
                          onReceiveMessage: function(message) {
                              savedReceiveMessage = message;
                          },
                          onReceiveStatus: function(status) {
                              if (status.code !== grpc.status.OK) {
                                  if (retries <= maxRetries) {
                                      retry(message, metadata);
                                  } else {
                                      savedMessageNext(savedReceiveMessage);
                                      next(status);
                                  }
                              } else {
                                  savedMessageNext(savedReceiveMessage);
                                  next({code: grpc.status.OK});
                              }
                          }
                      }
                      newCall.start(metadata, retryListener)
                      newCall.sendMessage(savedSendMessage);  // Added Call
                      newCall.halfClose();  // Added Call
                  };
                  if (status.code !== grpc.status.OK) {
                      retry(savedSendMessage, savedMetadata);
                  } else {
                      savedMessageNext(savedReceiveMessage);
                      next(status);
                  }
              }
          };
          next(metadata, newListener);
      },
      sendMessage: function(message, next) {
          savedSendMessage = message;
          next(message);
      }
  };
  return new grpc.InterceptingCall(nextCall(options), requester);
};
// eslint-disable-next-line no-unused-expressions
let services = R.mapObjIndexed(
  (getClientClass) => {
    const Class = getClientClass();
    let client;
    if (config.custom.GRPC_NO_SSL) {
      client = new Class(config.custom.CA_GRPC_SERVER, creds);
    } else {
      client = new Class(config.custom.CA_GRPC_SERVER, creds, {
        'grpc.ssl_target_name_override': config.custom.CA_CERT_COMMON_NAME,
        'grpc.default_authority': config.custom.CA_CERT_COMMON_NAME,
        interceptors: [retryInterceptor]
      });
    }
    const promisified = {};
    for (const key of Object.keys(Class.service)) {
      promisified[key] = promisify(client[key].bind(client));
    }
    return promisified;
  },
  {
    codeAnalytics: () => pkgs.merico.analysis.gateway.CodeAnalytics,
  },
);

module.exports = services;
