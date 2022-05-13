//net module
const net = require('net');

//buffer
const Buffer = require('buffer').Buffer;

//tracker 
const tracker = require('./tracker.js');

//message
const message = require('./message.js');

//socket 
module.exports = torrent =>{
    //for each peer
    tracker.getPeers(torrent,peers =>{
        peers.forEach(download);
    });    
}

function download(peer,torrent){
    const socket = net.createConnection(peer.port,peer.ip);
    socket.on('connect',()=>{
        socket.write(message.buildHandshake(torrent));
    });
    onWholeMsg(socket,msg=>msgHandler(msg,socket));
}

function msgHandler(msg,socket){
    if(isHandshake(msg))socket.write(message.buildIntrested());
}

function isHandshake(msg){
    return msg.length === 49+msg.readUInt8(0) && msg.toString('utf8',1) === 'BitTorrent protocol';
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