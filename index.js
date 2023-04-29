// https://stackoverflow.com/questions/11247790/reading-a-png-image-in-node-js

const Buffer = require('node:buffer').Buffer;
var PNG = require('pngjs').PNG;
const fs = require("fs");

const Brightness = Object.freeze({
  Light: 1,
  Dark: 0,
});

function getRepeaterChunkByte(bit, length) {
  // Returns 1 + bit + uint6 (8 bits or 1 byte)
  //   ATTENTION! We don't care about repeaters with a length of 0, so we always add 1.
  //   So a repeater has a length between 1 - 64 (2^6) -- and NOT 0 - 63 (2^6 - 1).
  if (length < 1 || length > 64)
    throw new Error(`Illegal repeater chunk byte length of '${length}'. Must be between 1 and 64 (including 1 and 64).`);
  let byte = 1;
  byte <<= 1;
  byte |= bit;
  byte <<= 6
  byte |= length - 1;
  return byte;
}

function getRawChunkByte(bits) {
  // Returns 0 + sequence of 7 bits (8 bits or 1 byte)
  // TODO: Change bits array to a 7-bit number to be more memory efficient?
  const bitLength = bits.length;
  if (bitLength < 1 || bitLength > 7)
    throw new Error(`Illegal raw chunk byte length of '${bitLength}' bits. Must be between 1 and 7 bits (including 1 and 7).`);
  let byte = 0;
  for (let i = 0; i < 7; i++) {
    byte <<= 1
    byte |= bits[i];
  }
  return byte;
}

function readPngImageAsBits(filePath) {
  const data = fs.readFileSync(filePath);
  const image = PNG.sync.read(data);
  const { height, width } = image;
  const size = width * height;
  const bits = new Uint8Array(size);
  const pixelsArray = new Uint8Array(image.data);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = width * y + x;
      const j = i * 4;
      const pixel = pixelsArray.slice(j, j + 4);
      const [r, g, b, a] = pixel;
      const brightness = Math.round((r + g + b) / 3);
      const type = brightness > 127 ? Brightness.Light : Brightness.Dark;
      bits[i] = type;
    }
  return bits;
}

function compressBitSequence(bits) {
  const bytes = [];
  let memory = -1;    // Resets each time a byte is generated.
  let streak = 0;     // Resets each time a byte is generated.
  let lastFlush = -1; // Remembers the index of the last flush (end of byte?)

  const flush = (index, byteGenerator, ...args) => {
    bytes.push(byteGenerator(...args));
    memory = -1;
    streak = 0;
    lastFlush = index;
  };

  // TODO Optimization: The repeater chunk could store 8 - 71 length, 
  //   because a length of 1-7 is more efficiently displayed in a raw chunk.

  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i];

    if (streak > 7 && bit !== memory) {
      flush(i, getRepeaterChunkByte, memory, streak);
      continue;
    }

    streak = bit === memory ? streak + 1 : 1;
    const isLastBit = i === bits.length - 1;

    if (isLastBit && streak > 7) {
      flush(i, getRepeaterChunkByte, memory, streak);
      continue;
    }

    if (isLastBit) {
      flush(i, getRawChunkByte, bits.slice(lastFlush + 1));
      continue;
    }

    if (streak === 64) {
      flush(i, getRepeaterChunkByte, memory, streak);
      continue;
    }

    const currentDistance = i - lastFlush + 1;

    if (currentDistance === 7) {
      const rawBits = bits.slice(lastFlush + 1, i);
      flush(i, getRawChunkByte, rawBits);
      continue;
    }
    
    memory = bit;
  }

  return Uint8Array.from(bytes);
}

function getBinaryString(number, minDigits = 0) {
  // Gets binary string and groups 4 bits together
  const binary = (number >>> 0).toString(2);
  const digits = Math.ceil(binary.length / 4) * 4;
  const paddedBinary = binary.padStart(Math.max(digits, minDigits), 0);
  const words = [];
  for (let i = 0; i < paddedBinary.length; i += 4) {
    const index = paddedBinary.length - i;
    words.unshift(paddedBinary.slice(index - 4, index));
  }
  return words.join(" ");
}

function encodeAsCcg(filePath) {
  const bits = readPngImageAsBits(filePath);
  const compressedData = compressBitSequence(bits);
  console.log([...compressedData].map(byte => getBinaryString(byte, 8)));
  //printBits(bits, 32);
  //console.log(bits.length);
  //console.log(bits.length);
}

function printBits(bits, width) {
  /*
  const rows = Math.ceil(bits.length / width);
  for (let y = 0; y < rows; y++) {
    const buffer = Buffer.alloc(width, "-");

  }
  */
  const string = [...bits].join("");
  const regex = new RegExp(`(.{${width}})`, "gm");
  const formattedString = string.replace(regex, "$1\n");
  console.log(formattedString);
}

encodeAsCcg("media/letter-n.png");

/*
fs.createReadStream('media/test-palette.png')
  .pipe(new PNG())
  .on('parsed', function() {

    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            // invert color
            const r = 255 - this.data[idx]; // R
            const g = 255 - this.data[idx+1]; // G
            const b = 255 - this.data[idx+2]; // B

            // and reduce opacity
            const a = this.data[idx+3] >> 1;

        console.log(`Pixel at (${x},${y}): rgba(${r},${g},${b},${a})`);

        }
    }
});
*/

/*
fs.createReadStream('media/test-palette.png')
  .pipe(new PNG())
  .on('parsed', function () {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        // get pixel data for (x,y)
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const a = this.data[idx + 3];
        console.log(`Pixel at (${x},${y}): rgba(${r},${g},${b},${a})`);
      }
    }
  });
*/