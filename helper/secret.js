var crypto = require('crypto');

let Secret = new(function () {
    let world_enc = "utf8";
    let secret_enc = "hex";
    let key = "my_secret_key";

    this.hide = function (payload) {
        let cipher = crypto.createCipher('aes128', key);
        let hash = cipher.update(payload, world_enc, secret_enc);
        hash += cipher.final(secret_enc);
        return hash;
    };
    this.reveal = function (hash) {
        let sha1 = crypto.createDecipher('aes128', key);
        let payload = sha1.update(hash, secret_enc, world_enc);
        payload += sha1.final(world_enc);
        return payload;
    }
});

module.exports = Secret;