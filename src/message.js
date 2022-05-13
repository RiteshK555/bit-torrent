//buffer
const Buffer = require('buffer').Buffer;

//torrentParser
const torrentParser = require('./torrent-parser');

module.exports.buildHandshake = torrent =>{
    //buffer
    const buf = Buffer.alloc(68);

    //pstr len
    //writing len of string (19) at pos 0
    buf.writeUInt8(19,0);

    //pstr
    buf.write('BitTorrent protocol',1);

    //reserved
    buf.writeUInt32BE(0,20);
    buf.writeUInt32BE(0,24);

    //info hash
    torrentParser.infoHash(torrent).copy(buf,28);

    //peer id
    buf.write(util.genId(),48);
    
    return buf;
}

//buildKeepAlive 
//peers may close connection if they don't recieve messages for certain
//amount of time, keep alive message is needed to maintain connection.
//2min 
module.exports.buildKeepAlive =()=> Buffer.alloc(4);

//buildChoke
module.exports.buildChoke =()=>{
    const buf = Buffer.alloc(5);
    
    //len 1
    buf.writeUInt32BE(1,0);

    //id 0
    buf.writeUInt8(0,4);

    return buf;
}

//buildUnchoke
module.exports.buildUnchoke = ()=>{
    const buf = Buffer.alloc(5);

    //len
    buf.writeUInt32BE(1,0);
    
    //id 1
    buf.writeUInt8(1,4);

    return buf;
}

//buildIntrested
module.exports.buildIntrested = ()=>{
    const buf = Buffer.alloc(5);

    //len
    buf.writeUInt32BE(1,0);

    //id 2
    buf.writeUInt8(2,4);

    return buf;
}

//buildUnintrested 
module.exports.buildUnintrested =() =>{
    const buf = Buffer.alloc(5);

    //len
    buf.writeUInt32BE(1,0);

    //id 3
    buf.writeUInt8(3,4);

    return buf;
}

//buildHave
module.exports.buildHave =(payload)=>{
    const buf = Buffer.alloc(5);

    //len
    buf.writeUInt32BE(5,0);

    //id 4
    buf.writeUInt8(4,4);

    //payload
    //here the payload is piece index
    buf.writeUInt32BE(payload,5);

    return buf;
}

//buildBitfield
module.exports.buildBitfeild = (payload)=>{
    const buf = Buffer.alloc(payload.length+5);

    //len
    buf.writeUInt32BE(payload.length+1,0);

    //id 5
    buf.writeUInt8(5,4);

    //payload
    payload.copy(buf,5);

    return buf;
}

//buildRequest
module.exports.buildRequest= (payload)=>{
    //generally 16kb is used for each piece size
    const buf = Buffer.alloc(17);

    //len
    buf.writeUInt32BE(13,0);

    //id 6
    buf.writeUInt8(6,4);

    //index
    buf.writeUInt32BE(payload.index,5);

    //begin
    buf.writeUInt32BE(payload.begin,9);

    //length
    buf.writeUInt32BE(payload.length,13);

    return buf;
}

//buildPiece
module.exports.buildPiece = (payload)=>{
    const buf = Buffer.alloc(13+payload.block.length);

    //len
    buf.writeUInt32BE(payload.block.length+9,0);

    //id 7
    buf.writeUInt8(7,4);

    //index
    buf.writeUInt32BE(payload.index,5);

    //begin
    buf.writeUInt32BE(payload.begin,9);

    //block
    payload.block.copy(buf,13);

    return buf;
}

//cancel
module.exports.buildCancel = payload =>{
    const buf = Buffer.alloc(17);

    //len
    buf.writeUInt32BE(13,0);

    //id 8
    buf.writeUInt8(8,4);

    //index
    buf.writeUInt32BE(payload.index,5);

    //begin
    buf.writeUInt32BE(payload.begin,9);

    //length
    buf.writeUInt32BE(payload.length,13);

    return buf;
}

//buildPort
module.exports.buildPort = (payload)=>{
    const buf = Buffer.alloc(7);

    //len
    buf.writeUInt32BE(3,0);

    //id
    buf.writeUInt8(9,4);

    //listen port
    buf.writeUInt16BE(payload,5);

    return buf;
}

//handling other messages
module.exports.parse = (msg)=>{
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    
    let payload_ = msg.length > 5 ? msg.slice(5) : null;

    if(id === 6 || id === 7 || id === 8){
        const rest = payload_.slice(8);
        payload = {
            index: payload_.readUInt32BE(0),
            begin: payload_.readUInt32BE(4),
        };
        payload[id===7 ? 'block' : 'length'] = rest;
    }
    return {
        size: msg.readUInt32BE(0),
        id: id,
        payload: payload
    }
}