const {SiweMessage} = require('siwe');
const {ethers}=require('ethers')
const WalletConnect=require('@walletconnect/web3-provider')
const Providers={
    METAMASK : 'metamask',
    WALLET_CONNECT : 'walletconnect',
}
const metamask = window.ethereum;

let provider;

const signIn=async (connector,nonce)=>{
    if (connector == 'metamask') {
        await metamask.request({
            method: 'eth_requestAccounts',
        });
        provider = new ethers.providers.Web3Provider(window.ethereum);
    }else {
       let walletconnect = new WalletConnect.default({
            infuraId: 'af0bc46b1e3e422b8ac2d9fda7a529d8',
        });
        walletconnect.enable();
        provider = new ethers.providers.Web3Provider(walletconnect);

    }   


    const [address] = await provider.listAccounts();

    if (!address) {
        throw new Error('Address not found.');
    }
    let ens;
    try {
        ens = await provider.lookupAddress(address);
    } catch (error) {
        console.error(error);
    }
    const message = new SiweMessage({
        domain: document.location.host,
        address,
        chainId: await provider.getNetwork().then(({ chainId }) => chainId),
        uri: document.location.origin,
        expirationTime:new Date(new Date().getTime()+2*60*60*1000).toISOString(),
        version: '1',
        statement: 'app Wants to authenticate',
        nonce,
    });
    
    if(Providers.WALLET_CONNECT==connector){
        const walletconnectObj=JSON.parse(localStorage.getItem('walletconnect'))
        alert("Please Check Your "+walletconnectObj?.peerMeta?.description + ". After clicking ok ")
    }
    const signature = await provider.getSigner().signMessage(message.prepareMessage());
    return {signature,message}


}


async function getChallange(){
    const resp=await  fetch('http://localhost:3007'+'/challange',{
        method:'GET'
    })
    return await resp.json()
}

const login=async (signature,message)=>{
    const resp=await fetch('http://localhost:3007/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            signature,message
        })
    })
    return await resp.json()

}

document.getElementById('walletconnect').addEventListener('click',async ()=>{
const data=await getChallange()
const {signature,message}=await signIn(Providers.WALLET_CONNECT,data.challange)
const loggedin=await login(signature,message)
localStorage.setItem('loggedin',JSON.stringify(loggedin))
changeUI()
alert(JSON.stringify(loggedin,null,2))

})



document.getElementById('metamask').addEventListener('click',async ()=>{

    const data=await getChallange()
   const {signature,message}=await signIn(Providers.METAMASK,data.challange)
  const loggedin= await login(signature,message)
  localStorage.setItem('loggedin',JSON.stringify(loggedin))
  changeUI()

  alert(JSON.stringify(loggedin,null,2))

})

document.getElementById('logout').addEventListener('click',signOut)

function signOut(){
     localStorage.clear()
     document.getElementById('walletconnect').style.display="flex"
     document.getElementById('metamask').style.display="flex"
     changeUI()


}



const changeUI=()=>{
const loggedin=JSON.parse(localStorage.getItem('loggedin'))

if(loggedin?.fields?.address){
    document.getElementById('walletconnect').style.display="none"
    document.getElementById('metamask').style.display="none"
    document.getElementById('logout').style.display="flex"

}else{
    document.getElementById('logout').style.display="none"

}
}

changeUI()