(function () {
    'use strict';
    // MakeBlob allow to format a real octet-stream
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
    // Call the backend to send the picture to Azure
    const sendImage = (imagePath) => {
        let img = makeblob(imagePath)
        $.ajax({
            // NOTE: You must use the same location in your REST call as you used to obtain your subscription keys.
            //   For example, if you obtained your subscription keys from westcentralus, replace "westus" in the 
            //   URL below with "westcentralus".
            url: "/sendimage",
            // beforeSend: function(xhrObj){
            //     // Request headers, also supports "application/octet-stream"
            //     xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            // },
            contentType: 'application/octet-stream',
            type: "POST",
            processData: false,
            // Request body
            data: img,
            success: function (data) {
                // Get face rectangle dimensions

                var faceRectangle = data[0].faceRectangle;
                var faceRectangleList = $('#faceRectangle');
                faceRectangleList.html("")

                // Append to DOM
                for (var prop in faceRectangle) {
                    faceRectangleList.append("<li> " + prop + ": " + faceRectangle[prop] + "</li>");
                }

                // Get emotion confidence scores
                var scores = data[0].scores;
                var scoresList = $('#scores');
                scoresList.html("")

                // Append to DOM
                for (var prop in scores) {
                    scoresList.append("<li> " + prop + ": " + scores[prop] + " = " + (scores[prop]*100).toFixed(2) + "</li>")
                }
            }
        });
    }
    var video = document.querySelector('video')
        , canvas;

    /**
     *  generates a still frame image from the stream in the <video>
     *  appends the image to the <body>
     */
    function takeSnapshot() {
        var img = document.querySelector('img') || document.createElement('img');
        var context;
        var width = video.offsetWidth
            , height = video.offsetHeight;

        canvas = canvas || document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, width, height);

        img.src = canvas.toDataURL('image/png');
        //document.body.appendChild(img);
        sendImage(img.src);
    }

    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (navigator.mediaDevices) {
        // access the web cam
        navigator.mediaDevices.getUserMedia({ video: true })
            // permission granted:
            .then(function (stream) {
                video.src = window.URL.createObjectURL(stream);
                video.addEventListener('click', takeSnapshot);
            })
            // permission denied:
            .catch(function (error) {
                document.body.textContent = 'Could not access the camera. Error: ' + error.name;
            });
    }
})();