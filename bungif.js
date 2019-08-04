const BAN_OF_HEADER = "。，、．？！・：；―…ー－）」』〕｝】ん々ぁぃぅぇぉっゃゅょァィゥェォッャュョ→←↑↓";
const INTERVAL_BASE = 160;
const INTERVAL_ANIMATION = 160;
const INTERVAL_WAITING = 1000;
const LINE_HEIGHT = 1.4;
const MAX_SCREEN_ROW = 3;
const D_SPEED = 30;
const ASPECT_RATIO = 0.53;
const Tx_Italic = "italic";
const Tx_Bold = "bold";
const Tx_Sans_Serif = "sans-serif";
const Tx_Serif = "serif";
const TONE_VALUE_SELECTION_OFFSET = 3;

var title = "";
var wholeSentences = [];
var nTotalLetters = 0;

var timer = NaN;
var intervalDrawText = INTERVAL_BASE;
var timeMain = 0;
var timeLastDrawText = 0;

var mainCtx;
var canvasWidth = 0;
var canvasHeight = 0;
var screenPadding = 0;
var colorTitle = "rgba(255,255,255,0.4)";
var colorCounter = "rgba(255,255,255,0.7)";

var maxLettersInALine;
var screenText = [];
var lastLetter = 0;
var currentLetter = 0;
var currentLine = 0;
var currentSentence = -1;
var isWaitingMode = true;

var tones = [ 0, 0, 0, 0 ];
var currentTone = 0;
var toneColor;

var myGIFencoder;
var isSaveMode = false;

var circles = [];
var colorBgBase ="rgb(178,17,17)";
var currentCircleType;

function onCircleDot() {
	currentCircleType = new CircleDot();
}

function onCircleRandom() {
	currentCircleType = new CircleRandom();
}
function onCircleFall() {
	currentCircleType = new CircleFall();
}
function onCircleBubble() {
	currentCircleType = new CircleBubble();
}

function init() {
	currentCircleType = new CircleRandom();
	setMainCanvas();
	createLetterCanvas();

	onEditingText();
	prepareAnimation();
}

function setMainCanvas() {
	let canvas = document.getElementById('field');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	screenPadding = canvas.height / 12;
	mainCtx = canvas.getContext('2d');
}

function createLetterCanvas() {
	canvasLetter = document.createElement("canvas");
	canvasLetter.height = Math.floor((canvasHeight - 4 * screenPadding)
			/ MAX_SCREEN_ROW);
	canvasLetter.width = canvasLetter.height * ASPECT_RATIO;
	maxLettersInALine = Math.ceil((canvasWidth - screenPadding * 4)
			/ canvasLetter.width) - 1;

	let ctx = canvasLetter.getContext('2d');
	ctx.font = Math.floor(canvasLetter.height / LINE_HEIGHT) + "px serif";
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.textBaseline = "bottom";
}

function onEditingText() {
	setWholeSentences();
	resetTones();

	resetCurrentLetter();
	drawStaticPart();
}

function resetTones() {
	let li = document.getElementById("toneList");
	while (li.firstChild) {
		li.removeChild(li.firstChild);
	}

	for (var i = 0; i < wholeSentences.length; i++) {
		let op = document.createElement("option");
		op.value = 0; // value値
		op.text = "→"; // テキスト値
		li.appendChild(op);
	}

}

function resetCurrentLetter() {
	currentLetter = 0;
	lastLetter = -title.length;
	currentSentence = -1;
	currentLine = screenText.length - 1;

	isWaitingMode = true;
}

function calcTotalLetters() {
	nTotalLetters = 0;
	for (var i = 0; i < wholeSentences.length; i++) {
		nTotalLetters += wholeSentences[i].length;
	}
}

function isSeparator(txt, i) {
	const sep = ".．。？！」　 ";
	let s = txt.charAt(i);
	let iSep = sep.indexOf(s);
	return (-1 < iSep);
}

function convertTextToSentences() {
	let txt = document.form1.maintext.value.substr(0, 500).split("\n");
	sentences = [];
	for (var i = 0; i < txt.length; i++) {
		if (0 < txt[i].length) {
			sentences.push(txt[i]);
		}
	}
	return sentences;
}

