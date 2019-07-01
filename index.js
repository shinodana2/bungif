var margin = 10;
var hMargin = 60;
var S = 0;
var timer = NaN;
var screenText = [];
var chara = 1;
var row = 0;
var nLines = 0;
var originalText = "";
var canvasWidth = 0;
var canvasHeight = 0;
var maxScreenRow = 3;
var maxScreenRowIndex = 0;
var maxNumChar = 0;
var title = "";
var tickTime = 0;
var screenHeight = 250;
var img;
var lineSpacing = 1.4;
var totalTextLength = 0;
var screenContext;

var encoder;
var save;

function init() {
	maxScreenRowIndex = maxScreenRow - 1;

	let canvas = document.getElementById('field');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	screenContext = canvas.getContext('2d');

	S = Math.floor(screenHeight / (maxScreenRow * lineSpacing));

	img = new Image();
	img.src = "background.png";
	img.onload = function() {
		screenContext.drawImage(img, 0, 0);
	}
}

function onBtnSaveClick() {
	save = true;

	encoder = new GIFEncoder();
	encoder.setSize(canvasWidth, canvasHeight);
	encoder.setRepeat(1);
	encoder.start();

	prepareAnimation();
	screenContext.drawImage(img, 0, 0);
	drawTitle();
	encoder.addFrame(screenContext);

	encoder.setTransparent(0x000000);
	encoder.setDispose(3);

	timer = setInterval("animateText()", tickTime);
}

function drawBackground() {
	if (save) {
		screenContext.fillStyle = "rgb(0,0,0)";
		screenContext.fillRect(0, 0, canvasWidth, canvasHeight);
	} else {
		screenContext.drawImage(img, 0, 0);
		drawTitle();
	}
}

function onBtnStartClick() {
	save = false;

	prepareAnimation();

	timer = setInterval("animateText()", tickTime);
}

function prepareAnimation() {
	tickTime = 160;

	originalText = document.form1.textarea1.value.split(/\n\n/);
	title = originalText[0];
	originalText.shift();

	checkMaxNumChar();
	nLines = originalText.length;
	row = 0;
	setCurrentLine();
}

function checkMaxNumChar() {
	maxNumChar = 0;
	totalTextLength = 0;
	for (var i = 0; i < originalText.length; i++) {
		var arg = originalText[i].split(/\n/);
		for (var j = 0; j < arg.length; j++) {
			totalTextLength += arg[j].length;
			if (maxNumChar < arg[j].length) {
				maxNumChar = arg[j].length;
			}
		}
	}
}

function setCurrentLine() {
	var temp = originalText[row].split(/\n/);
	screenText = [];
	for (var i = 0; i < temp.length; i++) {
		screenText.push(temp[i]);
	}

	for (var i = 0; i < maxScreenRowIndex; i++) {
		screenText.unshift("\n");
	}

	chara = 1;
}

function addSavingFrame() {
	if (save) {
		encoder.addFrame(screenContext);
	}
}

function animateText() {
	drawStaticPart();
	drawText();
	addFrameToEncoder();

	if (chara > screenText[maxScreenRowIndex].length) {
		if (screenText.length > maxScreenRow) {
			chara = 0;
			screenText.shift();
		} else {
			if (row < nLines - 1) {
				sleep(1000);
				row++;
				setCurrentLine();
				clearInterval(timer);
				
				tickTime -= 25;
				timer = setInterval("animateText()", tickTime);
			} else {
				clearInterval(timer);
				if (save){
					sleep(3000);
					downloadGIF();
				}
			}
		}
	}
	chara++;
}

function downloadGIF(){
	encoder.finish();

	var byteString = encoder.stream().getData();
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	var blob = new Blob([ ab ], {
		type : "image/gif"
	});
	const name = '3or4.gif';
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		let link = document.createElement('a');
		link.download = name;
		link.href = window.URL.createObjectURL(blob);
		link.click();
	}
}

function drawTitle() {
	screenContext.fillStyle = "rgba(0,0,0,0.4)";
	screenContext.font = "15px serif";
	screenContext.fillText(totalTextLength + "字" + nLines + "行", 25,
			canvasHeight - 25);

	screenContext.shadowColor = "rgba(0, 0, 0, 0.5)";
	screenContext.shadowOffsetX = -2;
	screenContext.shadowOffsetY = 2;
	screenContext.shadowBlur = 4;

	screenContext.font = "28px sans-serif";
	screenContext
			.fillText(title, 100, canvasHeight - margin, canvasWidth - 220);

	screenContext.shadowColor = "rgba(0, 0, 0, 0)";
	screenContext.shadowOffsetX = 0;
	screenContext.shadowOffsetY = 0;
	screenContext.shadowBlur = 0;
}

function drawText() {
	var y = 15 + S * lineSpacing;
	var maxTextWidth = canvasWidth - hMargin * 2;

	screenContext.font = S + "px serif";
	screenContext.fillStyle = "rgb(255,255,255)";
	for (var i = 0; i < maxScreenRowIndex; i++) {
		screenContext.fillText(fillSpace(screenText[i]), hMargin, y,
				maxTextWidth);
		y += S * lineSpacing;
	}

	var arg = screenText[maxScreenRowIndex].substring(0, chara);
	screenContext.fillText(fillSpace(arg), hMargin, y, maxTextWidth);
}

function fillSpace(arg) {
	for (var i = arg.length; i < maxNumChar; i++) {
		arg += "　";
	}
	return arg;
}

function sleep(milliSec) {
	if (save) {
		let v = Math.floor(milliSec/tickTime);
		for (var i=0; i<v; i++){
			addFrameToEncoder();
		}
	} else {
		var base = new Date();
		while (new Date() - base < milliSec)
			;
	}
}
