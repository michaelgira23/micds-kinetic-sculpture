/**
 * Custom functions outside of the jQuery Easing plugin
 */

export function none(x: number) {
	return x === 1 ? 1 : 0;
}

export function split(x: number) {
	return x < 0.5 ? 0 : 1;
}

export function linear(x: number) {
	return x;
}

/**
 * jQuery Easing v1.3.1 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *
 *
 * TERMS OF USE - EASING EQUATIONS
 * Open source under the BSD License.
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const pow = Math.pow;
const sqrt = Math.sqrt;
const sin = Math.sin;
const cos = Math.cos;
const PI = Math.PI;
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = ( 2 * PI ) / 3;
const c5 = ( 2 * PI ) / 4.5;

// x is the fraction of animation progress, in the range 0..1
function bounceOut(x: number) {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= (1.5 / d1)) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= (2.25 / d1)) * x + 0.9375;
	} else {
		return n1 * (x -= (2.625 / d1)) * x + 0.984375;
	}
}

export function swing(x: number) {
	return easeOutQuad(x);
}

export function easeInQuad(x: number) {
		return x * x;
}

export function easeOutQuad(x: number) {
	return 1 - (1 - x) * (1 - x);
}

export function easeInOutQuad(x: number) {
	return x < 0.5 ?
			2 * x * x :
			1 - pow(-2 * x + 2, 2) / 2;
}

export function easeInCubic(x: number) {
	return x * x * x;
}

export function easeOutCubic(x: number) {
	return 1 - pow(1 - x, 3);
}

export function easeInOutCubic(x: number) {
	return x < 0.5 ?
		4 * x * x * x :
		1 - pow(-2 * x + 2, 3) / 2;
}

export function easeInQuart(x: number) {
	return x * x * x * x;
}

export function easeOutQuart(x: number) {
	return 1 - pow(1 - x, 4);
}

export function easeInOutQuart(x: number) {
	return x < 0.5 ?
		8 * x * x * x * x :
		1 - pow(-2 * x + 2, 4) / 2;
}

export function easeInQuint(x: number) {
	return x * x * x * x * x;
}

export function easeOutQuint(x: number) {
	return 1 - pow(1 - x, 5);
}

export function easeInOutQuint(x: number) {
	return x < 0.5 ?
		16 * x * x * x * x * x :
		1 - pow(-2 * x + 2, 5) / 2;
}

export function easeInSine(x: number) {
	return 1 - cos(x * PI / 2);
}

export function easeOutSine(x: number) {
	return sin(x * PI / 2);
}

export function easeInOutSine(x: number) {
	return -(cos(PI * x) - 1) / 2;
}

export function easeInExpo(x: number) {
	return x === 0 ? 0 : pow(2, 10 * x - 10);
}

export function easeOutExpo(x: number) {
	return x === 1 ? 1 : 1 - pow(2, -10 * x);
}

export function easeInOutExpo(x: number) {
	return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
		pow(2, 20 * x - 10) / 2 :
		(2 - pow(2, -20 * x + 10)) / 2;
}

export function easeInCirc(x: number) {
	return 1 - sqrt(1 - pow(x, 2));
}

export function easeOutCirc(x: number) {
	return sqrt(1 - pow(x - 1, 2));
}

export function easeInOutCirc(x: number) {
	return x < 0.5 ?
		(1 - sqrt(1 - pow(2 * x, 2))) / 2 :
		(sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
}

export function easeInElastic(x: number) {
	return x === 0 ? 0 : x === 1 ? 1 :
		-pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
}

export function easeOutElastic(x: number) {
	return x === 0 ? 0 : x === 1 ? 1 :
		pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
}

export function easeInOutElastic(x: number) {
	return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ?
		-(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2 :
		pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5) / 2 + 1;
}

export function easeInBack(x: number) {
	return c3 * x * x * x - c1 * x * x;
}

export function easeOutBack(x: number) {
	return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
}

export function easeInOutBack(x: number) {
	return x < 0.5 ?
		(pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2 )) / 2 :
		(pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function easeInBounce(x: number) {
	return 1 - bounceOut(1 - x);
}

export function easeOutBounce(x: number) {
	return bounceOut(x);
}

export function easeInOutBounce(x: number) {
	return x < 0.5 ?
		(1 - bounceOut(1 - 2 * x)) / 2 :
		(1 + bounceOut(2 * x - 1)) / 2;
}
