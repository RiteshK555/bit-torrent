const dgram = require('dgram');
//require dgram 

const Buffer = require('buffer').Buffer;
//buffer 

const urlParser = require('url').parse;
//url parser

const crypto = require('crypto');
//crypto

const torrentParser = require('./torrent-parser')

const util = require('./util.js');
//util

module.exports.getPeers = (torrent,callback)=>{
    const socket = dgram.createSocket('udp4');
    //socket

    const url = torrent["announce-list"][4].toString('utf8');
    //tracker url
    // console.log(url);
    udpSend(socket,buildConnReq(),url);
    //send connection request

    socket.on('message',response => {
        console.log("server sent response");
        if(respType(response) === 'connect'){
            const connResp = parseConnResp(response);
            //receive and parse connection response
            const port = urlParser(url).port;
            const announceReq = buildAnnounceReq(connResp.connectionId,torrent,);
            //send announce request

            udpSend(socket,announceReq,url);
            //sending announce req through udp socket
        }
        else if(respType(response) === 'announce'){
            console.log("announce");
            const announceResp = parseAnnounceResp(response);
            //parse announce response
            callback(announceResp.peers);
        }
    });
};

function udpSend(socket,message,rawUrl,callback=()=>{}){
    const url = urlParser(rawUrl);
    socket.send(message,0,message.length,url.port,url.hostname,callback);
    console.log("message sent");
    console.log(url.port);
}

function respType(resp){
    const action = resp.readUInt32BE(0);
    if(action === 0)return 'connect'
    else if(action === 1)return 'announce'
    else return 'unknown'
}

function buildConnReq(){
    const buf = Buffer.alloc(16);
    //connection id
    buf.writeUInt32BE(0x417,0);
    buf.writeUInt32BE(0x27101980,4);

    //action
    buf.writeUInt32BE(0,8);

    //transaction id
    crypto.randomBytes(4).copy(buf,12);
    return buf;
}

function parseConnResp(resp){
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8)
    }
}

function buildAnnounceReq(connectionId,torrent,port){
    const buf = Buffer.allocUnsafe(98);
    

    //connection id 
    connectionId.copy(buf,0);

    //action
    buf.writeUInt32BE(1,8);

    //transaction id
    crypto.randomBytes(4).copy(buf,12);

    //info hash
    torrentParser.infoHash(torrent).copy(buf,16);

    //peer id
    util.genId().copy(buf,36);

    //downloaded
    Buffer.alloc(8).copy(buf,56);

    //left 
    torrentParser.size(torrent).copy(buf,64);

    //uploaded
    Buffer.alloc(8).copy(buf,72);

    //event
    buf.writeUInt32BE(0,80);

    //ip address
    buf.writeUInt32BE(0,84);

    //key
    crypto.randomBytes(4).copy(buf,88);

    //num want
    buf.writeInt32BE(-1,92);

    //port
    buf.writeUInt16BE(port,96);

    return buf;
}

function parseAnnounceResp(resp){
    function group(iterable,groupSize){
        let groups = [];
        for(let i=0;i<iterable.length;i+=groupSize){
            groups.push(iterable.slice(i,i+groupSize));
        }
        return groups;
    }
    return {
        action :resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        interval: resp.readUInt32BE(8),
        leechers: resp.readUInt32BE(12),
        seeders: resp.readUInt32BE(16),
        peers:group(resp.slice(20),6).map(address =>{
            return {
                //ip address 51.22.22.22 
                //4 bytes
                ip: address.slice(0,4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }
}