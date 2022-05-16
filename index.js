//fs is for file operations
const fs = require('fs');

//import tracker
const tracker = require('./src/tracker.js');

//torrent parser
const torrentParser = require('./src/torrent-parser.js');

//download
const download = require('./src/download.js');

//bencode is a type of encoding in torrenting
const bencode = require('bencode');
//torrent files are encoded in bencode format. Here we are decoding the .torrent file

//torrent parser
const torrent = torrentParser.open('./Jujutsu Kaisen 182 (2022) (Digital).torrent');

//log
console.log(torrent);
// torrent['announce-list'].forEach(tracker=>{
//     console.log(tracker.toString('utf8'));
// })
//tcp 
// const trackerTcp = require('./src/tracker_tcp.js');
// trackerTcp.getPeers(torrent);

//download torrent
download(torrent,torrent.info.name.toString('utf8'));