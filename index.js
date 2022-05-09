//fs is for file operations
const fs = require('fs');

//import tracker
const tracker = require('./tracker.js');

//torrent parser
const torrentParser = require('./torrent-parser.js');

//bencode is a type of encoding in torrenting
const bencode = require('bencode');
//torrent files are encoded in bencode format. Here we are decoding the .torrent file

//torrent parser
const torrent = torrentParser.open('./Jujutsu Kaisen 182 (2022) (Digital).torrent');

//log

tracker.getPeers(torrent,peers =>{
    console.log('list of peers',peers);
});