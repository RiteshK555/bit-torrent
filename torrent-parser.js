const fs = require('fs');
//fs

const bencode = require('bencode');
//bencode

module.exports.open = (filepath)=>{
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent =>{
    //
}

module.exports.infoHash = torrent =>{
    //
}