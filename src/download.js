//net module
const net = require('net');

//buffer
const Buffer = require('buffer').Buffer;

//tracker 
const tracker = require('./tracker.js');

//socket 
module.exports = torrent =>{
    //for each peer
    tracker.getPeers(torrent,peers =>{
        peers.forEach(download);
    });    
}

function download(peer){
    const socket = net.createConnection(peer.port,peer.ip);
    socket.on('connect',()=>{
        //
    });
    onWholeMsg(socket,data=>{
        //
    });
}

//onwholemsg
function onWholeMsg(socket,callback){
    let savedBuf = Buffer.alloc(0);
    let handshake = true;
    //tcp messages are broken into pieces
    //multiple messages may appear at same time or
    //as broken messages
    //initially a handshake message is passed.
    socket.on('data',recvBuf=>{
        savedBuf = Buffer.concat([savedBuf,recvBuf]);
        //handshake msg len is 49 + len of pstr and other msgs are standard
        const msgLen = ()=> handshake? savedBuf.readUInt32BE(0)+49 : savedBuf.readUInt32BE(0)+4;
        while(savedBuf.length >= 4 && savedBuf.length >= msgLen()){
            callback(savedBuf.slice(0,msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
        }
    });
}