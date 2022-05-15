//fs
const fs = require('fs');

//bencode
const bencode = require('bencode');

//crypto
const crypto = require('crypto');

//bignum
const bignum = require('bignum');

//len of each block
module.exports.BLOCK_LEN = Math.pow(2,14);

//piece len
module.exports.pieceLen = (torrent,pieceIndex)=>{
    const totalLength = bignum.fromBuffer(this.size(torrent)).toNumber();
    const pieceLength = torrent.info['piece length'];
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength); 
    return pieceIndex === lastPieceIndex ? lastPieceLength : pieceLength;
}

//blocks per piece
module.exports.blocksPerPiece = (torrent,pieceIndex)=>{
    const pieceLength = this.pieceLen(torrent,pieceIndex);
    return Math.ceil(pieceLength / this.BLOCK_LEN);
}

//blockLen
module.exports.blockLen = (torrent,pieceIndex,blockIndex)=>{
    const pieceLength = this.pieceLen(torrent,pieceIndex);
    const lastPieceLength = pieceLength % this.BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);
    return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;
}
module.exports.open = (filepath)=>{
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent =>{
    var size = bignum('0');
    size = torrent.info.files?
        torrent.info.files.map(file => file.length).reduce((a,b)=>a+b):torrent.info.length;
    return bignum.toBuffer(size,{size:8});
}

let savedInfoHash = null;
module.exports.infoHash = torrent =>{
    //we have to encode before hashing
    const info = bencode.encode(torrent.info);

    //returns a buffer of 20 bytes cz its sha1
    if(savedInfoHash === null){
        savedInfoHash = crypto.createHash('sha1').update(info).digest();
    } 
    return savedInfoHash;
}
