var piece;
var bullseye;
var deviceWidth = device.width;
var deviceHeight = device.height;

// 判断颜色差距
function isDifferentColor(colorA, colorB, threshold) {
	if (Math.abs(colors.red(colorA) - colors.red(colorB)) +
		Math.abs(colors.green(colorA) - colors.green(colorB)) +
		Math.abs(colors.blue(colorA) - colors.blue(colorB)) > threshold) {
		return true;
	}
	return false;
}

// 查找落点横坐标
function findBoardX(screen, pieceX, pieceWidth) {
	var x;
	var y;
	var minX;
	var maxX;
	var borderX;
	var borderY;
	var borderPixelCount = 0;
	var minY = parseInt(deviceHeight / 3);
	var maxY = parseInt(deviceHeight / 3 * 2);
	var minPieceX = pieceX - pieceWidth / 2;
	var maxPieceX = pieceX + pieceWidth / 2;
	// 通过棋子位置判断在屏幕左半部分还是右半部分查找，提升性能
	if (pieceX > deviceWidth / 2) {
		minX = 0;
		maxX = deviceWidth / 5 * 3;
	} else {
		minX = deviceWidth / 5 * 2;
		maxX = deviceWidth;
	}
	if (bullseye) {
		var bullseyePos = images.findImageInRegion(screen, bullseye, minX, minY, maxX - minX, maxY - minY);
		if (bullseyePos) {
			return bullseyePos.x + bullseye.getWidth() / 2;
		}
	}
	outer: for (y = minY; y < maxY; y++) {
		var firstPixel = screen.pixel(0, y);
		// 找出边缘像素点
		for (x = minX; x < maxX; ++x) {
			if (isDifferentColor(screen.pixel(x, y), firstPixel, 10)) {
				if (x < minPieceX || x > maxPieceX) {
					if (!borderX) {
						borderX = x;
						borderY = y;
					}
					++borderPixelCount;
				}
			} else if (borderPixelCount > 0) {
				break outer;
			}
		}
	}
	// 求出边缘中心点横坐标
	return borderX + borderPixelCount / 2 | 0;
}

// 模拟长按跳跃
function jump(duration) {
	var x = random(0, deviceWidth);
	var y = random(deviceHeight / 3, deviceHeight / 3 * 2);
	press(x, y, duration);
}

function keepAwake() {
	device.keepScreenOn(3600000);
	events.on('exit', function() {
		toastLog('自动跳一跳结束');
		device.cancelKeepingAwake();
	});
}

function main() {
	toastLog('正在加载自动跳一跳资源');
	piece = images.load('https://gitee.com/lanfei/wechat-jump/raw/master/piece.jpg');
	// 是否启用靶心识别
	bullseye = images.load('https://gitee.com/lanfei/wechat-jump/raw/master/bullseye.jpg');
	if (!piece) {
		toastLog('加载失败，请检查网络');
		return;
	}
	var pieceWidth = piece.getWidth();
	keepAwake();
	toastLog('请允许程序进行屏幕截图');
	images.requestScreenCapture();
	toastLog('加载成功，请开始跳一跳游戏');
	waitForPackage('com.tencent.mm');
	console.log('屏幕分辨率：', deviceWidth, deviceHeight);
	while (currentPackage() == 'com.tencent.mm') {
		var screen = images.captureScreen();
		var pos = images.findImage(screen, piece, {
			threshold: 0.5
		});
		if (pos) {
			var pieceX = pos.x + pieceWidth / 2;
			var boardX = findBoardX(screen, pieceX, pieceWidth);
			var duration = Math.abs(pieceX - boardX) * 1.6;
			console.log(pieceX, boardX);
			jump(duration);
			sleep(1800);
		}
	}
}

main();