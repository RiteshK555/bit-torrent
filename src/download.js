//net module
const net = require('net');

//buffer
const Buffer = require('buffer').Buffer;

//socket 
const socket = new net.Socket();
socket.on('error',(err)=>{
    console.log(err);
});
socket.connect(port,ip,function(){
    socket.write(Buffer.from('Hello World'));
});
socket.on('data',(data)=>{
    });
