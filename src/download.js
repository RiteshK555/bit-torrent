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

//queue
const Queue = require('./queue.js');

const fs = require('fs');

//socket 
module.exports = torrent =>{
    //for each peer
    // const requested = [];
    tracker.getPeers(torrent,peers =>{
        const pieces = new Pieces(torrent);
        const file = fs.openSync(path,'w');
        peers.forEach(peer => {
            download(peer,torrent,pieces,file);
        });
    });    
}

function download(peer,torrent){
    const socket = net.createConnection(peer.port,peer.ip);
    socket.on('connect',()=>{
        socket.write(message.buildHandshake(torrent));
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket,msg=>msgHandler(msg,socket,requested,queue));
}

function msgHandler(msg,socket,pieces,queue){
    if(isHandshake(msg)){
        socket.write(message.buildIntrested()); 
    }else{
        const m = message.parse(msg);
        if(m.id === 0)chokeHandler(socket);
        if(m.id === 1)unchokeHandler(socket,pieces,queue);
        if(m.id === 4)haveHandler(socket,pieces,queue,m.payload);
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
function haveHandler(socket,pieces,queue,payload){
    const pieceIndex = payload.readUInt32BE(0);
    const queueEmpty = queue.length() === 0;
    queue.queue(pieceIndex);
    if(queueEmpty)requestPiece(socket,pieces,queue);
}
function bitfieldHandler(socket,pieces,queue,payload){
    const queueEmpty = queue.length() === 0;
    payload.forEach((byte,i)=>{
        for(let j=0; j<8 ;j++){
            if(byte % 2){
                queue.queue(i*8 + 7-j);
                byte = byte >> 1;
            }
        }
    });
    if(queueEmpty)requestPiece(socket,pieces,queue);
}
function pieceHandler(socket,pieces,queue,torrent,pieceResp){
    pieces.addRecieved(pieceResp);
    console.log(pieceResp);

    const offset = pieceResp.index * torrent.info['piece length'] + pieceResp.begin;
    fs.write(file,pieceResp.block,0,pieceResp.block.length,offset,()=>{

    })
    if(pieces.isDone()){
        socket.end();
        console.log("DONE---------------");
    }else{
        requestPiece(socket,pieces,queue);
    }
}

function requestPiece(socket,pieces,queue){
    if(queue.choked)return null;
    while(queue.length()){
        const pieceBlock = queue.deque();
        if(pieces.needed(pieceBlock)){
            socket.write(message.buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
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