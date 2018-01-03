var piece = images.read('/sdcard/piece.jpg');
var pieceWidth = piece.getWidth();
var pieceHeight = piece.getHeight();
var deviceWidth = device.width;
var deviceHeight = device.height;

function isDifferentColor(colorA, colorB, threshold) {
	if (Math.abs(colors.red(colorA) - colors.red(colorB)) +
		Math.abs(colors.green(colorA) - colors.green(colorB)) +
		Math.abs(colors.blue(colorA) - colors.blue(colorB)) > threshold) {
		return true;
	}
	return false;
}

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
		if (pieceX > deviceWidth / 2) {
			minX = 0;
			maxX = deviceWidth / 2;
		} else {
			minX = deviceWidth / 2;
			maxX = deviceWidth;
		}
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
	return borderX + borderPixelCount / 2 | 0;
}

function main() {
	toast('请打开跳一跳，并点击开始按钮');
	images.requestScreenCapture();
	device.keepScreenOn(3600000);
	events.on('exit', function() {
		toast('跳一跳结束');
		device.cancelKeepingAwake();
	});
	waitForPackage('com.tencent.mm');
	console.log('Resolution:', deviceWidth, deviceHeight);
	while (currentPackage() == 'com.tencent.mm') {
		var screen = images.captureScreen();
		var pos = images.findImage(screen, piece, {
			threshold: 0.5
		});
		if (pos) {
			var pieceX = pos.x + pieceWidth / 2;
			var boardX = findBoardX(screen, pieceX);
			// console.log(pieceX, boardX);
			press(0, 0, Math.abs(pieceX - boardX) * 1.6);
			sleep(1500);
		}
	}
}

main();