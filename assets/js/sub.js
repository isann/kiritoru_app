/**
 * Created by zono on 2016/11/15.
 */
ipcRenderer.send('console', 'launch sub');
var size = window.screen;

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
  var drawImage = function () {
    var canvas = document.getElementById('capture');
    canvas.width = movedX;
    canvas.height = movedY;
    var context = canvas.getContext('2d');
    // TODO: Mac でおそらくメニューバーの高さ分？下にずらさないと位置がおかしいので、baseY + 20px としている
    // TODO: DesktopCapture の video 表示するとわかるが、その時点でオリジナルのカラーと異なって見えるのが原因不明
    context.drawImage(video, baseX, Number(baseY) + 20, movedX, Number(movedY), 0, 0, movedX, movedY);
  };

  desktopCapturer.getSources({types: ['window', 'screen']})
    .then((sources) => {
      for (let i = 0; i < sources.length; ++i) {
        // TODO: 選択したウィンドウの名前？（スクリーン名）で座標を切り取りたいがやり方がわからない
        // 現状、app.js の MainWindow がマルチスクリーンの場合、片側（Screen 1）にしかもっていけないので固定…。
        if (sources[i].name == 'Screen 1' || sources[i].name == 'Entire screen') {
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
            video.srcObject = stream;
            video.play();

            // TODO: timeout で実行しないとキャプチャした画像が白色になってしまう、原因不明
            setTimeout(function () {
              drawImage();
            }, 100);
          }, function (error) {
            console.error(error);
          });
          return
        }
      }
    })
    .catch((err) => {
      console.error(err);
      // ipcRenderer.send('console', err.message);
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
