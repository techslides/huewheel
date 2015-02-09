
// Internal - only to remove def. errors in WebStorm

var o = {};
o.lumaThickness = 0;
o.isPrimary = true;
o.targetTouches = [];
o.MSPOINTER_TYPE_TOUCH = '';
o.pointerType = '';

var i = new HueWheel();
i.thicknessLightness();
i.colorSpotRadius();

navigator.msPointerEnabled = 0;
navigator.msMaxTouchPoints = 0;

var t = hueWheel;
Array.isArray = {};
