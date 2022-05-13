//net module
const net = require('net');

//buffer module
const Buffer = require('buffer').Buffer;

//urlParser
const urlParser = require('url').parse;

module.exports.getPeers = (torrent) =>{
    const parsedUrl = urlParser(torrent.announce.toString('utf8'));
    const socket = net.createConnection(parsedUrl.port,parsedUrl.hostname);
    socket.on('connect',(err)=>{
        console.log("connected");
        socket.write("hello");
        console.log(err);
    });
    socket.on('data',data =>{
        console.log(data);
    });
}