/**
 * Created by MinhMan.Tran on 1/11/2016.
 */
(function(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        document.getElementById('filesToUpload').onchange = function(){
            var files = document.getElementById('filesToUpload').files;
            for(var i = 0; i < files.length; i++) {
                resizeAndCrop(files[i]);
            }

            document.querySelector('#gifTheme').onclick = function() {
                var imgTags = Array.apply(null, document.querySelectorAll('#filesInfo img'));
                var imgList = [];
                imgTags.forEach(function(img){
                    imgList.push(img.src);
                });

                gifshot.createGIF({
                    'gifWidth': 400,
                    'gifHeight': 300,
                    'images': imgList,
                    'interval': 1
                }, function (obj) {
                    if (!obj.error) {
                        var image = obj.image,
                            animatedImage = document.createElement('img');
                        animatedImage.src = image;
                        document.body.appendChild(animatedImage);
                    }
                });
            }
        };
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    function resizeAndCrop(file) {
        var reader = new FileReader();
        reader.onloadend = function() {

            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function() {

                var MAX_WIDTH = 400;
                var MAX_HEIGHT = 300;
                var tempW = tempImg.width;
                var tempH = tempImg.height;
                if (tempW > tempH) {
                    if (tempW > MAX_WIDTH) {
                        tempW *= MAX_HEIGHT / tempH;
                        tempH = MAX_HEIGHT;
                    }
                } else {
                    if (tempH > MAX_HEIGHT) {
                        tempH *= MAX_WIDTH / tempW;
                        tempW = MAX_WIDTH;
                    }
                }

                var canvas = document.createElement('canvas');
                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, -(tempW - MAX_WIDTH)/2, -(tempH - MAX_HEIGHT)/2, tempW, tempH);
                var dataURL = canvas.toDataURL("image/jpeg");

                var div = document.createElement('div');
                div.innerHTML = '<img src="' + dataURL + '" alt="" />';
                document.getElementById('filesInfo').appendChild(div);
            }

        };
        reader.readAsDataURL(file);
    }
})();