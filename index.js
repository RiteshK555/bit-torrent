//fs is for file operations
const fs = require('fs');

//import tracker
const tracker = require('./tracker.js');

//bencode is a type of encoding in torrenting
const bencode = require('bencode');
//torrent files are encoded in bencode format. Here we are decoding the .torrent file

const torrent = bencode.decode(fs.readFileSync('./Jujutsu Kaisen 182 (2022) (Digital).torrent'));
//decoding torrent file

tracker.getPeers(torrent,peers =>{
    console.log('list of peers',peers);
});