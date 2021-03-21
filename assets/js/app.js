'use strict';

// ipc received.
let activeCapture = false;
ipcRenderer.on('startMessage', (ev, message) => {
  activeCapture = true;
});

window.addEventListener('load', () => {

  let rootDivElem = document.createElement('div');
  rootDivElem.className = 'window';
  window.document.body.insertBefore(rootDivElem, window.document.body.childNodes[0]);

  let cursorDiv, rectDiv;
  // 矩形の選択中かどうか
  let cropping = false;
  // 矩形選択開始位置
  let baseX = 0;
  let baseY = 0;
  let movedX = 0;
  let movedY = 0;
  window.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
      case 27:
        // cursor 消す
        rootDivElem.removeChild(cursorDiv);
        cursorDiv = null;
        ipcRenderer.send('nonactiveMessage', {});
        break;
      default:
        return;
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (!activeCapture) return;
    if (cropping) {
      // 切り取り中
      // TODO: マイナス無視…
      movedX = e.clientX - baseX;
      movedY = e.clientY - baseY;
      rectDiv.style.width = movedX + 'px';
      rectDiv.style.height = movedY + 'px';
    } else {
      // 切り取ってはいない
      if (cursorDiv == null) {
        cursorDiv = document.createElement('div');
        cursorDiv.className = 'cursor';
        cursorDiv.style.left = e.clientX + 'px';
        cursorDiv.style.top = e.clientY + 'px';
        // console.log(cursorDiv.style.left, cursorDiv.style.top);
        rootDivElem.insertBefore(cursorDiv, rootDivElem.childNodes[0]);
      } else {
        cursorDiv.style.left = e.clientX + 'px';
        cursorDiv.style.top = e.clientY + 'px';
      }
    }
  });
  window.addEventListener('mousedown', (e) => {
    if (cropping) {
      // // 矩形を決定
      // ipcRenderer.send( 'requestMessage', {
      //   'baseX': baseX,
      //   'baseY': baseY,
      //   'movedX': movedX,
      //   'movedY': movedY
      // } );
    } else {
      // 矩形を選択
      // cursor 消す
      rootDivElem.removeChild(cursorDiv);
      cursorDiv = null;
      // おしたところを top,left にする
      baseX = e.clientX;
      baseY = e.clientY;
      rectDiv = document.createElement('div');
      rectDiv.className = 'rect';
      rectDiv.style.left = e.clientX + 'px';
      rectDiv.style.top = e.clientY + 'px';
      window.document.body.insertBefore(rectDiv, window.document.body.childNodes[0]);
      // 範囲選択状態
      cropping = true;
    }
  });
  window.addEventListener('mouseup', (e) => {
    if (cropping) {
      // 矩形を決定
      ipcRenderer.send('requestMessage', {
        'baseX' : baseX,
        'baseY' : baseY,
        'movedX': movedX,
        'movedY': movedY
      });
      window.document.body.removeChild(rectDiv);
      // 選択状態解除
      cropping = false;
      activeCapture = false;
      // cursor 消す
      ipcRenderer.send('nonactiveMessage', {});
    }
  });

});
