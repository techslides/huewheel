/*!
 *	Hue Wheel 1.1.1
 *
 *	(c) 2013-2015 Epistemex
 *	www.epistemex.com
 *
 *	License: MIT
*/

/**
 * Create a new instance of a Hue wheel.
 *
 * @param {String|HTMLElement} elementID - ID of an element or the element itself to turn into a control
 * @param {Object} [options] Options given as JSON
 * @param {Number} [options.diameter=250] diameter (in pixels) of control
 * @param {Number} [options.shadowBlur=0] diameter (in pixels) of shadow
 * @param {String} [options.shadowColor='black'] CSS color of shadow if active (see shadowBlur)
 * @param {Number} [options.hue=0] Initial hue angle [0, 360]
 * @param {Number} [options.saturation=1] Initial saturation value [0.0, 1.0]
 * @param {Number} [options.lightness=0.5] Initial lightness value [0.0, 1.0]
 * @param {Array} [options.rgb] Initial RGB value given as an array [r,g,b]
 * @param {Boolean} [options.changeSaturation=false] Enable control to change saturation
 * @param {Boolean} [options.changeLightness=false] Enable control to change lightness
 * @param {String} [options.colorSpace='hsl'] Color space to use in control
 * @param {Boolean} [options.showColorSpot=true] Show current color in center of control
 * @param {Object|Function} [options.onChange] Function to call when current color changes
 * @param {Number} [options.colorSpotWidth=0.7] If showColor is used this is the ratio of the radius from center to the edge of hue wheel. Value can be [0.0, 1.0].
 * @param {Number} [options.colorSpotBorder=2] If showColor is used this is the width of the border. A value of 0 turns the border off.
 * @param {String} [options.colorSpotBorderColor='black'] If showColor and colorBorder > 0 this will be the color of the border.
 * @param {Number} [options.thicknessHue] Thickness of hue ring in pixels
 * @param {Number} [options.thicknessLightness] Thickness of lightness ring in pixels
 * @param {Number} [options.quality=2] Quality or resolution of internal gradients. Higher is better. Note: must be in steps of 2^q (ie., 1, 2, 4). The higher quality the longer time it takes to render the control.
 * @param {Number} [options.hueKnobSize=0.1] A value [0.0, 1.0] determining the size of the hue knob relative to radius.
 * @param {String} [options.hueKnobColor='white'] Color of hue knob.
 * @param {String} [options.lightnessKnobColor='white'] Color of lightness knob (if ligthness ring is visible).
 * @param {String} [options.hueKnobColorSelected='#777'] Color for hue knob when selected
 * @param {String} [options.lightnessKnobColorSelected='#777'] Color of lightness knob when selected (if ligthness ring is visible).
 * @param {Boolean} [options.lightnessRingClickable=false] Makes lightness ring clickable (outside knob, inside ring).
 * @param {Boolean} [options.hueKnobShadow=false] Use shadow with hue knob if shadow is activated.
 * @param {Boolean} [options.useKeys=true] Enable usage of keys to control hsl when control is active.
 * @param {Number} [options.hueKeyDelta=1] Delta values to increment/decrement the hue value with when its hotkey is pressed.
 * @param {Number} [options.saturationKeyDelta=1] Delta values to increment/decrement the saturation value with when its hotkey is pressed.
 * @param {Number} [options.lightnessKeyDelta=1] Delta values to increment/decrement the lightness value with when its hotkey is pressed.
 * @param {Number} [options.keyShiftFactor=10] When the shift key is held down the delta values are multiplied with this factor when using the hotkeys.
 * @param {Number} [options.hueKeyCodeUp=33] Key code to use to increase hue value (default page up).
 * @param {Number} [options.hueKeyCodeDown=34] Key code to use to decrease hue value (default page down).
 * @param {Number} [options.saturationKeyCodeUp=37] Key code to use to increase hue value (default left arrow key).
 * @param {Number} [options.saturationKeyCodeDown=39] Key code to use to decrease hue value (default right arrow key).
 * @param {Number} [options.lightnessKeyCodeUp=38] Key code to use to increase lightness value (default up arrow key).
 * @param {Number} [options.lightnessKeyCodeDown=40] Key code to use to increase lightness value (default down arrow key).
 * @param {Boolean} [options.tabable=true] Allows the control to be selected and operated with tab key and hotkeys.
 * @constructor
 */
