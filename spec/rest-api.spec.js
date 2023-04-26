const request = require('request');

const testStore = require('./testStore');
const DataService = require('../src/dataService');
const RestAPI = require('../src/rest-api');

const baseURL = 'http://localhost:8080';

describe('Rest API', () => {
  let dataService;
  let restAPI;

  beforeEach((done) => {
    const store = testStore();
    dataService = DataService(store);
    restAPI = RestAPI(dataService);
    done();
  });

  afterEach((done) => {
    restAPI.close();
    done();
  });

  describe(`Getting an invalid path`, () => {
    it('returns 404', (done) => {
      request.get(`${baseURL}/a`, (error, response) => {

        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(404);
        done();
      });
    });

  });

  describe(`Getting a valid path`, () => {
    it('returns 200 ', (done) => {
      request.get(`${baseURL}/`, (error, response) => {
        const jsonBody = JSON.parse(response.body);

        expect(response.statusCode).toEqual(200);
        expect(jsonBody.msg).toEqual("Elimu API");
        expect(jsonBody.version).toEqual("1.0.0");
        done();
      });
    });
  });

});
