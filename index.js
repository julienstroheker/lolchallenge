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

const sendImage = (imgDataUrl, res) => {
    request({
        method: 'POST',
        uri: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?",
        headers: {
            'Content-type':'application/octet-stream' ,
            'Ocp-Apim-Subscription-Key': `${process.env.API_KEY}`
        },
        //body: makeblob(imgDataUrl.toString('base64')),
        body: imgDataUrl,
      },
      function (error, response, body) {
        if (error) {
          return console.error('upload failed:', error);
        }
        //console.log('Upload successful!  Server responded with:', body);
        res.send(JSON.parse(body));
      })
}

app.post('/sendimage',(req, res) => {
    //console.log('here', req.body.toString('base64'))
    sendImage(req.body, res);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))