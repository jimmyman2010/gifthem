/**
 * Created by MinhMan.Tran on 1/11/2016.
 */


var MAX_WIDTH = 200;
var MAX_HEIGHT = 300;
var cropper;

(function(){
    'use strict';
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        document.querySelector('#filesToUpload').addEventListener('change', function(){
            var files = this.files;
            for(var i = 0; i < files.length; i++) {
                initialFile(files[i], MAX_WIDTH, MAX_HEIGHT);
            }
        }, false);
        document.querySelector('#gifTheme').addEventListener('click', function() {
            var imgTags = Array.apply(null, document.querySelectorAll('#filesInfo .main-img'));

            gifshot.createGIF({
                'gifWidth': MAX_WIDTH,
                'gifHeight': MAX_HEIGHT,
                'images': imgTags,
                'interval': 1
            }, function (obj) {
                if (!obj.error) {
                    var animatedImage = document.createElement('img');
                    animatedImage.src = obj.image;
                    document.body.appendChild(animatedImage);
                }
            });
        }, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }


})();

function generateUUID() {
    'use strict';
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
}

function initialFile(file, MAX_WIDTH, MAX_HEIGHT) {
    'use strict';
    var reader = new FileReader();
    reader.onloadend = function() {
        var tempImg = new Image();
        tempImg.src = reader.result;
        tempImg.onload = function() {
            'use strict';

            var dataURL = resizeAndCrop(tempImg, MAX_WIDTH, MAX_HEIGHT);

            var id = 'item-' + generateUUID();
            var img = 'img-' + generateUUID();
            var mainImg = 'mainImg-' + generateUUID();
            var curPreview = 'curPreview-' + generateUUID();
            var popup = 'popup-' + generateUUID();
            var preview = 'preview-' + generateUUID();

            var div = document.createElement('div');
            div.className = 'item';
            div.id = id;
            div.innerHTML = '' +
                '<img class="main-img" id="' + mainImg + '" src="' + dataURL + '" alt="" />' +
                '<input class="replace-image" type="file" onchange="replaceImage(this, \'' + mainImg + '\', \'' + img + '\')" />' +
                '<a class="crop-image" href="javascript:void(0);" onclick="cropImage(\'' + popup + '\', \'' + img + '\', \'' + preview + '\', \'' + mainImg + '\', \'' + curPreview + '\');" rel="nofollow">Crop</a>' +
                '<a class="delete-image" href="javascript:void(0);" onclick="deleteImage(\'' + id + '\');" rel="nofollow">Delete</a>' +
                '<div class="popup-image" id="' + popup + '">' +
                    '<div class="popup-content">' +
                        '<div class="inner">' +
                            '<img id="' + img + '" src="' + this.src + '" alt="" />' +
                        '</div>' +
                        '<div class="controls">' +
                            '<div class="preview" id="' + curPreview + '"></div>' +
                            '<div class="preview">' +
                                '<figure id="' + preview + '"></figure>' +
                            '</div>' +
                            '<div class="action-crop">' +
                                '<button onclick="cropIt(\'' + mainImg + '\', \'' + popup + '\');">OK</button>' +
                                '<button onclick="closePopup(\'' + popup + '\');">Cancel</button>' +
                            '</div>' +
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

function resizeAndCrop(tempImg, MAX_WIDTH, MAX_HEIGHT){
    'use strict';
    var canvas = document.createElement('canvas');
    canvas.width = MAX_WIDTH;
    canvas.height = MAX_HEIGHT;
    var ctx = canvas.getContext("2d");

    var tempW = tempImg.width;
    var tempH = tempImg.height;

    if(tempW > MAX_WIDTH || tempH > MAX_HEIGHT) {
        if ((tempW * MAX_HEIGHT / tempH) >= MAX_WIDTH) {
            tempW *= MAX_HEIGHT / tempH;
            tempH = MAX_HEIGHT;
        } else {
            tempH *= MAX_WIDTH / tempW;
            tempW = MAX_WIDTH;
        }
    }

    var x = -(tempW - MAX_WIDTH)/2;
    var y = -(tempH - MAX_HEIGHT)/2;

    var orientation;
    EXIF.getData(tempImg, function() {
        orientation = EXIF.getTag(tempImg, 'Orientation');
    });
    if (orientation && orientation <= 8 && orientation >= 2) {
        switch (orientation) {
            case 2:
                // horizontal flip
                ctx.translate(tempW, 0);
                ctx.scale(-1, 1);
                break;
            case 3:
                // 180 rotate left
                ctx.translate(tempW, tempH);
                ctx.rotate(Math.PI);
                break;
            case 4:
                // vertical flip
                ctx.translate(0, tempH);
                ctx.scale(1, -1);
                break;
            case 5:
                // vertical flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);

                x = -(tempW - MAX_HEIGHT)/2;
                y = (tempH - MAX_WIDTH)/2;
                break;
            case 6:
                // 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(0, -(tempH));

                x = -(tempW - MAX_HEIGHT)/2;
                y = (tempH - MAX_WIDTH)/2;
                break;
            case 7:
                // horizontal flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI);
                ctx.translate(tempW, -(tempH - 50));
                ctx.scale(-1, 1);

                x = -(tempW - MAX_HEIGHT)/2;
                y = (tempH - MAX_WIDTH)/2;
                break;
            case 8:
                // 90 rotate left
                ctx.rotate(-0.5 * Math.PI);
                ctx.translate(-tempW, 0);

                x = -(tempW - MAX_HEIGHT)/2;
                y = (tempH - MAX_WIDTH)/2;
                break;
        }
    }

    ctx.drawImage(tempImg, x, y, tempW, tempH);

    return canvas.toDataURL("image/jpeg");
}

function cropImage(popup, img, preview, mainImg, curPreview){
    'use strict';
    document.querySelector('#' + popup).className = 'popup-image open';
    document.querySelector('#' + curPreview).innerHTML = '<img src="' + document.querySelector('#' + mainImg).src + '" alt="" />';

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

            mainEle.src = resizeAndCrop(tempImg, MAX_WIDTH, MAX_HEIGHT);
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
