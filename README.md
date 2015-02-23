Hue Wheel for JavaScript
========================

![Demo snapshot](http://i.imgur.com/by5YtY3.png)
*<sup>Snapshot from tint demo.</sup>*

HueWheel is a HSL/HSV HTML5 color wheel *control*. Supports HSL/HSV <-> RGB values with many options for
appearance and functionality. The control can be controlled with both mouse and touch/pen.

**FEATURES:**

- Rotating knobs changing values in real-time.
- HSL/HSV color space with built-in color-space convertion between RGB, HSL and HSV.
- Hue, Saturation, Lightness/Brightness (depending on chosen color-space mode) can be controlled individually with controls or programatically.
- Supports mouse and touch/pen
- Supports keys for accesibility (when control is active)
- Highly configurable (visible controls, sizes, start values, converted RGB <-> HSL/HSV, colors and more)

Live demo
=========

See this page for live demo:

[http://epistemex.github.io/HueWheel/](http://epistemex.github.io/HueWheel/)


Examples
========

All visible features activated
------------------------------

<img src="http://i.imgur.com/ealXjHB.png" alt="All controls activated" />


Color spot disabled
-------------------

You will still receive color value as RGB, HSL/HSV in the onchange event. This is useful
if you want to present the current color in a custom way.

<img src="http://i.imgur.com/eN3jmIP.png" alt="Color spot disabled" />


Lightness wheel disabled
------------------------

Lightness can still be changed programatically but is not visible in the control. Useful when you only want to
tint an image using the luminance from the image as input instead.

<img src="http://imgur.com/YhXn6RT.png" alt="Lightness wheel disabled" />


Saturation slider disabled
--------------------------

Saturation can still be changed programatically but is not visible in the control.

<img src="http://i.imgur.com/71NFm2X.png" alt="Saturation slider disabled" />


**USAGE:**

    var hw = new hueWheel(element|id, options);

    element | id
        The element or id (as string) to turn into a HUE wheel.

**OPTIONS:**

    diameter (integer)
        diameter of control

    shadowBlur (float)
        size of shadow (0 = off)

    shadowColor (string)
        Color of shadow if used.

    hue (float)
        Initial hue value [0, 360]

    saturation (float)
        Initial saturation value [0.0, 1.0]. Default 1.0.

    lightness (float)
        Initial lightness value [0.0, 1.0]. Default 0.5 with HSL, 1.0 with HSV.

    rgb (array)
        Inital rgb value (overrides hue, saturation and lightness)

    changeSaturation (bool)
        Enable control to change saturation. Default false.

    changeLightness (bool)
        Enable control to change lightness. Default false.

    colorSpace (string)
        Can be either 'hsl' or 'hsv'. Default is 'hsl'.

    showColorSpot (bool)
        Show current color in the center. Default false.

    onChange (function)
        Function to call on each update.

    colorSpotWidth (float)
        If showColor is used this is the ratio of the radius from center to the edge of
        hue wheel. Value can be [0.0, 1.0], default 0.7 (70%).

    colorSpotBorder
        If showColor is used this is the width of the border. A close to 0 turns the
        border off.

    colorSpotBorderColor
        If showColor and colorBorder > 0 this will be the color of the border.
        Default is black.

    thicknessHue (integer)
        Thickness of hue ring in pixels

    thicknessLightness (integer)
        Thickness of lightness ring in pixels.

    quality (integer)
        Quality or resolution of gradients. Higher is better. Default is 2.
        Note: must be in steps of 2^q (ie., 1, 2, 4). The higher quality
        the longer time it takes to render "static" changes.

    hueKnobSize (float) v.0.2
        A value [0.0, 1.0] determining the size of the hue knob relative to radius.
        Default: 0.1 (10%)

    hueKnobColor (string) v.0.2
        Color for hue knob (default is white).

    lightnessKnobColor (string) v.0.2
        Color for lightness knob (default is white).

    hueKnobColorSelected (string) v.0.2
        Color for hue knob when selected (default is #777).

    lightnessKnobColorSelected (string) v.0.2
        Color for lightness knob when selected (default is #777).

    lightnessRingClickable (boolean) v.0.2
        Makes lightness ring clickable (outside knob, inside ring).

    hueKnobShadow (boolean) v.0.3
        Use shadow with hue knob if shadow is activated.

    useKeys (boolean) v.0.3
        Enable usage of keys to control hsl when control is active. Default: true.

    hueKeyDelta (number) v.0.3
        Delta values to increment/decrement the hue value with when its hotkey is pressed.
        Default: 1

    saturationKeyDelta (number) v.0.3
        Delta values to increment/decrement the saturation value with when its hotkey is pressed.
        Default: 1

    lightnessKeyDelta (number) v.0.3
        Delta values to increment/decrement the lightness value with when its hotkey is pressed.
        Default: 1

    keyShiftFactor (number) v.0.3
        When the shift key is held down the delta values are multiplied with this factor when
        using the hotkeys.
        Default: 10

    hueKeyCodeUp / ..Down (number) v.0.3
        Key code to use to alter hue value.
        Default: Page Up / Page Down

    saturationKeyCodeUp / ..Down (number) v.0.3
        Key code to use to alter saturation value.
        Default: Left / Right arrow keys

    lightnessKeyCodeUp / ..Down (number) v.0.3
        Key code to use to alter lightness value.
        Default: Up / Down arrow keys

	tabable (boolean) v.1.0
		Make control tab-able to access fully with keys.
		Default: true

**METHODS:**

Methods can be chained in set mode.

    showColor([bool])

        Get status or toggle color spot on or off.

    changeSaturation([bool])

        Get status or enable/disable visual adjustment of saturation.

    changeLightness([bool])

        Get status or enable/disable visual adjustment of lightness / brightness.

    hsl([h, s, l])

        Get or set HSL value (updates control). If in HSV mode values are
        automatically converted.

    hsv([h, s, v])

        Get or set HSV value (updates control). If in HSL mode values are
        automatically converted.

    rgb([r, g, b])

        Get or set RGB value (updates control).

    thicknessHue([value])

        Get or set thickness of HUE wheel and updates control.

    thicknessLightness([value])

        Get or set thickness of Lightness/Brightness wheel and updates control.

    colorSpotRadius([value])

        Gets or sets the radius factor of the color spot and updates if
        color spot is visible.

    colorSpace([string])

        Get or set color space. Possible values are 'hsl' and 'hsv'.

    lightnessClickable([bool])

        Get or set clickable status of the lightness ring outside the knob.


**FUNCTIONS:**

Available on the instance -

    rgb2hsl(r, g, b) -> hsl object with properties h, s, l
    rgb2hsv(r, g, b) -> hsv object with properties h, s, v
    hsl2rgb(h, s, l) -> rgb object with properties r, g, b
    hsv2rgb(h, s, v) -> rgb object with properties r, g, b

**EVENTS:**

    hueWheelObject.onchange = function(event) { ... }

Can also be set via options using the onChange property.

Event object properties:

    h = current hue [0, 360]
    s = current saturation [0.0, 0.1]
    l = (if HSL mode) current lightness [0.0, 0.1]
    v = (if HSV mode) current brightness [0.0, 0.1]
    r = current red [0, 255]
    g = current green [0, 255]
    b = current blue [0, 255]
    x = current x position in wheel
    y = current y position in wheel
    isTouch = event was triggered using touch and not mouse/pen


Note on Internet Explorer
-------------------------

For touch-enabled devices using internet explorer -

To make MSPointerMove event work properly you need to redirect all pointer events using CSS:

    html {
        -ms-touch-action: none;
        }

This will allow the hue wheel to work with IE 10/11 and touch. As it's prefixed it
won't affect other browsers. See included demos for example.

Also, if you get selected text and don't want this you can use:

    element.addEventListener('selectstart', function(e) { e.preventDefault(); }, false);

[Read more here](http://msdn.microsoft.com/en-us/library/ie/hh673557%28v=vs.85%29.aspx)


License
-------

Released under [MIT license](http://choosealicense.com/licenses/mit/). You can use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.

*&copy; 2013-2014 Epistemex*

![Epistemex](http://i.imgur.com/YxO8CtB.png)
