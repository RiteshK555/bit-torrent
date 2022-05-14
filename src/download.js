//net module
const net = require('net');

//buffer
const Buffer = require('buffer').Buffer;

//tracker 
const tracker = require('./tracker.js');

//message
const message = require('./message.js');

//pieces 
const Pieces = require('./pieces.js');

//socket 
module.exports = torrent =>{
    //for each peer
    const requested = [];
    tracker.getPeers(torrent,peers =>{
        const pieces = new Pieces(torrent.info.pieces.length/20);
        peers.forEach(peer => {
            download(peer,torrent,pieces);
        });
    });    
}

function download(peer,torrent,pieces){
    const socket = net.createConnection(peer.port,peer.ip);
    socket.on('connect',()=>{
        socket.write(message.buildHandshake(torrent));
    });
    const queue = {
        choked:true,
        queue:[]
    };
    onWholeMsg(socket,msg=>msgHandler(msg,socket,requested,queue));
}

function msgHandler(msg,socket,pieces,queue){
    if(isHandshake(msg)){
        socket.write(message.buildIntrested()); 
    }else{
        const m = message.parse(msg);
        if(m.id === 0)chokeHandler(socket);
        if(m.id === 1)unchokeHandler(socket,pieces,queue);
        if(m.id === 4)haveHandler(m.payload);
        if(m.id === 5)bitfieldHandler(m.payload);
        if(m.id === 7)pieceHandler(m.payload);
    }
}

function chokeHandler(socket) {
    socket.end();
}
function unchokeHandler(socket,pieces,queue) {
    //
    queue.choked = false;
    requestPiece(socket,pieces,queue);
}
function haveHandler(payload,socket,requested,queue){
    const pieceIndex = payload.readUInt32BE(0);
    if(!requested[pieceIndex]){
        socket.write(message.buildRequest());
        requested[pieceIndex] = true;
    }
    queue.push(pieceIndex);
    if(queue.length === 1){
        requestPiece(socket,requested)
    }
    
}
function bitfieldHandler(payload){}
function pieceHandler(payload,socket,requested,queue){
    queue.shift();
    requestPiece(socket,requested,queue);
}

function requestPiece(socket,pieces,queue){
    if(queue.choked)return null;
    while(queue.queue.length){
        const pieceIndex = queue.shift();
        if(pieces.needed(pieceIndex)){
            socket.write(message.buildRequest(pieceIndex));
            pieces.addRequested(pieceIndex);
            break;
        }
    }
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