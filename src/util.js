const crypto = require('crypto');
//crypto

let id = null;

//genId
module.exports.genId = () =>{
    if(id === null){
        id = crypto.randomBytes(20);
        Buffer.from('-AT0001-').copy(id,0);
        //client name and version number
    }
    return id;
}

//id
module.exports.id = ()=>{
    if(id !== null){
        return id;
    }
}