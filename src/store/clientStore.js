const EventEmitter = require('events');
const crypto = require('crypto');

function generateRandomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  return result;
}

class Client {
  constructor(connection) {
    this.clientId = generateRandomString(32);
    this.connection = connection;
    this.isAuthenticated = false;
    this.accessToken = null;
    this.refreshToken = null;
  }
}

module.exports = class ClientStore extends EventEmitter {
  constructor() {
    super();
    this.clients = {}; //in-mem store
  }

  addClient(connection) {
    // if (!connection) throw new Error('Connection is null')
    const client = new Client(connection);
    this.clients[client.clientId] = client;
    return client.clientId;
  }

  getClient(clientId) {
    if (!this.clients[clientId]) throw new Error('HS-AUTH-NODE-SDK:: Error: Invalid challenge');
    return this.clients[clientId];
  }

  updateClient(clientId, connection, isAuthenticated, accessToken, refreshToken) {
    if (!this.clients[clientId]) throw new Error('HS-AUTH-NODE-SDK:: Error: Invalid challenge');
    let updatedClient = this.clients[clientId];
    if (connection) updatedClient['connection'] = connection;
    if (isAuthenticated) updatedClient['isAuthenticated'] = isAuthenticated;
    if (accessToken) updatedClient['accessToken'] = accessToken;
    if (refreshToken) updatedClient['refreshToken'] = refreshToken;
    this.clients[clientId] = updatedClient;
    return updatedClient;
  }

  deleteClient(clientId) {
    //if (!this.clients[clientId]) throw new Error('HS-AUTH-NODE-SDK:: Error: Client does not exist')
    delete this.clients[clientId];
    return Object.keys(this.clients).length;
  }

  getAllClientIds() {
    return Object.keys(this.clients);
  }
};
