'use strict';

const electron = require('electron');
// アプリケーションをコントロールするモジュール
const app = electron.app;
// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;
// Main - Render 通信モジュール
const ipcMain = electron.ipcMain;
const globalShortcut = electron.globalShortcut;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function () {

  const ret = globalShortcut.register('CommandOrControl+L', () => {
    // console.log('CommandOrControl+L is pressed');
    let bounds = mainWindow.getBounds();
    bounds.x = 0;
    bounds.y = 0;
    bounds.width = size.width;
    bounds.height = size.height;
    mainWindow.setBounds(bounds, false);
    // mainWindow.setSize(size.width, size.height, false);
    mainWindow.show();
    mainWindow.webContents.send('startMessage', 'start');
  });
  if (!ret) {
    console.log('registration failed')
  }

  let size = electron.screen.getPrimaryDisplay().size;
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  // mainWindow = new BrowserWindow({width: 640, height: 380});
  // mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow = new BrowserWindow({
    left          : 0,
    top           : 0,
    width         : 1,
    height        : 1,
    frame         : false,
    show          : true,
    transparent   : true,
    resizable     : false,
    alwaysOnTop   : false,
    webPreferences: {
      nodeIntegration : false,
      contextIsolation: false,
      preload         : `${__dirname}/assets/js/preload.js`,
    },
  });

  //mainWindow.maximize();

  // TODO: マルチスクリーンのとき、すべてのスクリーンにウィンドウが必要、そのときスクリーン名を識別しないとキャプチャ時にスクリーン名が判別できない…。
  // console.log(`file://${__dirname}/assets/views/index.html`);
  mainWindow.loadURL(`file://${__dirname}/assets/views/index.html`);
  // mainWindow.webContents.openDevTools();

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

});

ipcMain.on('requestMessage', (ev, message) => {
  // Mac でおそらくメニューバーの高さ分？下にずらさないと位置がおかしいので、baseY + 20px としている
  let subWindow = new BrowserWindow({
    // width    : size.width,
    // height   : size.height,
    left          : 0,
    top           : 0,
    width         : message.movedX,
    height        : message.movedY,
    minWidth      : 400,
    minHeight     : 400,
    frame         : false,
    show          : false,
    transparent   : false,
    resizable     : false,
    alwaysOnTop   : true,
    webPreferences: {
      nodeIntegration : false,
      contextIsolation: false,
      preload         : `${__dirname}/assets/js/preload.js`,
    }
  });
  subWindow.loadURL(`file://${__dirname}/assets/views/sub.html?baseX=${message.baseX}&baseY=${message.baseY}&movedX=${message.movedX}&movedY=${message.movedY}`);
  // subWindow.webContents.openDevTools();
  // TODO: サブウィンドウが描画されてからデスクトップ画像を切り抜くため、サブウィンドウ自体がキャプチャされてその部分が白くなってしまう
  // 根本的にはサブウィンドウをはじめ見えないようにしておくか、ここでデスクトップ画像を取得するように修正したほうがよいと思う。
  // タイマーはサブウィンドウ自体を描画せずにデスクトップをキャプチャできるだというだいたいの時間で1秒でなれけばいけない、ということはない。
  // ただタイマーで待つ時間が長いとキャプチャ位置がずれたりとかしてしまうので、おそすぎてもいけない。
  setTimeout(function () {
    subWindow.show();
  }, 1000);
});

ipcMain.on('nonactiveMessage', (ev, message) => {
  const bounds = mainWindow.getBounds();
  bounds.x = 0;
  bounds.y = 0;
  bounds.width = 100;
  bounds.height = 100;
  mainWindow.setBounds(bounds, false);
  mainWindow.focus();
});

/**
 * デバッグ用 IPC メッセージ
 */
ipcMain.on('console', (ev, message) => {
  console.log(message);
});
