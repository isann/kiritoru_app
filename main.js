/**
 * Created by zono on 2016/11/15.
 */
'use strict';

var electron = require('electron');
// アプリケーションをコントロールするモジュール
var app = electron.app;
// ウィンドウを作成するモジュール
var BrowserWindow = electron.BrowserWindow;
// Main - Render 通信モジュール
var ipcMain = electron.ipcMain;
var globalShortcut = electron.globalShortcut;

// メインウィンドウはGCされないようにグローバル宣言
var mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function () {

  const ret = globalShortcut.register('CommandOrControl+L', () => {
    // console.log('CommandOrControl+X is pressed');
    var bounds = mainWindow.getBounds();
    bounds.x = 0;
    bounds.y = 0;
    bounds.width = size.width;
    bounds.height = size.height;
    mainWindow.setBounds(bounds, false);
    // mainWindow.setSize(size.width, size.height, false);
    mainWindow.focus();
    mainWindow.webContents.send('startMessage', 'start');
  });
  if (!ret) {
    console.log('registration failed')
  }

  var Screen = electron.screen;
  var size = Screen.getPrimaryDisplay().size;
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  // mainWindow = new BrowserWindow({width: 640, height: 380});
  // mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow = new BrowserWindow({
    left         : 0,
    top          : 0,
    width        : 1,
    height       : 1,
    frame        : false,
    show         : true,
    transparent  : true,
    resizable    : false,
    'alwaysOnTop': false
  });

  //mainWindow.maximize();

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

});

ipcMain.on('requsetMessage', (ev, message) => {
  // console.log(123, message);  // prints "ping"
  // ev.sender.send('responseMessage', 'pong');
  var Screen = electron.screen;
  var size = Screen.getPrimaryDisplay().size;
  // Mac でおそらくメニューバーの高さ分？下にずらさないと位置がおかしいので、baseY + 20px としている
  var subWindow = new BrowserWindow({
    // width    : size.width,
    // height   : size.height,
    left         : 0,
    top          : 0,
    width        : message.movedX,
    height       : message.movedY,
    minWidth     : 400,
    minHeight    : 400,
    frame        : false,
    show         : false,
    transparent  : false,
    resizable    : false,
    'alwaysOnTop': true
  });
  subWindow.loadURL(`file://${__dirname}/sub.html?baseX=${message.baseX}&baseY=${message.baseY}&movedX=${message.movedX}&movedY=${message.movedY}`);
  setTimeout(function () {
    subWindow.show();
  }, 2000);
});

ipcMain.on('nonactiveMessage', (ev, message) => {
  var bounds = mainWindow.getBounds();
  bounds.x = 0;
  bounds.y = 0;
  bounds.width = 100;
  bounds.height = 100;
  mainWindow.setBounds(bounds, false);
  mainWindow.focus();
});
