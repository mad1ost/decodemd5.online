'use strict';

document.addEventListener('DOMContentLoaded', main);

function main() {
	const vs = `#version 300 es

	#define MD5_A 0x67452301u
	#define MD5_B 0xefcdab89u
	#define MD5_C 0x98badcfeu
	#define MD5_D 0x10325476u

	#define F(x, y, z) (((y ^ z) & x) ^ z)
	#define G(x, y, z) ((x & z) | (y & ~z))
	#define H(x, y, z) (x ^ (y ^ z))
	#define I(x, y, z) (y ^ (x | ~z))

	#define ROTATE_LEFT(x, n) (x << n) | (x >> (32 - n));

	#define MD5_CYCLE(f, a, b, c, d, x, s) \
	{ \
		a += f (b, c, d) + x; \
		a = ROTATE_LEFT(a, s); \
		a += b; \
	}

	uniform uvec4 searched;
	uniform uvec2 gid_max;
	uniform uvec2 pw_len;
	uniform uvec2 offset;
	uniform uint chars_cnt;
	uniform uint uint_limit;
	uniform uint chars[128]; // first half of ASCII table

	flat out uvec4 v_color;

	void main ()
	{
		gl_Position = vec4(2., 2., 2., 1.); // out of clip space

		uvec2 gid = offset;
		gid.y += uint(gl_VertexID);

		if (gid.y >= uint_limit) {
			gid.y = gid.y - uint_limit;
			gid.x++;
		}
		if (all(greaterThanEqual(gid, gid_max)))
			return;

		uint pw[16] = uint[]( // 16 chars of password
			0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u
		);
		uvec2 val = gid;
		uvec2 j;

		for (j = uvec2(pw_len.y, 0u); all(lessThan(j, pw_len)); j++) {
			uvec2 next = val / chars_cnt;
			uvec2 pos  = val % chars_cnt;

			val = next;

			pw[j.x] = chars[pos.x];
			pw[j.y] = chars[pos.y];
		}
		for (; j.y < pw_len.y; j.y++) {
			uint next = val.y / chars_cnt;
			uint pos  = val.y % chars_cnt;

			val.y = next;

			pw[j.y] = chars[pos];
		}
		pw[pw_len.x] = 0x80u; // padding 1 bit

		uint w[16] = uint[]( // 16 32-bit words
			0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u, 0u
		);

		w[0] |= pw[ 0] << 8;
		w[0] |= pw[ 1] << 16;
		w[0] |= pw[ 2] << 24;

		w[1] |= pw[ 3] << 0;
		w[1] |= pw[ 4] << 8;
		w[1] |= pw[ 5] << 16;
		w[1] |= pw[ 6] << 24;

		w[2] |= pw[ 7] << 0;
		w[2] |= pw[ 8] << 8;
		w[2] |= pw[ 9] << 16;
		w[2] |= pw[10] << 24;

		w[3] |= pw[11] << 0;
		w[3] |= pw[12] << 8;
		w[3] |= pw[13] << 16;
		w[3] |= pw[14] << 24;

		w[14] = (pw_len.x + 1u) * 8u; // adding length

		uint F_0 = 0u    + 0xd76aa478u;
		uint F_1 = w[ 1] + 0xe8c7b756u;
		uint F_2 = w[ 2] + 0x242070dbu;
		uint F_3 = w[ 3] + 0xc1bdceeeu;
		uint F_4 = w[ 4] + 0xf57c0fafu;
		uint F_5 = w[ 5] + 0x4787c62au;
		uint F_6 = w[ 6] + 0xa8304613u;
		uint F_7 = w[ 7] + 0xfd469501u;
		uint F_8 = w[ 8] + 0x698098d8u;
		uint F_9 = w[ 9] + 0x8b44f7afu;
		uint F_a = w[10] + 0xffff5bb1u;
		uint F_b = w[11] + 0x895cd7beu;
		uint F_c = w[12] + 0x6b901122u;
		uint F_d = w[13] + 0xfd987193u;
		uint F_e = w[14] + 0xa679438eu;
		uint F_f = w[15] + 0x49b40821u;
		
		uint G_0 = w[ 1] + 0xf61e2562u;
		uint G_1 = w[ 6] + 0xc040b340u;
		uint G_2 = w[11] + 0x265e5a51u;
		uint G_3 = 0u    + 0xe9b6c7aau;
		uint G_4 = w[ 5] + 0xd62f105du;
		uint G_5 = w[10] + 0x02441453u;
		uint G_6 = w[15] + 0xd8a1e681u;
		uint G_7 = w[ 4] + 0xe7d3fbc8u;
		uint G_8 = w[ 9] + 0x21e1cde6u;
		uint G_9 = w[14] + 0xc33707d6u;
		uint G_a = w[ 3] + 0xf4d50d87u;
		uint G_b = w[ 8] + 0x455a14edu;
		uint G_c = w[13] + 0xa9e3e905u;
		uint G_d = w[ 2] + 0xfcefa3f8u;
		uint G_e = w[ 7] + 0x676f02d9u;
		uint G_f = w[12] + 0x8d2a4c8au;
		
		uint H_0 = w[ 5] + 0xfffa3942u;
		uint H_1 = w[ 8] + 0x8771f681u;
		uint H_2 = w[11] + 0x6d9d6122u;
		uint H_3 = w[14] + 0xfde5380cu;
		uint H_4 = w[ 1] + 0xa4beea44u;
		uint H_5 = w[ 4] + 0x4bdecfa9u;
		uint H_6 = w[ 7] + 0xf6bb4b60u;
		uint H_7 = w[10] + 0xbebfbc70u;
		uint H_8 = w[13] + 0x289b7ec6u;
		uint H_9 = 0u    + 0xeaa127fau;
		uint H_a = w[ 3] + 0xd4ef3085u;
		uint H_b = w[ 6] + 0x04881d05u;
		uint H_c = w[ 9] + 0xd9d4d039u;
		uint H_d = w[12] + 0xe6db99e5u;
		uint H_e = w[15] + 0x1fa27cf8u;
		uint H_f = w[ 2] + 0xc4ac5665u;
		
		uint I_0 = 0u    + 0xf4292244u;
		uint I_1 = w[ 7] + 0x432aff97u;
		uint I_2 = w[14] + 0xab9423a7u;
		uint I_3 = w[ 5] + 0xfc93a039u;
		uint I_4 = w[12] + 0x655b59c3u;
		uint I_5 = w[ 3] + 0x8f0ccc92u;
		uint I_6 = w[10] + 0xffeff47du;
		uint I_7 = w[ 1] + 0x85845dd1u;
		uint I_8 = w[ 8] + 0x6fa87e4fu;
		uint I_9 = w[15] + 0xfe2ce6e0u;
		uint I_a = w[ 6] + 0xa3014314u;
		uint I_b = w[13] + 0x4e0811a1u;
		uint I_c = w[ 4] + 0xf7537e82u;
		uint I_d = w[11] + 0xbd3af235u;
		uint I_e = w[ 2] + 0x2ad7d2bbu;
		uint I_f = w[ 9] + 0xeb86d391u;

		uvec4 w0l = uvec4(w[0]);

		for (uint i = 0u; i < chars_cnt; i += 4u) {
			uvec4 w0r = uvec4(chars[i], chars[i + 1u], chars[i + 2u], chars[i + 3u]);
			uvec4 w0 = w0l | w0r;

			uvec4 a = uvec4(MD5_A);
			uvec4 b = uvec4(MD5_B);
			uvec4 c = uvec4(MD5_C);
			uvec4 d = uvec4(MD5_D);

			MD5_CYCLE (F, a, b, c, d, w0 + F_0,  7);
			MD5_CYCLE (F, d, a, b, c,      F_1, 12);
			MD5_CYCLE (F, c, d, a, b,      F_2, 17);
			MD5_CYCLE (F, b, c, d, a,      F_3, 22);
			MD5_CYCLE (F, a, b, c, d,      F_4,  7);
			MD5_CYCLE (F, d, a, b, c,      F_5, 12);
			MD5_CYCLE (F, c, d, a, b,      F_6, 17);
			MD5_CYCLE (F, b, c, d, a,      F_7, 22);
			MD5_CYCLE (F, a, b, c, d,      F_8,  7);
			MD5_CYCLE (F, d, a, b, c,      F_9, 12);
			MD5_CYCLE (F, c, d, a, b,      F_a, 17);
			MD5_CYCLE (F, b, c, d, a,      F_b, 22);
			MD5_CYCLE (F, a, b, c, d,      F_c,  7);
			MD5_CYCLE (F, d, a, b, c,      F_d, 12);
			MD5_CYCLE (F, c, d, a, b,      F_e, 17);
			MD5_CYCLE (F, b, c, d, a,      F_f, 22);

			MD5_CYCLE (G, a, b, c, d,      G_0,  5);
			MD5_CYCLE (G, d, a, b, c,      G_1,  9);
			MD5_CYCLE (G, c, d, a, b,      G_2, 14);
			MD5_CYCLE (G, b, c, d, a, w0 + G_3, 20);
			MD5_CYCLE (G, a, b, c, d,      G_4,  5);
			MD5_CYCLE (G, d, a, b, c,      G_5,  9);
			MD5_CYCLE (G, c, d, a, b,      G_6, 14);
			MD5_CYCLE (G, b, c, d, a,      G_7, 20);
			MD5_CYCLE (G, a, b, c, d,      G_8,  5);
			MD5_CYCLE (G, d, a, b, c,      G_9,  9);
			MD5_CYCLE (G, c, d, a, b,      G_a, 14);
			MD5_CYCLE (G, b, c, d, a,      G_b, 20);
			MD5_CYCLE (G, a, b, c, d,      G_c,  5);
			MD5_CYCLE (G, d, a, b, c,      G_d,  9);
			MD5_CYCLE (G, c, d, a, b,      G_e, 14);
			MD5_CYCLE (G, b, c, d, a,      G_f, 20);

			MD5_CYCLE (H, a, b, c, d,      H_0,  4);
			MD5_CYCLE (H, d, a, b, c,      H_1, 11);
			MD5_CYCLE (H, c, d, a, b,      H_2, 16);
			MD5_CYCLE (H, b, c, d, a,      H_3, 23);
			MD5_CYCLE (H, a, b, c, d,      H_4,  4);
			MD5_CYCLE (H, d, a, b, c,      H_5, 11);
			MD5_CYCLE (H, c, d, a, b,      H_6, 16);
			MD5_CYCLE (H, b, c, d, a,      H_7, 23);
			MD5_CYCLE (H, a, b, c, d,      H_8,  4);
			MD5_CYCLE (H, d, a, b, c, w0 + H_9, 11);
			MD5_CYCLE (H, c, d, a, b,      H_a, 16);
			MD5_CYCLE (H, b, c, d, a,      H_b, 23);
			MD5_CYCLE (H, a, b, c, d,      H_c,  4);
			MD5_CYCLE (H, d, a, b, c,      H_d, 11);
			MD5_CYCLE (H, c, d, a, b,      H_e, 16);
			MD5_CYCLE (H, b, c, d, a,      H_f, 23);

			MD5_CYCLE (I, a, b, c, d, w0 + I_0,  6);
			MD5_CYCLE (I, d, a, b, c,      I_1, 10);
			MD5_CYCLE (I, c, d, a, b,      I_2, 15);
			MD5_CYCLE (I, b, c, d, a,      I_3, 21);
			MD5_CYCLE (I, a, b, c, d,      I_4,  6);
			MD5_CYCLE (I, d, a, b, c,      I_5, 10);
			MD5_CYCLE (I, c, d, a, b,      I_6, 15);
			MD5_CYCLE (I, b, c, d, a,      I_7, 21);
			MD5_CYCLE (I, a, b, c, d,      I_8,  6);
			MD5_CYCLE (I, d, a, b, c,      I_9, 10);
			MD5_CYCLE (I, c, d, a, b,      I_a, 15);
			MD5_CYCLE (I, b, c, d, a,      I_b, 21);
			MD5_CYCLE (I, a, b, c, d,      I_c,  6);
			MD5_CYCLE (I, d, a, b, c,      I_d, 10);
			MD5_CYCLE (I, c, d, a, b,      I_e, 15);
			MD5_CYCLE (I, b, c, d, a,      I_f, 21);

			a += MD5_A;
			b += MD5_B;
			c += MD5_C;
			d += MD5_D;

			if (all(equal(searched, uvec4(a.x, b.x, c.x, d.x)))) {
				if (i < chars_cnt) {
					v_color = uvec4(gid.x, gid.y, i, 1u);
					gl_Position = vec4(.0, .0, .0, 1.);
				}
			}
			if (all(equal(searched, uvec4(a.y, b.y, c.y, d.y)))) {
				if (i + 1u < chars_cnt) {
					v_color = uvec4(gid.x, gid.y, i + 1u, 1u);
					gl_Position = vec4(.0, .0, .0, 1.);
				}
			}
			if (all(equal(searched, uvec4(a.z, b.z, c.z, d.z)))) {
				if (i + 2u < chars_cnt) {
					v_color = uvec4(gid.x, gid.y, i + 2u, 1u);
					gl_Position = vec4(.0, .0, .0, 1.);
				}
			}
			if (all(equal(searched, uvec4(a.w, b.w, c.w, d.w)))) {
				if (i + 3u < chars_cnt) {
					v_color = uvec4(gid.x, gid.y, i + 3u, 1u);
					gl_Position = vec4(.0, .0, .0, 1.);
				}
			}
		}
	}
	`;

	const fs = `#version 300 es
		precision highp int;

		flat in uvec4 v_color;
		out uvec4 f_color;

		void main() {
			f_color = v_color;
		}
	`;

	const output = document.getElementById('output');
	const gl = document.createElement('canvas').getContext('webgl2');
	if (!gl) {
		output.innerText = 'Unfortunately WebGL 2 is not available in this browser.';
		return;
	}
	const prog = createProgram(gl, vs, fs);
	if (!prog) return;

	let isRunning = false;
	const button = document.getElementById('button');
	button.addEventListener('click', decode);

	function decode() {
		if (isRunning) {
			isRunning = false;
			button.textContent = 'Decode';
			return;
		}
		const hash = document.getElementById('hash').value
			.replace(/\s+/g, '')
			.toLowerCase();
		if (hash === '') {
			output.innerText = 'md5 hash value is empty.';
			return;
		}
		const re = /^[0-9a-f]{32}$/;
		if (!re.test(hash)) {
			output.innerText = 'md5 hash value is invalid.';
			return;
		}
		const searched = [];
		for (let i = 0; i < 4; i++) {
			const offset = 8 * i;
			const dword = hash.slice(offset, offset + 8);
			searched[i] = parseInt(dword.match(/../g).reverse().join(''), 16);
		}
		const pwLen = parseInt(document.getElementById('pwlen').value);
		const pwLenWithoutMask = pwLen - 1;
		const charset = document.getElementById('charset').value;
		if (charset.length == 0) {
			output.innerText = 'Charset is empty.';
			return;
		}
		if (charset.length > 95) {
			output.innerText = 'Too many characters. There are only 95 printable characters in the ASCII table.';
			return;
		}
		const chars = [];
		for (let i = 0; i < charset.length; i++) {
			const char = charset.charCodeAt(i);
			if (char > 128) {
				output.innerText = 'Only ASCII characters are allowed.';
				return;
			}
			chars[i] = char;
		}
		let combsCnt = 1;
		for (let i = 0; i < pwLen; i++) {
			combsCnt *= chars.length;
		}
		const MAX_UINT_LIMIT = 4294967296; // 32-bit dword
		// maxPointsPerDraw should be <= uintLimit and
		// uintLimit + maxPointsPerDraw <= MAX_UINT_LIMIT

		let maxPointsPerDraw = MAX_UINT_LIMIT / 2;
		const pwLenHiLo = [0, 0]; // less significant on the right

		let maxPwLenPer32Uint = 1;
		let uintLimit = chars.length;

		while (uintLimit * chars.length <= MAX_UINT_LIMIT - maxPointsPerDraw) {
			uintLimit *= chars.length;
			maxPwLenPer32Uint++;
		}
		if (pwLenHiLo.length * maxPwLenPer32Uint < pwLenWithoutMask) {
			output.innerText = `Password length should be less or equal than ${2 * maxPwLenPer32Uint + 1} with current charset`;
			return;
		}
		if (pwLenWithoutMask < maxPwLenPer32Uint) {
			pwLenHiLo[0] = pwLenWithoutMask;
			pwLenHiLo[1] = pwLenWithoutMask;
		} else {
			pwLenHiLo[0] = pwLenWithoutMask;
			pwLenHiLo[1] = maxPwLenPer32Uint;
		}
		uintLimit = Math.pow(chars.length, pwLenHiLo[1]);
		while (maxPointsPerDraw > uintLimit) {
			maxPointsPerDraw /= 2;
		}

		gl.useProgram(prog);

		// texture 1x1 with 4 values per pixel for storing results
		const texWidth = 1;
		const texHeight = 1;
		const result = new Uint32Array(texWidth * texHeight * 4);

		const tex = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex);

		gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32UI, texWidth, texHeight);
		gl.texSubImage2D(
			gl.TEXTURE_2D,
			0,	// mip level
			0,	// x offset
			0,	// y offset
			texWidth,
			texHeight,
			gl.RGBA_INTEGER,
			gl.UNSIGNED_INT,
			result
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		const fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, tex, 0);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			output.innerText = 'checkFramebufferStatus() is not 0. Check console log of your browser.';
			return;
		}
		gl.viewport(0,0, texWidth,texHeight);

		const searchedLoc = gl.getUniformLocation(prog, 'searched');
		const maxGidLoc = gl.getUniformLocation(prog, 'gid_max');
		const pwLenLoc = gl.getUniformLocation(prog, 'pw_len');
		const offsetLoc = gl.getUniformLocation(prog, 'offset');
		const charsLoc = gl.getUniformLocation(prog, 'chars');
		const charsCntLoc = gl.getUniformLocation(prog, 'chars_cnt');
		const uintLimitLoc = gl.getUniformLocation(prog, 'uint_limit');

		gl.uniform4uiv(searchedLoc, searched);
		gl.uniform2uiv(maxGidLoc, i2hilo(combsCnt / chars.length));
		gl.uniform2uiv(pwLenLoc, pwLenHiLo);
		gl.uniform1uiv(charsLoc, chars);
		gl.uniform1ui(charsCntLoc, chars.length);
		gl.uniform1ui(uintLimitLoc, uintLimit);

		isRunning = true;
		button.textContent = 'Stop';
		let offset = 0;
		let then = 0;
		let pointsPerDraw = 65536;
		const refreshRate = 200; // ms
		const t0 = performance.now();
		requestAnimationFrame(draw);


		function i2hilo(i) {
			let hi, lo;
			if (i < uintLimit) {
				hi = 0;
				lo = i;
			} else {
				hi = 1 + (i - uintLimit) / uintLimit;
				lo =     (i - uintLimit) % uintLimit;
			}
			return [hi, lo];
		}

		function hilo2i(hi, lo) {
			return hi * uintLimit + lo;
		}

		function ms2time(ms) {
			const seconds = Math.floor((ms / 1000) % 60);
			const minutes = Math.floor((ms / (1000 * 60)) % 60);
			const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
			const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 30);
			const months = Math.floor((ms / (1000 * 60 * 60 * 24 * 30)) % 12);
			const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 30 * 12));

			if (years) {
				return years + ' years ' + months + ' months';
			} else if (months) {
				return months + ' months ' + days + ' days';
			} else if (days) {
				return days + ' days ' + hours + ' hours';
			} else if (hours) {
				return hours + ' hours ' + minutes + ' minutes';
			} else if (minutes) {
				return minutes + ' minutes ' + seconds + ' seconds';
			} else {
				return seconds + ' seconds';
			}
		}

		function draw(now) {
			if (!isRunning) return;
			const dt = now - then;
			then = now;
			if (dt < refreshRate) {
				pointsPerDraw = Math.min(pointsPerDraw * 2, maxPointsPerDraw);
			}
			gl.uniform2uiv(offsetLoc, i2hilo(offset));
			gl.drawArrays(gl.POINTS, 0, pointsPerDraw);
			gl.readPixels(0, 0, texWidth, texHeight, gl.RGBA_INTEGER, gl.UNSIGNED_INT, result);
			const t1 = performance.now();
			offset += pointsPerDraw;
			let totalOffset = offset * chars.length;
			if (totalOffset >= combsCnt) totalOffset = combsCnt;
			const speed = Math.floor(totalOffset / (t1 - t0) * 1000);
			output.innerText =
				`Progress: ${totalOffset} hashes of ${combsCnt} ` +
				`(${(totalOffset / combsCnt * 100).toFixed(1)}%)` +
				`\r\nSpeed: ${speed} hash/s` +
				`\r\nEstimated time: ${ms2time((combsCnt - totalOffset) / speed * 1000)}`;
			const isDecoded = result[3];
			if (!isDecoded && totalOffset < combsCnt) {
				requestAnimationFrame(draw);
				return;
			}
			isRunning = false;
			button.textContent = 'Decode';
			let passwd;
			if (isDecoded) {
				const arr = [];
				arr[0] = chars[result[2]]; // first char
				let val = hilo2i(result[0], result[1]); // offset
				for (let i = 1; i < pwLen; i++) {
					let next = Math.floor(val / chars.length);
					let pos = Math.floor(val % chars.length);

					val = next;
					arr[i] = chars[pos];
				}
				passwd = String.fromCharCode.apply(null, arr);
			} else {
				passwd = 'not found';
			}
			output.innerText =
				`Progress: ${totalOffset} hashes of ${combsCnt} ` +
				`(${(totalOffset / combsCnt * 100).toFixed(1)}%)` +
				`\r\nSpeed: ${speed} hash/s` +
				`\r\nTotal time: ${ms2time(t1 - t0)}` +
				`\r\n\r\nPassword: ${passwd}`;
		}
	}

	function createProgram(gl, vs, fs) {
		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vs);
		const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fs);
		const prog = gl.createProgram();

		gl.attachShader(prog, vertexShader);
		gl.attachShader(prog, fragmentShader);
		gl.linkProgram(prog);
		const linked = gl.getProgramParameter(prog, gl.LINK_STATUS);
		if (!linked) {
			output.innerText = `linkProgram: ${gl.getProgramInfoLog(prog)}` +
			`\r\nvs info: ${gl.getShaderInfoLog(vertexShader)}` +
			`\r\nfs info: ${gl.getShaderInfoLog(fragmentShader)}`;

			gl.deleteProgram(prog);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			return;
		}
		return prog;


		function compileShader(gl, type, src) {
			const shader = gl.createShader(type);
			gl.shaderSource(shader, src);
			gl.compileShader(shader);

			return shader;
		}
	}
}
