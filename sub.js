/**
 * Created by zono on 2016/11/15.
 */
var desktopCapturer = require('electron').desktopCapturer;
var Screen = require('electron').screen;
var size = Screen.getPrimaryDisplay().size;

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

window.addEventListener('load', function () {

  var baseX = getParameterByName('baseX');
  var baseY = getParameterByName('baseY');
  var movedX = getParameterByName('movedX');
  var movedY = getParameterByName('movedY');
  var video = document.getElementById('video');
  var streamUrl;
  getImage = function (callback) {
    // var canvas = document.createElement('canvas');
    var canvas = document.getElementById('hogehoge');
    canvas.width = movedX;
    canvas.height = movedY;
    var context = canvas.getContext('2d');
    // Mac でおそらくメニューバーの高さ分？下にずらさないと位置がおかしいので、baseY + 20px としている
    context.drawImage(video, baseX, Number(baseY) + 20, movedX, Number(movedY), 0, 0, movedX, movedY);
    // context.drawImage(video, 0, 0, movedX, movedY);
    // callback(canvas.toDataURL());
  };


  desktopCapturer.getSources({types: ['window', 'screen']}, function (error, sources) {
    if (error) throw error;
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i].name == 'Entire screen') {
        navigator.webkitGetUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource  : 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth           : 800,
              maxWidth           : size.width,
              minHeight          : 600,
              maxHeight          : size.height
            }
          }
        }, function (stream) {
          streamUrl = window.URL.createObjectURL(stream);
          video.src = streamUrl;
          video.play();
          // document.querySelector('video').src = URL.createObjectURL(stream)
          setTimeout(function () {
            getImage(function (url) {
              // <img>タグに画像として読み込む
              // $('img').attr(src, url);

              // base64の文字列として取り出して利用する
              var dataString = url.replace('data:image/png;base64,', '');
              // console.log(dataString);

              var img = document.createElement('img');
              img.src = url;
              img.width = movedX;
              img.height = movedY;
              window.document.body.insertBefore(img, window.document.body.childNodes[0]);
            });
          }, 500);
        }, function (error) {
          console.log(error);
        });
        return
      }
    }
  });

  window.addEventListener('keydown', function (e) {
    var keyCode = e.keyCode;
    switch (keyCode) {
      case 13:
        // Enter key press
        window.close();
        break;
    }
  });

});