function setWholeSentences() {
	wholeSentences = convertTextToSentences();
	calcTotalLetters();
}

function findIndexOfLastSep(txt, index) {
	for (var i = index; i < txt.length; i++) {
		if (!isSeparator(txt, i)) {
			return i;
		}
	}
	return txt.length;
}

function onBtnSaveClick() {
	clearTimer();
	isSaveMode = true;

	myGIFencoder = new GIFEncoder();
	myGIFencoder.setSize(canvasWidth, canvasHeight);
	myGIFencoder.setRepeat(1);
	myGIFencoder.setDelay(INTERVAL_ANIMATION);
	myGIFencoder.start();

	prepareAnimation();

	startTimer(10);
}

function startTimer(interval) {
	timer = setInterval("animate()", interval);
}

function drawBackgroundImage() {
	mainCtx.fillStyle = colorBgBase;
	mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function setWaitingTone() {
	if (isWaitingMode && 0 <= currentSentence) {
		let thisV = tones[currentSentence];
		let nextV = tones[(currentSentence + 1) % wholeSentences.length];
		let t = timeMain - timeLastDrawText;
		currentTone = (t / INTERVAL_WAITING) * (nextV - thisV) + thisV;
//		updateToneColor();
	}
}

function functionAlpha(c) {
	return 0.29 * Math.log(c + 1);

	const v1 = 0.225;
	const v2 = 0.33;
	const v3 = 0.4;

	if (c <= 1) {
		return v1 * c;
	} else if (c <= 2) {
		return (v2 - v1) * (c - 1) + v1;
	} else {
		return (v3 - v2) * (c - 2) + v2;
	}
}

function updateToneIntervalDrawText() {
	intervalDrawText = INTERVAL_BASE - D_SPEED * currentTone;
}

function drawBackgroundEffect() {
	mainCtx.fillStyle = toneColor;
	mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawStaticPart() {
	if (isSaveMode) {
		mainCtx.fillStyle = colorBgBase;
		mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
	} else {
		drawBackgroundImage();
	}
	// drawBackgroundEffect();
	drawLogo();
	drawLettersCounter();
	drawSentencesCounter();
	drawTitle();
	// drawExplanation();
}

function onBtnStartClick() {
	clearTimer();

	isSaveMode = false;

	prepareAnimation();
	startTimer(INTERVAL_ANIMATION);
}

function setCircles() {
	circles = [];
	for (var i = 0; i < 10; i++) {
		circles.push(createCircle());
	}
}

function drawCircle() {
	for (var i = 0; i < circles.length; i++) {
		circles[i].draw(mainCtx, currentTone);
	}

	for (var i = 0; i < circles.length; i++) {
		if (circles[i].isDead()) {
			circles[i] = createCircle();
		}
	}
}

function getTitle() {
	title = document.form1.title.value.substring(0, 50);
}

function prepareAnimation() {
	getTitle();

	timeMain = 0;
	timeLastDrawText = 0;

	resetCurrentLetter();

	initTones();
	setCircles();
	updateScreenText();

	currentLine = screenText.length - 1;
}

function initTones() {
	var list = document.getElementById("toneList").options;
	tones.length = wholeSentences.length;
	for (var i = 0; i < wholeSentences.length; i++) {
		var arg = list[i].value;
		tones[i] = parseInt(arg);
	}

	currentTone = tones[0];
//	updateToneColor();
	updateToneIntervalDrawText();
}

function updateScreenText() {
	var str = (-1 == currentSentence) ? title : wholeSentences[currentSentence];
	var lines = fixLine(str);

	screenText = [];
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] && 0 < lines[i].length) {
			screenText.push(lines[i]);
		}
	}
}

function resetCurrentLine() {
	currentLine = 0;
	updateLastLetter();
}

function updateLastLetter() {
	lastLetter = currentLetter;
}

function fixLine(text) {
	var result = [];
	var index = 0;
	for (var i = 0; i < text.length; i++) {
		if (i - index == maxLettersInALine) {
			if (-1 < BAN_OF_HEADER.indexOf(text.charAt(i))) {
				i++;
			}
			let s = text.substring(index, i);
			result.push(s);
			index = i;
		}
	}
	result.push(text.substring(index, text.length));
	return result;
}

