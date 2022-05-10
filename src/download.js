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
    socket.on('data',data =>{
        //
    });
}