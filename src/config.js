const ClientStore = require('./store/clientStore')
const TokenStore = require('./store/tokenStore')
const log = require("simple-node-logger")


const getInfuraUrl = (chainId) => {
    switch (chainId) {
        case 1:
            return 'https://mainnet.infura.io/v3';
        case 3:
            return 'https://ropsten.infura.io/v3';
        case 4:
            return 'https://rinkeby.infura.io/v3';
        case 5:
            return 'https://goerli.infura.io/v3';
        case 137:
            return 'https://polygon-mainnet.infura.io/v3';
    }
};

 function getFormatedMessage(op, data) {
    return JSON.stringify({
        op,
        data
    })
}
const clientStore = new ClientStore();
const tokenStore = new TokenStore();

// LOGGING
const log_path = "hypersign-auth.log";

const logger = log.createSimpleLogger({
    logFilePath: log_path,
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS"
});

logger.setLevel("debug");
  

clientStore.on('startTimer', (args) => {
    try{
        const { clientId, time } = args;
        const { connection } = clientStore.getClient(clientId)
        if(connection) connection.json({challange:clientId,validforsec:time })

        setTimeout(() => {
            clientStore.emit('deleteClient', { clientId });
        }, time)        
    }catch(e){
        logger.error(e);
    }
})

clientStore.on('deleteClient', (args) => {
    try{
        const { clientId } =  args;
        clientStore.deleteClient(clientId);
    }catch(e){
        logger.error(e);
    }
})

module.exports = {
    clientStore,
    tokenStore,
    logger
    ,getInfuraUrl
}