function addFrameToEncoder() {
	if (isSaveMode) {
		myGIFencoder.addFrame(mainCtx);
	}
}

function drawDynamicPart() {
	drawCircle();
	drawText();
}

function animate() {
	drawStaticPart();
	drawDynamicPart();
	addFrameToEncoder();
	setNextCharacter();
	setWaitingTone();
}

function setNextCharacter() {
	let d = currentLetter - lastLetter;
	if (d >= screenText[currentLine].length) {
		if (currentLine < screenText.length - 1) {
			setNewLine();
		} else {
			isWaitingMode = true;
		}
	}
	updateTimeMain();
}

function setNewTimeLastDrawText() {
	timeLastDrawText = timeMain;
}

function updateTimeMain() {
	timeMain += INTERVAL_ANIMATION;
	var d = timeMain - timeLastDrawText;

	if (isWaitingMode) {
		if (d > INTERVAL_WAITING) {
			isWaitingMode = false;
			changeSentence();
			setNewTimeLastDrawText();
		}
	} else if (d >= intervalDrawText) {
		currentLetter += Math.floor(d / intervalDrawText);
		setNewTimeLastDrawText();
	}
}

function changeSentence() {
	if (currentSentence < wholeSentences.length - 1) {
		setNewSentence();
	} else {
		finishAnimation();
	}
}

function setNewLine() {
	currentLine++;
	updateLastLetter();
}

function setNewSentence() {
	currentSentence++;
	resetCurrentLine();

	currentTone = tones[currentSentence];
//	updateToneColor();
	updateToneIntervalDrawText();
	updateScreenText();
}

function clearTimer() {
	if (timer) {
		clearInterval(timer);
	}
}

function finishAnimation() {
	timeMain = 0;
	clearTimer();
	if (!isSaveMode) {
		return;
	}

	myGIFencoder.setDelay(INTERVAL_WAITING * 4);
	myGIFencoder.addFrame(mainCtx);
	myGIFencoder.finish();

	var byteString = myGIFencoder.stream().getData();
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	var blob = new Blob([ ab ], {
		type : "image/gif"
	});
	const name = '文GIF.gif';
	if (window.navigator.msSaveBlob) {
		window.navigator.msSaveBlob(blob, name);
	} else {
		let link = document.createElement('a');
		link.download = name;
		link.href = window.URL.createObjectURL(blob);
		link.click();
	}
}

function drawLogo() {
	mainCtx.fillStyle = "rgba(255,255,255,0.8)";
	mainCtx.font = makeFontProperty(Tx_Italic, screenPadding * 0.8,
			Tx_Sans_Serif);
	let str = "文GIF";
	let l1 = mainCtx.measureText(str).width * 0.8;
	mainCtx.fillText(str, canvasWidth - l1 - screenPadding,
			screenPadding * 1.5, l1);
}

function makeFontProperty(style, size, type) {
	let s = Math.floor(size);
	return style + " " + s + "px " + type;
}

function drawLettersCounter() {
	mainCtx.fillStyle = colorCounter;
	mainCtx.font = makeFontProperty(Tx_Bold, screenPadding, Tx_Serif);
	let str = currentLetter + "／" + nTotalLetters;
	let len = mainCtx.measureText(str).width * 0.8;
	mainCtx.fillText(str, screenPadding * 1.5, screenPadding * 1.5, len);

	mainCtx.font = makeFontProperty(Tx_Bold, canvasWidth / 42, Tx_Serif);
	mainCtx.fillText("字", screenPadding * 1.5 + len + 3,
			screenPadding * 1.5 - 2);
}

