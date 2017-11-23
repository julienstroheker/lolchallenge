


const express = require('express')
const request = require('request');
var bodyParser = require('body-parser');



const app = express()
var options = {
    inflate: true,
    limit: '1000kb',
    type: 'application/octet-stream'
  };
app.use(bodyParser.raw(options));


app.use(express.static('public'));
function btoa(str) {
    if (Buffer.byteLength(str) !== str.length)
      throw new Error('bad string!');
    return Buffer(str, 'binary').toString('base64');
}
const makeblob = (dataURL) => {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);
        return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
};

const sendImage = (imgDataUrl, res) => {
    // let image = makeblob(imgDataUrl);
    
    request({
        method: 'POST',
        uri: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?",
        headers: {
            'Content-type':'application/octet-stream' ,
            'Ocp-Apim-Subscription-Key': `${process.env.API_KEY}`
        },
        body: makeblob(imgDataUrl.toString('base64')),
      },
      function (error, response, body) {
        if (error) {
          return console.error('upload failed:', error);
        }
        console.log('Upload successful!  Server responded with:', body);
        res.send('res', response);
        
      })
}

//app.get('/', (req, res) => res.send('Hello World!'))
app.post('/sendimage',(req, res) => {
    // res.send('Hello World!')
    console.log('here', req.body.toString('base64'))
    sendImage(req.body, res);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))