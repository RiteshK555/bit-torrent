//fs
const fs = require('fs');

//bencode
const bencode = require('bencode');

//crypto
const crypto = require('crypto');

//bignum
const bignum = require('bignum');

module.exports.open = (filepath)=>{
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent =>{
    var size = bignum('0');
    size = torrent.info.files?
        torrent.info.files.map(file => file.length).reduce((a,b)=>a+b):torrent.info.length;
    return bignum.toBuffer(size,{size:8});
}

module.exports.infoHash = torrent =>{
    //we have to encode before hashing
    console.log(torrent);
    const info = bencode.encode(torrent.info);
    //returns a buffer of 20 bytes cz its sha1
    return crypto.createHash('sha1').update(info).digest();
}