function drawSentencesCounter() {
	mainCtx.fillStyle = "rgba(0,0,0,0.7)";
	mainCtx.font = makeFontProperty(Tx_Bold, canvasWidth / 16, Tx_Serif);
	var str = "零";
	if (isWaitingMode) {
		if (currentSentence == wholeSentences.length - 1) {
			str = "完";
		} else {
			str = getDaiji(currentSentence + 2);
		}

		let d = (timeMain - timeLastDrawText) / INTERVAL_WAITING;
		let v = 255 * (-(2 * d - 1) * (2 * d - 1) + 1);
		mainCtx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
	} else {
		str = getDaiji(currentSentence+1);
	}
	let l1 = mainCtx.measureText(str).width * 0.9;
	mainCtx.fillText(str, canvasWidth - screenPadding - l1, canvasHeight
			- screenPadding / 2, l1);

	mainCtx.fillStyle = "rgba(0,0,0,0.7)";
	mainCtx.font = makeFontProperty(Tx_Bold, screenPadding * 0.8, Tx_Serif);
	if (0 == wholeSentences.length) {
		str = "零";
	} else {
		str = getDaiji(wholeSentences.length);
	}
	str += "分ノ";
	let l2 = mainCtx.measureText(str).width * 0.9;
	mainCtx.fillText(str, canvasWidth - screenPadding - l1 - l2, canvasHeight
			- screenPadding / 2, l2);
}

function getDaiji(n){
	const STR_DAIJI = ["零", "壱", "弐", "参", "肆", "伍", "陸", "漆", "捌", "玖" ];
	
	var str = "";
	let c = Math.floor(Math.log10(n))+1;
	
	for (var i=0; i<c; i++){
		str = STR_DAIJI[n%10]+str;
		n= Math.floor(n/10);
	}
	
	return str;
}

function random(max, min) {
	return Math.random() * (max - min) + min;
}

function isTrue(probability) {
	return (Math.random() < probability);
}

function drawTitle() {
	mainCtx.fillStyle = colorTitle;
	mainCtx.font = makeFontProperty("", screenPadding, Tx_Serif);
	let len = Math.min(mainCtx.measureText(title).width * 0.8,
			canvasWidth * 0.6);
	let x = (canvasWidth - len) / 2;
	mainCtx.fillText(title, x, canvasHeight - screenPadding / 2, len);
}

function drawText() {
	var y = screenPadding * 1.5 + canvasLetter.height * (MAX_SCREEN_ROW - 1);
	let x = screenPadding * 2;

	let ctx = canvasLetter.getContext('2d');
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	drawSentence(screenText[currentLine], x, y);
	ctx.fillStyle = "rgb(255,255,255)";
	let d = (-1 == currentSentence) ? title.length : currentLetter - lastLetter;
	drawSentence(screenText[currentLine].substring(0, d), x, y);

	for (var i = 1; i < MAX_SCREEN_ROW; i++) {
		if (currentLine - i < 0) {
			return;
		}
		y -= canvasLetter.height;
		drawSentence(screenText[currentLine - i], x, y);
	}
}

function drawSentence(arg, startX, y) {
	let ctx = canvasLetter.getContext('2d');
	let w = canvasLetter.width;
	let h = canvasLetter.height;
	const padding = 0;
	for (var i = 0; i < arg.length; i++) {
		ctx.clearRect(0, 0, w, h);
		ctx.fillText(arg.charAt(i), padding, h, w - 2 * padding);
		mainCtx.drawImage(canvasLetter, startX + w * i, y);
	}
}

function createCircle() {
	let v = canvasHeight / 7;
	let radius = random(v, v / 5);
	let alpha = random(0.3, 0.15);
	let c = currentCircleType.create();
	c.init(canvasWidth, canvasHeight, radius, alpha);
	return c;
}

function onRangeChange() {
	var r = document.getElementById('value_red').value;
	var g = document.getElementById('value_green').value;
	var b = document.getElementById('value_blue').value;
	
	colorBgBase = "rgb(" + r + "," + g + "," + b + ")";

	if (0==timeMain){
		drawStaticPart();
	}
}

function onToneValueChanged() {
	let li = document.getElementById("toneList");
	let pop = document.getElementById("selectedTone");

	const lind = li.selectedIndex;
	const pind = pop.selectedIndex;

	li.options[lind].value = TONE_VALUE_SELECTION_OFFSET-pind;
	li.options[lind].text = pop.options[pind].text;

	pop.disabled = true;
}

function onToneListChanged() {
	let li = document.getElementById("toneList");
	let pop = document.getElementById("selectedTone");

	const i = li.selectedIndex;
	pop.selectedIndex = Number(li.options[i].value)
			+ TONE_VALUE_SELECTION_OFFSET;

	pop.disabled = false;
	
	document.getElementById("sentenceNumber").innerText = String(i+1);
}