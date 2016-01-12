/**
 * Created by MinhMan.Tran on 1/11/2016.
 */


var MAX_WIDTH = 200;
var MAX_HEIGHT = 300;
var cropper;

(function(){
    'use strict';
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        document.querySelector('#filesToUpload').onchange = function(){
            var files = this.files;
            for(var i = 0; i < files.length; i++) {
                resizeAndCrop(files[i], MAX_WIDTH, MAX_HEIGHT);
            }

            document.querySelector('#gifTheme').onclick = function() {
                var imgTags = Array.apply(null, document.querySelectorAll('#filesInfo .main-img'));
                var imgList = [];
                imgTags.forEach(function(img){
                    imgList.push(img.src);
                });

                gifshot.createGIF({
                    'gifWidth': MAX_WIDTH,
                    'gifHeight': MAX_HEIGHT,
                    'images': imgList,
                    'interval': 1
                }, function (obj) {
                    if (!obj.error) {
                        var animatedImage = document.createElement('img');
                        animatedImage.src = obj.image;
                        document.body.appendChild(animatedImage);
                    }
                });
            }
        };
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }


})();

function generateUUID() {
    'use strict';
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function resizeAndCrop(file, MAX_WIDTH, MAX_HEIGHT) {
    'use strict';
    var reader = new FileReader();
    reader.onloadend = function() {
        var tempImg = new Image();
        tempImg.src = reader.result;
        tempImg.onload = function() {
            'use strict';
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
            var id = 'item-' + generateUUID();
            var img = 'img-' + generateUUID();
            var mainImg = 'mainImg-' + generateUUID();
            var popup = 'popup-' + generateUUID();
            var preview = 'preview-' + generateUUID();
            div.className = 'item';
            div.id = id;
            div.innerHTML = '' +
                '<img class="main-img" id="' + mainImg + '" src="' + dataURL + '" alt="" />' +
                '<input class="replace-image" type="file" onchange="replaceImage(this, \'' + mainImg + '\', \'' + img + '\')" />' +
                '<a class="crop-image" href="javascript:void(0);" onclick="cropImage(\'' + popup + '\', \'' + img + '\', \'' + preview + '\');" rel="nofollow">Crop</a>' +
                '<a class="delete-image" href="javascript:void(0);" onclick="deleteImage(\'' + id + '\');" rel="nofollow">Delete</a>' +
                '<div class="popup-image" id="' + popup + '">' +
                '<div class="popup-content">' +
                '<div class="inner">' +
                '<img id="' + img + '" src="' + this.src + '" alt="" />' +
                '</div>' +
                '<div class="controls">' +
                '<div class="preview">' +
                '<figure id="' + preview + '"></figure>' +
                '</div>' +
                '<button onclick="cropIt(\'' + mainImg + '\', \'' + popup + '\');">OK</button>' +
                '<button onclick="closePopup(\'' + popup + '\');">Cancel</button>' +
                '</div>' +
                '<a class="popup-close" href="javascript:void(0);" onclick="closePopup(\'' + popup + '\');" rel="nofollow">x</a>' +
                '</div>' +
                '<a class="overlay" href="javascript:void(0);" onclick="closePopup(\'' + popup + '\');"></a>' +
                '</div>';
            document.querySelector('#filesInfo').appendChild(div);
        }

    };
    reader.readAsDataURL(file);
}

function cropImage(popup, img, preview){
    'use strict';
    document.querySelector('#' + popup).className = 'popup-image open';

    cropper = new Cropper(document.querySelector('#' + img), {
        viewMode: 1,
        aspectRatio: MAX_WIDTH/MAX_HEIGHT,
        minCropBoxWidth: MAX_WIDTH,
        minCropBoxHeight: MAX_HEIGHT,
        preview: '#' + preview,
        dragMode: 'move',
        cropBoxMovable: false,
        cropBoxResizable: false
    });
}
function closePopup(popup){
    'use strict';
    document.querySelector('#' + popup).className = 'popup-image';
    cropper.destroy();
}
function deleteImage(item){
    'use strict';
    var itemEle = document.querySelector('#' + item);
    var papa = document.querySelector('#filesInfo');
    papa.removeChild(itemEle);
}
function replaceImage(ele, mainImg, img){
    'use strict';
    var mainEle = document.querySelector('#' + mainImg);
    var imgEle = document.querySelector('#' + img);
    var files = ele.files;
    var reader = new FileReader();
    reader.onloadend = function() {
        var tempImg = new Image();
        tempImg.src = reader.result;
        tempImg.onload = function() {
            'use strict';
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

            mainEle.src = dataURL;
            imgEle.src = this.src;
        }

    };
    reader.readAsDataURL(files[0]);
}
function cropIt(mainImg, popup){
    'use strict';
    var mainEle = document.querySelector('#' + mainImg);
    mainEle.src = cropper.getCroppedCanvas().toDataURL("image/jpeg");
    closePopup(popup);
}
