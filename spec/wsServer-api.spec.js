const WebSocket = require('ws');

const testStore = require('./testStore');
const DataService = require('../src/dataService');
const wsServerAPI = require('../src/wsServer-api');

const baseURL = 'ws://localhost:8081';

describe('WebSocket API', () => {
  let dataService;
  let ws;
  let wsServer;

  beforeEach((done) => {
    const store = testStore();
    dataService = DataService(store);
    wsServer = wsServerAPI(dataService);

    ws = new WebSocket(`${baseURL}`);
    wsServer.on('listening', () => {
        done();
    });
  });

  afterEach((done) => {
    ws.close();
    wsServer.close();
    done();
  });

  describe('Opening a websocket connection to the server', () => {
    it('successfully establishes a connection', (done) => {
      ws.on('open', () => {
        expect(ws).toBeTruthy();
        done();
      });
    });
  });

});
