const fs = require('fs');
const crypto = require('crypto');


const privateKey = fs.readFileSync('bpp_private_key.pem','utf-8')
const certificate = fs.readFileSync('bpp_certificate.pem','utf-8')

const becknJson = {
    provider: {
        name: 'xyz',
        certUrl: 'https://example.com/cert',
        // ... other provider details
    },
    catalog: [

    ],
    // ..other fields
}


const sign = crypto.createSign('SHA256');
sign.write(JSON.stringify(becknJson));
sign.end();

const signature = sign.sign(privateKey, 'base64');


const signedBecknJson = {
    payload: becknJson,
    signature
};


fs.writeFileSync('beckn.json', JSON.stringify(signedBecknJson));

// (e.g., copy it to a web server's document root to host it)