function HueWheel(elementID, options) {

	options = options || {};

	if (isStr(elementID))
		elementID = document.getElementById(elementID);

	var	me					= this,
		msPointer			= navigator.msPointerEnabled, // && navigator.msMaxTouchPoints,
		canvas				= document.createElement('canvas'),
		gcanvas				= document.createElement('canvas'),
		ctx					= canvas.getContext('2d'),
		gctx				= gcanvas.getContext('2d'),
		gw					= 360 * (options.quality || 2),
		gwstep				= 360 / gw,
		grad				= gctx.createLinearGradient(0, 0, gw, 0),

		idata,
		data,

		// pre-calcs
		dlt					= 0.5 * Math.PI,
		d2r					= Math.PI / 180,
		r2d					= 180 / Math.PI,
		pi2					= 2 * Math.PI,

		// options
		w					= 250,
		h					= w,
		cx					= w * 0.5,
		cy					= cx,
		angle				= 0,

		showColor			= true,
		isHSL				= true,
		useLuma				= true,
		useSat				= true,
		saturation			= 1.0,
		lightness			= 0.5,

		useKeys				= true,
		hueKeyDelta			= 1,
		satKeyDelta			= 1,
		lightKeyDelta		= 1,
		hueKeyCodeUp		= 33,	// page up
		hueKeyCodeDown		= 34,	// page down
		satKeyCodeUp		= 37,	// arrow left
		satKeyCodeDown		= 39,	// arrow right
		lightKeyCodeUp		= 38,	// arrow up
		lightKeyCodeDown	= 40,	// arrow down
		keyShiftFactor		= 10,

		thickness			= Math.max(w * 0.12, 3),
		lumaThickness		= useLuma ? Math.max(w * 0.05, 3) : 0,
		knobWidth			= 0.1,
		shadow				= 0,
		hueShadow			= false,

		colorWidth			= 0.8,
		colorBorder			= 2,
		colorBorderColor	= '#000',
		hueKnobColor		= '#fff',
		lightKnobColor		= '#fff',
		hueKnobColorSel		= '#777',
		lightKnobColorSel	= '#777',
		lightClickable		= false,

		accessibility		= true,	// tabable

		// calced setup
		hr,
		lr,
		lkw,
		lumaKnob,
		hueKnob,
		i, l,

		// internals
		isDown				= false,
		isLuma				= false,
		isTouch				= false,
		to,
		x, y,						// current mouse position
		r, g, b,					// current RGB
		keys, key, o;

	/*
	 *	Parse options
	*/
	keys = Object.keys(options);

	for(i = 0; key = keys[i]; i++) {

		o = options[key];

		switch(key) {

			case 'diameter':
				if (isNum(o)) w = h = options.diameter;
				cx = w * 0.5;
				cy = cx;
				break;

			case 'hue':
				if (isNum(o)) angle = o % 360;
				break;

			case 'colorSpace':
				if (isStr(o) && (o === 'hsl' || o === 'hsv')) isHSL = (o === 'hsl');
				break;

			case 'changeLightness':
				if (isBool(o)) useLuma = o;
				lumaThickness = useLuma ? Math.max(w * 0.05, 3) : 0;
				break;

			case 'changeSaturation':
				if (isBool(o)) useSat = o;
				break;

			case 'saturation':
				if (isNum(o)) saturation = o;
				break;

			case 'lightness':
			case 'brightness':
				if (isNum(o)) lightness = o;
				break;

			case 'useKeys':
				if (isBool(o)) useKeys = o;
				break;

			case 'hueKeyDelta':
				if (isNum(o)) hueKeyDelta = o;
				break;

			case 'saturationKeyDelta':
				if (isNum(o)) satKeyDelta = o;
				break;

			case 'lightnessKeyDelta':
				if (isNum(o)) lightKeyDelta = o;
				break;

			case 'hueKeyCodeUp':
				if (isNum(o)) hueKeyCodeUp = o;
				break;

			case 'hueKeyCodeDown':
				if (isNum(o)) hueKeyCodeDown = o;
				break;

			case 'saturationKeyCodeUp':
				if (isNum(o)) satKeyCodeUp = o;
				break;

			case 'saturationKeyCodeDown':
				if (isNum(o)) satKeyCodeDown = o;
				break;

			case 'lightnessKeyCodeUp':
				if (isNum(o)) lightKeyCodeUp = o;
				break;

			case 'lightnessKeyCodeDown':
				if (isNum(o)) lightKeyCodeDown = o;
				break;

			case 'shiftKeyFactor':
				if (isNum(o)) keyShiftFactor = o;
				break;

			case 'thicknessHue':
				if (isNum(o)) thickness = o;
				break;

			case 'thicknessLuma':
				if (isNum(o)) lumaThickness = o;
				break;

			case 'hueKnobSize':
				if (isNum(o)) knobWidth = o;
				break;

			case 'shadowBlur':
				if (isNum(o)) shadow = o;
				break;

			case 'hueKnobShadow':
				if (isBool(o)) hueShadow = o;
				break;

			case 'showColorSpot':
				if (isBool(o)) showColor = o;
				break;

			case 'tabable':
				if (isBool(o)) accessibility = o;
				break;

			case 'colorSpotWidth':
				if (isNum(o)) colorWidth = o;
				break;

			case 'colorSpotBorder':
				if (isNum(o)) colorBorder = o;
				break;

			case 'colorSpotBorderColor':
				if (isStr(o)) colorBorderColor = o;
				break;

			case 'hueKnobColor':
				if (isStr(o)) hueKnobColor = o;
				break;

			case 'lightnessKnobColor':
				if (isStr(o)) lightKnobColor = o;
				break;

			case 'hueKnobColorSelected':
				if (isStr(o)) hueKnobColorSel = o;
				break;

			case 'lightnessKnobColorSelected':
				if (isStr(o)) lightKnobColorSel = o;
				break;

			case 'lightnessRingClickable':
				if (isBool(o)) lightClickable = o;
				break;

			case 'rgb':
				if (Array.isArray(o) && o.length === 3) {

					var	c = isHSL ? rgb2hsl(o[0], o[1], o[2]) : rgb2hsv(o[0], o[1], o[2]);

					angle = c.h;
					saturation = c.s;
					lightness = c.l;
				}
				break;
		}
	}

	/*
	 *	Init callback vector
	*/
	this.onchange = isDef(options.onChange) ? options.onChange : null;

	/*
	 *	Init canvas for control
	*/
	canvas.id = (elementID.id || 'hueWheel') + '_canvas';
	if (accessibility) canvas.tabIndex = 0;

	/*
	 *	Prepare canvas for gradients.
	 *	This is used to create radial gradients.
	*/
	gcanvas.width = gw;
	gcanvas.height = 2;

	grad.addColorStop(0, 	'#f00');
	grad.addColorStop(0.17, '#ff0');
	grad.addColorStop(0.33, '#0f0');
	grad.addColorStop(0.5,	'#0ff');
	grad.addColorStop(0.67, '#00f');
	grad.addColorStop(0.83, '#f0f');
	grad.addColorStop(1,	'#f00');

	gctx.fillStyle = grad;
	gctx.fillRect(0, 0, gw, 1);

	grad = gctx.createLinearGradient(0, 0, gw, 0);
	grad.addColorStop(0, '#000');
	grad.addColorStop(1, '#fff');

	gctx.fillStyle = grad;
	gctx.fillRect(0, 1, gw, 1);

	idata = gctx.getImageData(0, 0, gw, 2);
	data = idata.data;

	/*
	 *	Generate control and insert into DOM
	*/
	generateCanvas();
	elementID.innerHTML = '';
	elementID.appendChild(canvas);

	/*
	 *	Init first draw and event
	*/
	render();
	sendEvent();

	/*
	 *	Setup mouse handlers
	*/

	/*
	 *	Setup touch handlers
	*/
	if (msPointer) {
		canvas.addEventListener('MSPointerDown', mouseDown, false);
		window.addEventListener('MSPointerMove', mouseMove, false);
		window.addEventListener('MSPointerUp', mouseUp, false);
	}
	else {
		canvas.addEventListener('mousedown', mouseDown, false);
		window.addEventListener('mousemove', mouseMove, false);
		window.addEventListener('mouseup', mouseUp, false);

		canvas.addEventListener('touchstart', mouseDown, false);
		canvas.addEventListener('touchmove', mouseMove, false);
		canvas.addEventListener('touchend', mouseUp, false);
	}


	/*
	 *	Setup key handlers
	*/
	if (useKeys) {
		canvas.addEventListener('keydown', keyDown, false);
	}

	/*
	 * *******  MOUSE handlers  *******
	*/

	function mouseDown(e) {

		getXY(e);

		canvas.style.cursor = 'default';

		/*
		 *	Check if HUE knob
		*/
		getHueKnob(false);
		isDown = ctx.isPointInPath(x, y);

		if (isDown) {
			isLuma = false;
			clear();
			renderHueKnob(true);
			if (useLuma) renderLumaKnob(false);
			return false;
		}

		/*
		 *	Check if LUMA knob
		*/
		getLumaKnob(false);
		isDown = ctx.isPointInPath(x, y);

		if (isDown) {
			isLuma = true;
			clear();
			renderHueKnob(false);
			if (useLuma) renderLumaKnob(true);
			return false;
		}

		/*
		 *	Check if in HUE RING
		*/
		var tri = getTri(x, y),
			d = tri.dist,
			a = tri.angle;

		if (d > hr - thickness * 0.5 && d < hr + thickness * 0.5) {

			angle = a * r2d;
			if (angle < 0) angle += 360;

			clear();

			renderHueKnob(false);
			if (useLuma) renderLumaKnob(false);

			sendEvent();
		}

		/*
		 *	Check if in LIGHTNESS RING
		*/
		else if (lightClickable && d > lr - lumaThickness * 0.5 && d < lr + lumaThickness * 0.5) {

			var ta = a * r2d - 90;
			if (ta < 0) ta += 360;

			me.hsl(angle, saturation, ta / 360)
		}

		return false;
	}

	function mouseMove(e) {

		getXY(e);

		var tri = getTri(x, y),
			d = tri.dist,
			a = tri.angle,
			isOver;

		if (isDown) {

			if (!isLuma) {

				angle = a  * r2d;
				if (angle < 0) angle += 360;

				if (useSat) {
					if (d < 0) d = 0;
					if (d > hr - l) d = hr - l;
					saturation = d / (hr - l);
				}

			}
			else {
				lightness = ((a + 0.5 * Math.PI) / pi2 + 0.5) % 1.0;
			}

			validate();
			clear();
			renderHueKnob(!isLuma);

			if (useLuma) renderLumaKnob(isLuma);

			sendEvent();

		}
		else {

			getHueKnob(false);
			isOver = ctx.isPointInPath(x, y);

			if (isOver) {
				canvas.style.cursor = 'pointer';
				return false;
			}

			/*
			 *	Check if LUMA knob
			*/
			getLumaKnob(false);
			isOver = ctx.isPointInPath(x, y);

			if (isOver) {
				canvas.style.cursor = 'pointer';
				return false;
			}

			/*
			 *	Check if HUE RING
			*/
			if (d > hr - thickness * 0.5 && d < hr + thickness * 0.5) {
				canvas.style.cursor = 'crosshair';
				return false;
			}

			canvas.style.cursor = 'default';
		}

		return false;
	}

	function mouseUp(e) {
		cevent(e);
		canvas.style.cursor = 'default';
		isDown = false;
		render();
	}

	/*
	 *	KEY handler (v.0.3)
	*/
	function keyDown(e) {

		var keyCode = e.charCode || e.keyCode,
			factor = e.shiftKey ? keyShiftFactor : 1,
			factor2 = factor * 0.01,
			hasChanged = false;

		switch(keyCode) {

			case hueKeyCodeUp:
				angle -= hueKeyDelta * factor;
				if (angle < 0) angle += 360;
				hasChanged = true;
				break;

			case hueKeyCodeDown:
				angle += hueKeyDelta * factor;
				angle %= 360;
				hasChanged = true;
				break;

			case satKeyCodeUp:
				if (!useSat) return;
				saturation -= satKeyDelta * factor2;
				hasChanged = true;
				break;

			case satKeyCodeDown:
				if (!useSat) return;
				saturation += satKeyDelta * factor2;
				hasChanged = true;
				break;

			case lightKeyCodeUp:
				if (!useLuma) return;
				lightness += lightKeyDelta * factor2;
				hasChanged = true;
				break;

			case lightKeyCodeDown:
				if (!useLuma) return;
				lightness -= lightKeyDelta * factor2;
				hasChanged = true;
				break;
		}

		if (hasChanged) {
			cevent(e);
			me.hsl(angle, saturation, lightness);
		}

	}

	/*
	 *	Get position
	*/
	function getXY(e) {

		cevent(e);

		var rect = canvas.getBoundingClientRect(),
			touches = e.targetTouches;

		isTouch = isDef(touches) && (msPointer ? e.pointerType === e.MSPOINTER_TYPE_TOUCH : true);

		if (isTouch && (touches.length === 1 || (msPointer && e.isPrimary))) {
			x = touches[0].clientX;
			y = touches[0].clientY;
		}
		else {
			x = e.clientX;
			y = e.clientY;
		}

		x -= rect.left;
		y -= rect.top;
	}

	function cevent(e) {
		if (e.stopPropagation) e.stopPropagation();
		if (e.preventDefault) e.preventDefault();
	}

	/*
	 *	Calc angle and distance
	 */
	function getTri(x, y) {

		var dx = x - cx,
			dy = y - cy;

		return {
			dist: Math.sqrt(dx*dx + dy*dy),
			angle: Math.atan2(dy, dx)
		}
	}

	/*
	 *	Calc setup
	*/
	function setup() {
		hr			= (w - thickness - lumaThickness * 3 - shadow * (useLuma ? 1 : 2)) * 0.5 + 1;	//hue radius
		lr			= (w - lumaThickness - shadow) * 0.5 + 1;										//light. radius
		lkw			= lumaThickness * 0.5;															//light knob
		lumaKnob	= [cx - 1, cy + lr];
		hueKnob		= [cx - thickness * 0.5, cy];
		l 			= Math.max(w * knobWidth, 5);
	}

	/*
	 *	Render methods
	*/
	function generateCanvas() {

		var i,
			rad,
			oldRad,
			mul,
			p;

		setup();

		ctx.clearRect(0, 0, w, h);

		canvas.width = canvas.height = w;
		canvas.innerHTML = '<h1>No HTML5 Canvas support. Please upgrade the browser.</h1>';

		/*
		 *	Render HUE wheel
		*/
		ctx.lineWidth = thickness;

		if (shadow > 0) {

			ctx.save();
			ctx.save();

			ctx.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 1)';
			ctx.shadowBlur = shadow;

			ctx.beginPath();
			ctx.arc(cx, cy, hr, 0, pi2);
			ctx.closePath();
			ctx.stroke();

			ctx.restore();

			ctx.globalCompositeOperation = 'destination-out';
			ctx.beginPath();
			ctx.arc(cx, cy, hr, 0, pi2);
			ctx.closePath();
			ctx.stroke();

			ctx.restore();
		}

		for(i = 0, oldRad = 0, mul = 4 / gwstep; i < 360; i += gwstep) {

			rad = (i + 1) * d2r;
			p = i * mul;

			ctx.strokeStyle = 'rgb(' + data[p] + ',' + data[p+1] + ',' + data[p+2] + ')';
			ctx.beginPath();
			ctx.arc(cx, cy, hr, oldRad, rad + 0.01);
			ctx.stroke();

			oldRad = rad;
		}

		/*
		 *	Render lightness wheel
		*/
		if (useLuma) {

			ctx.lineWidth = lumaThickness;

			for(i = 0, oldRad = 0, mul = 4 / gwstep; i < 360; i += gwstep) {

				rad = (i + 1) * d2r + dlt;
				p = (i + 360) * mul;

				ctx.strokeStyle = 'rgb(' + data[p] + ',' + data[p+1] + ',' + data[p+2] + ')';
				ctx.beginPath();
				ctx.arc(cx, cy, lr, oldRad, rad + 0.01);
				ctx.stroke();

				oldRad = rad;
			}
		}

		/*
		 *	Set static elements as background image of element
		*/
		canvas.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
		ctx.clearRect(0, 0, w, h);
	}

	function renderHueKnob(selected) {

		getHueKnob(true);

		if (hueShadow) {
			ctx.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 1)';
			ctx.shadowBlur = shadow;
		}

		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = selected ? hueKnobColorSel : hueKnobColor;
		ctx.fill();

		if (hueShadow) {
			ctx.shadowColor = 'rgba(0, 0, 0, 0)';
			ctx.shadowBlur = 0;
		}

		ctx.stroke();
	}

	function getHueKnob(drawLine) {

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.translate(cx, cy);
		ctx.rotate(angle * d2r);
		ctx.translate(-cx, -cy);

		var	kx = cx + l + (hr - thickness * 0.5 - l) * (useSat ? saturation : 1.0);

		if (useSat && drawLine) {
			ctx.lineWidth = 1;

			ctx.beginPath();
			ctx.moveTo(cx, cy - 0.5);
			ctx.lineTo(cx + hr - thickness * 0.5, cy - 0.5);
			ctx.strokeStyle = '#000';
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(cx, cy + 0.5);
			ctx.lineTo(cx + hr - thickness * 0.5, cy + 0.5);
			ctx.strokeStyle = '#fff';
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.moveTo(kx - 1, cy);
		ctx.lineTo(kx - l, cy - l * 0.7);
		ctx.lineTo(kx - l, cy + l  * 0.7);
		ctx.closePath();

		//ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	function renderLumaKnob(selected) {
		getLumaKnob(true, selected);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	function getLumaKnob(render, selected) {

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.translate(cx, cy);
		ctx.rotate(pi2 * lightness);
		ctx.translate(-cx, -cy);

		if (render) {
			ctx.beginPath();
			ctx.arc(lumaKnob[0], lumaKnob[1], lkw, 0, pi2);
			ctx.closePath();
			ctx.fillStyle = '#000';
			ctx.fill();

			ctx.beginPath();
			ctx.arc(lumaKnob[0], lumaKnob[1], lkw - 1, 0, pi2);
			ctx.closePath();
			ctx.fillStyle = selected ? lightKnobColorSel : lightKnobColor;
			ctx.fill();

		}
		else {
			ctx.beginPath();
			ctx.arc(lumaKnob[0], lumaKnob[1], lkw, 0, pi2);
			ctx.closePath();
		}
	}

	function render() {
		clear();
		renderHueKnob(false);
		if (useLuma) renderLumaKnob(false);
	}

	function clear() {

		getRGB();

		ctx.clearRect(0, 0, w, h);

		if (showColor) {
			var rd = (hr - thickness * 0.5) * colorWidth;

			ctx.beginPath();
			ctx.arc(cx, cy, rd, 0, pi2);
			ctx.closePath();
			ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
			ctx.fill();

			ctx.lineWidth = colorBorder;
			ctx.strokeStyle = colorBorderColor;
			ctx.stroke();
		}
	}

	function getRGB() {
		var rgb = isHSL ? hsl2rgb(angle, saturation, lightness) : hsv2rgb(angle, saturation, lightness);
		r = rgb.r;
		g = rgb.g;
		b = rgb.b;
		validate();
	}

	/*
	 *	Misc system and checks
	*/
	function sendEvent() {

		clearTimeout(to);

		if (me.onchange !== null)
			to = setTimeout(me.onchange({
				h: angle % 360,
				s: saturation,
				l: lightness,
				v: lightness,
				r: r,
				g: g,
				b: b,
				x: x,
				y: y,
				isIE: msPointer,
				isTouch: isTouch
			}), 12);
	}

	function validate() {

		angle %= 360;

		saturation = Math.max(0, Math.min(saturation, 1));
		lightness = Math.max(0, Math.min(lightness, 1));

		var c = validateRGB(r, g, b);

		r = c.r;
		g = c.g;
		b = c.b;
	}

	function validateRGB(r, g, b) {

		r = (r + 0.5)|0;
		g = (g + 0.5)|0;
		b = (b + 0.5)|0;

		r = Math.max(0, Math.min(r, 255));
		g = Math.max(0, Math.min(g, 255));
		b = Math.max(0, Math.min(b, 255));

		return {r:r, g:g, b:b}
	}

	/*
	 *	HSL and HSV <--> RGB
	*/
	function hsv2rgb(h, s, v) {

		h /= 60;

		var i = h|0,
			f = h - i,
			s1 = 1 - s,
			m = v * s1,
			n = v * (s1 * f),
			k = v * (s1 * (1 - f)),
			rgb;

		switch (i) {
			case 0:
				rgb = [v, k, m];
				break;
			case 1:
				rgb = [n, v, m];
				break;
			case 2:
				rgb = [m, v, k];
				break;
			case 3:
				rgb = [m, n, v];
				break;
			case 4:
				rgb = [k, m, v];
				break;
			case 5:
			case 6:
				rgb = [v, m, n];
				break;
		}

		return {
			r: (rgb[0] * 255 + 0.5) | 0,
			g: (rgb[1] * 255 + 0.5) | 0,
			b: (rgb[2] * 255 + 0.5) | 0
		}
	}

	function hsl2rgb(h, s, l) {

		var r, g, b, q, p;

		h /= 360;

		if (s === 0) {
			r = g = b = l;

		} else {
			function hue2rgb(p, q, t) {
				t %= 1;
				if (t < 0.166667) return p + (q - p) * t * 6;
				if (t < 0.5) return q;
				if (t < 0.666667) return p + (q - p) * (0.666667 - t) * 6;
				return p;
			}

			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;

			r = hue2rgb(p, q, h + 0.333333);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 0.333333);
		}

		r = (r * 255 + 0.5)|0;
		g = (g * 255 + 0.5)|0;
		b = (b * 255 + 0.5)|0;

		r = Math.max(0, Math.min(r, 255));
		g = Math.max(0, Math.min(g, 255));
		b = Math.max(0, Math.min(b, 255));

		return {
			r: r,
			g: g,
			b: b
		}
	}

	function rgb2hsl(r, g, b){

		r /= 255;
		g /= 255;
		b /= 255;

		var maxColor = Math.max(r, g, b),
			minColor = Math.min(r, g, b),
			d = (maxColor - minColor),
			h = 0,
			s = 0,
			l = (maxColor + minColor) * 0.5;

		if (maxColor !== minColor){

			if (l < 0.5) {
				s = d / (maxColor + minColor);
			} else {
				s = d / (2.0 - maxColor - minColor);
			}

			//Calculate H:
			if (r === maxColor) {
				h = (g - b) / d;

			} else if (g === maxColor) {
				h = 2.0 + (b - r) / d;

			} else {
				h = 4.0 + (r - g) / d;
			}
		}

		h *= 60;
		if (h < 0.0) h += 360.0;

		return {
			h: h,
			s: s,
			l: l
		}
	}

	function rgb2hsv(r, g, b) {

		r /= 255;
		g /= 255;
		b /= 255;

		var h, s, v, d,
			minRGB = Math.min(r, Math.min(g, b)),
			maxRGB = Math.max(r, Math.max(g, b));

		if (minRGB === maxRGB) {

			v = minRGB;

			return {
				h: 0,
				s: 0,
				v: v
			}
		}

		// Colors other than black-gray-white:
		d = (r === minRGB) ? g - b : ((b === minRGB) ? r - g : b - r);
		h = (r === minRGB) ? 3 : ((b === minRGB) ? 1 : 5);

		h = 60 * (h - d / (maxRGB - minRGB));
		s = (maxRGB - minRGB) / maxRGB;
		v = maxRGB;

		return {
			h: h,
			s: s,
			v: v
		}
	}

	/*
	 *	Exposed methods
	*/

	/**
	 * Set the Hue Wheel current value using HSL. If no arguments ar
	 * given current color is returned as Object with h, s, l as
	 * properties.
	 *
	 * @param {Number} [h] - Hue
	 * @param {Number} [s] - Saturation
	 * @param {Number} [l] - Lightness
	 * @returns {*}
	 */
	this.hsl = function(h, s, l) {

		if (arguments.length === 0) {

			if (isHSL) {
				return {h: angle, s: saturation, l: lightness};

			} else {

				var rgb = hsv2rgb(angle, saturation, lightness),
					hsl = rgb2hsl(rgb.r, rgb.g, rgb.b);

				return {h: hsl.h, s: hsl.s, l: hsl.l};
			}
		}

		setHSLV(h, s, l);

		return this;
	};

	/**
	 * Set the Hue Wheel current value using HSV. If no arguments ar
	 * given current color is returned as Object with h, s, v as
	 * properties.
	 *
	 * @param {Number} [h] - Hue
	 * @param {Number} [s] - Saturation
	 * @param {Number} [v] - Brightness
	 * @returns {*}
	 */
	this.hsv = function(h, s, v) {

		var rgb, hsv, hsl;

		if (arguments.length === 0) {
			if (isHSL) {
				rgb = hsl2rgb(angle, saturation, lightness);
				hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
				return {h: hsv.h, s: hsv.s, v: hsv.v};

			} else {
				return {h: angle, s: saturation, v: lightness};
			}
		}

		rgb = hsv2rgb(h, s, v);
		hsl = rgb2hsl(rgb.r, rgb.g, rgb.b);

		setHSLV(hsl.h, hsl.s, hsl.l);

		return this;
	};

	function setHSLV(h, s, l) {

		angle = h;
		saturation = s;
		lightness = l;

		validate();
		render();
		sendEvent();
	}

	/**
	 * Set the Hue Wheel current value using RGB. If no arguments ar
	 * given current color is returned as Object with r, g, b as
	 * properties.
	 *
	 * @param {Number} [r] - red
	 * @param {Number} [g] - green
	 * @param {Number} [b] - blue
	 * @returns {*}
	 */
	this.rgb = function(r, g, b) {

		if (arguments.length === 0)
			return {h: angle, s: saturation, l: lightness, v: lightness};

		var rgb = validateRGB(r, g, b);

		r = rgb.r;
		g = rgb.g;
		b = rgb.b;

		var hsl = (isHSL) ? rgb2hsl(r, g, b) : rgb2hsv(r, g, b);

		angle = hsl.h;
		saturation = hsl.s;
		lightness = hsl.l || hsl.v;

		validate();
		render();
		sendEvent();

		return this;
	};

	/*
	 *	Internal helpers
	*/
	function isStr(a) {return (typeof a === 'string')}
	function isBool(a) {return (typeof a === 'boolean')}
	function isNum(a) {return (typeof a === 'number')}
	function isDef(a) {return (typeof a !== 'undefined')}

	/*
	 *	METHODS
	*/

	/**
	 * Show or hide color spot. If no arguments are given the current
	 * state is returned.
	 *
	 * @param {Boolean} [state=true]
	 * @returns {*}
	 */
	this.showColor = function(state) {

		if (arguments.length === 0 || !isBool(state))
			return showColor;

		showColor = state;

		render();

		return this;
	};

	/**
	 * Allow changing lightness (show or hide lightness ring).
	 * If no arguments are given the current state is returned.
	 *
	 * @param {Boolean} [state=true]
	 * @returns {*}
	 */
	this.changeLightness = function(state) {

		if (arguments.length === 0 || !isBool(state))
			return useLuma;

		useLuma = state;

		lumaThickness = useLuma ? (options.lumaThickness || Math.max(w * 0.05, 3)) : 0;

		generateCanvas();
		render();

		return this;
	};

	/**
	 * Allow changing saturation (show or hide saturation slider).
	 * If no arguments are given the current state is returned.
	 *
	 * @param {Boolean} [state=true]
	 * @returns {*}
	 */
	this.changeSaturation = function(state) {

		if (arguments.length === 0 || !isBool(state))
			return useSat;

		useSat = state;

		generateCanvas();
		render();

		return this;
	};

	/**
	 * Change thickness of Hue ring. If no argument is given then
	 * current thickness is returned.
	 *
	 * @param {Number} [t] - Factor or width max 30% of control diameter
	 * @returns {*}
	 */
	this.thicknessHue = function(t) {

		if (arguments.length === 0 || !isNum(t))
			return thickness;

		if (t < 3) t = 3;
		if (t > w * 0.3) t = (w * 0.3)|0;

		thickness = t;

		generateCanvas();
		render();

		return this;
	};

	/**
	 * Change thickness of lightnes ring. If no argument is given then
	 * current thickness is returned.
	 *
	 * @param {Number} [t] - Factor or width max 20% of control diameter
	 * @returns {*}
	 */
	this.thicknessLightness = function(t) {

		if (arguments.length === 0 || !isNum(t))
			return thickness;

		if (t < 3) t = 3;
		if (t > w * 0.2) t = (w * 0.2)|0;

		lumaThickness = t;

		generateCanvas();
		render();

		return this;
	};

	/**
	 * A normalized factor of control's radius used for the color
	 * spot. If no argument is given current radius factor is returned.
	 *
	 * @param {Number} [radiusFactor] - [0.0, 1.0]
	 * @returns {*}
	 */
	this.colorSpotRadius = function(radiusFactor) {

		if (arguments.length === 0 || !isNum(radiusFactor))
			return colorWidth;

		colorWidth = radiusFactor;

		generateCanvas();
		render();

		return this;
	};

	/**
	 * Set or get color space (HSL or HSV).
	 *
	 * @param {String} [spc] - name of color space
	 * @returns {*}
	 */
	this.colorSpace = function(spc) {

		if (arguments.length === 0 || (spc !== 'hsl' && spc !== 'hsv'))
			return isHSL ? 'hsl' : 'hsv';

		var rgb, c;

		if (isHSL && spc === 'hsv') {

			rgb = hsl2rgb(angle, saturation, lightness);
			c = rgb2hsv(rgb.r, rgb.g, rgb.b);

			angle = c.h;
			saturation = c.s;
			lightness = c.v;

		}
		else if (!isHSL && spc === 'hsl') {

			rgb = hsv2rgb(angle, saturation, lightness);
			c = rgb2hsl(rgb.r, rgb.g, rgb.b);

			angle = c.h;
			saturation = c.s;
			lightness = c.l;
		}

		isHSL = (spc === 'hsl');

		render();
		sendEvent();

		return this;
	};

	/**
	 * Set or get if lightness ring should allow mouse to click anywhere
	 * in the ring to set new lightness. If off the knob only can be
	 * used.
	 *
	 * @param {Boolean} [state]
	 * @returns {*}
	 */
	this.lightnessClickable = function(state) {

		if (arguments.length === 0 || !isBool(state))
			return lightClickable;

		lightClickable = state;

		return this;
	};

	/*
	 *	Convertion public vectors
	*/
	this.rgb2hsl = rgb2hsl;
	this.rgb2hsv = rgb2hsv;
	this.hsv2rgb = hsv2rgb;
	this.hsl2rgb = hsl2rgb;

	return this;
}

/**
 * Event object for HueWheel (onchange)
 *
 * @event HueWheel#mouseEvent
 * @type {Object}
 * @prop {Number} h - current hue [0, 360>
 * @prop {Number} s - current saturation [0.0, 1.0]
 * @prop {Number} l - (if HSL mode) current lightness [0.0, 0.1]
 * @prop {Number} v - (if HSV mode) current brightness [0.0, 0.1]
 * @prop {Number} r - current red [0, 255]
 * @prop {Number} g - current green [0, 255]
 * @prop {Number} b - current blue [0, 255]
 * @prop {Number} x - current x position in wheel
 * @prop {Number} y - current y position in wheel
 * @prop {Boolean} isTouch - Event was triggered by touch and not mouse
 */
