const dgram = require('dgram');
//require dgram 

const Buffer = require('buffer').Buffer;
//buffer 

const urlParser = require('url').parse;
//url parser

const crypto = require('crypto');
//crypto

module.exports.getPeers = (torrent,callback)=>{
    const socket = dgram.createSocket('udp4');
    //socket

    const url = torrent["announce-list"][1].toString('utf8');
    //tracker url

    udpSend(socket,buildConnReq(),url);
    //send connection request

    socket.on('message',response => {
        if(respType(response) === 'connect'){
            const connResp = parseConnResp(response);
            //receive and parse connection response

            const announceReq = buildAnnounceResp(connResp.connectionId);
            //send announce request

            udp(socket,announceReq,url);
        }
        else if(respType(response) === 'announce'){
            const announceResp = parseAnnounceResp(response);
            //parse announce response

            callback(announceResp.peers);
        }
    });
};

function udpSend(socket,message,rawUrl,callback=()=>{}){
    const url = urlParser(rawUrl);
    socket.send(message,0,message.length,url.port,url.hostname,callback);
}

function respType(resp){

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

function buildAnnounceResp(connectionId){

}

function parseAnnounceResp(resp){

}