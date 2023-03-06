const PORT = 3007;
const { clientStore, logger ,getInfuraUrl} = require('./config');
const { providers } =require( 'ethers')

const { SiweMessage,ErrorTypes } = require('siwe')
const express = require('express')

const app = express()


app.use(express.json())
app.use(express.static('public'))

app.get('/challange', (req, res) => {
  const clientId = clientStore.addClient(res)
  clientStore.emit('startTimer', { clientId: clientId, time: 60000 });

});

app.post('/login', async (req, res) => {
  try {
    const { signature } = req.body
    if (!req.body.message) {
      res.status(422).json({ message: 'Expected signMessage object as body.' });
      return;
    }
  
    const message = new SiweMessage(req.body.message);
  
  const fields=await message.validate(signature);
  clientStore.getClient(fields.nonce)
  res.json({
   fields,
    jwt:null
  })



  } catch (e) {
   
    res.status(500).send(e.message)
  
  }


})





app.listen(PORT, () => {
  logger.info("server Started : " + 'http://localhost:' + PORT)
})