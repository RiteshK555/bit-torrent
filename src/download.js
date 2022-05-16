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

//hex-to-binary
const hexToBinary = require('hex-to-binary');

//socket 
module.exports = (torrent,name) =>{
    //for each peer
    // const requested = [];
    tracker.getPeers(torrent,peers =>{
        // console.log(peers);
        const pieces = new Pieces(torrent);
        // console.log(pieces.sz());
        const file = fs.openSync('./'+name,'w');
        peers.forEach(peer => {
            download(peer,torrent,pieces,file);
        });
    });    
}

function download(peer,torrent,pieces,file){
    const socket = net.createConnection(peer.port,peer.ip);
    socket.on('connect',()=>{
        socket.write(message.buildHandshake(torrent));
    });
    socket.on('error',err=>{
        console.log(err);
        socket.end();
        return;
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket,msg=>{
        msgHandler(msg,socket,pieces,queue,file,peer,torrent);
    });
}

function msgHandler(msg,socket,pieces,queue,file,peer,torrent,flag){
    // console.log(isHandshake(msg,peer));
    if(isHandshake(msg)){
        console.log("handshake done");
        socket.write(message.buildIntrested()); 
    }else{
        const m = message.parse(msg);
        console.log(peer," ",msg.length," ",m.id);
        if(m.id === 0)chokeHandler(socket);
        if(m.id === 1)unchokeHandler(socket,pieces,queue);
        if(m.id === 4)haveHandler(socket,pieces,queue,m.payload);
        //socket,pieces,queue,payload
        if(m.id === 5)bitfieldHandler(socket,pieces,queue,m.payload);
        //socket,pieces,queue,torrent,pieceResp
        if(m.id === 7)pieceHandler(socket,pieces,queue,torrent,m.payload,file,flag);
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
    const prse = hexToBinary(payload.toString('hex'));
    for(let i = 0;i<prse.length;i++){
        if(prse[i] === '1'){
            queue.queue(i);
        }
    }
    
    if(queueEmpty)requestPiece(socket,pieces,queue);
}
function pieceHandler(socket,pieces,queue,torrent,pieceResp,file){
    pieces.addRecieved(pieceResp);
    console.log(pieceResp);

    const offset = pieceResp.index * torrent.info['piece length'] + pieceResp.begin;
    fs.write(file,pieceResp.block,0,pieceResp.block.length,offset,()=>{

    })
    if(pieces.isDone() === true){
        console.log("DONE---------------");
        // flag = false;
        socket.end();
    }else{
        requestPiece(socket,pieces,queue);
    }
}

function requestPiece(socket,pieces,queue){
    console.log("requesting a piece")
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
    // console.log(peer);
    // console.log(msg.toString('utf8',1,20));
    return msg.length === (49+msg.readUInt8(0)) && msg.toString('utf8',1,20) === 'BitTorrent protocol';
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
        //console.log(savedBuf.readUInt8(0));
        //console.log(peer);
        //handshake msg len is 49 + len of pstr and other msgs are standard
        const msgLen = ()=> handshake? savedBuf.readUInt8(0)+49 : savedBuf.readUInt32BE(0)+4;
        while(savedBuf.length >= 4 && savedBuf.length >= msgLen()){
            callback(savedBuf.slice(0,msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
        }
    });
}