const DataService = require('./dataService');
const restAPI = require('./rest-api');
const wsServerAPI = require('./wsServer-api');

module.exports = class Elimu {
  constructor(store) {
    if (store) {
      this.store = store;
    } else {
      this.store = {};
    }

    const dataService = DataService(this.store);

    // Start serving the REST API
    restAPI(dataService);

    // Start serving the WebSocket API
    wsServerAPI(dataService);
  }
};
