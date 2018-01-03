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
function findBoardX(screen, pieceX) {
	var borderX;
	var borderY;
	var borderPixelCount = 0;
	var minY = parseInt(deviceHeight / 3);
	var maxY = parseInt(deviceHeight / 3 * 2);
	outer: for (var y = minY; y < maxY; y++) {
		var minX;
		var maxX;
		var firstPixel = screen.pixel(0, y);
		// 通过棋子位置判断在屏幕左半部分还是右半部分查找，提升性能
		if (pieceX > deviceWidth / 2) {
			minX = 0;
			maxX = deviceWidth / 2;
		} else {
			minX = deviceWidth / 2;
			maxX = deviceWidth;
		}
		// 找出边缘像素点
		for (var x = minX; x < maxX; ++x) {
			if (isDifferentColor(screen.pixel(x, y), firstPixel, 10)) {
				if (!borderX) {
					borderX = x;
					borderY = y;
				}
				++borderPixelCount;
			}
		}
		if (borderPixelCount > 0) {
			break outer;
		}
	}
	// 求出边缘中心点横坐标
	return borderX + borderPixelCount / 2 | 0;
}

// 模拟长按跳跃
function jump(distanceX) {
	var x = random(0, deviceWidth);
	var y = random(deviceHeight / 3, deviceHeight / 3 * 2);
	press(x, y, distanceX * 1.6);
}

function keepAwake() {
	device.keepScreenOn(3600000);
	events.on('exit', function() {
		toast('自动跳一跳结束');
		device.cancelKeepingAwake();
	});
}

function main() {
	toast('正在加载自动跳一跳资源');
	var piece = images.load('https://github.com/Lanfei/wechat-jump/raw/master/piece.jpg');
	if (!piece) {
		toast('加载失败，请检查网络');
		return;
	}
	var pieceWidth = piece.getWidth();
	var pieceHeight = piece.getHeight();
	keepAwake();
	images.requestScreenCapture();
	toast('加载成功，请开始跳一跳游戏');
	waitForPackage('com.tencent.mm');
	// console.log('Resolution:', deviceWidth, deviceHeight);
	while (currentPackage() == 'com.tencent.mm') {
		var screen = images.captureScreen();
		var pos = images.findImage(screen, piece, {
			threshold: 0.5
		});
		if (pos) {
			var pieceX = pos.x + pieceWidth / 2;
			var boardX = findBoardX(screen, pieceX);
			// console.log(pieceX, boardX);
			jump(Math.abs(pieceX - boardX));
			sleep(1500);
		}
	}
}

main();