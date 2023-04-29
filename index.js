var PNG = require('png-js');

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

function getRawChunkByte(stack) {

}

PNG.decode('media/nintendo-land.png', function(pixels) {
  const pixelsArray = new Uint8Array(pixels);
  //let brightnessChanges = 0;
  let lastFlushIndex = -1;
  let currentBrightness = -1;
  let currentStreak = -1;
  for (let i = 0; i < pixelsArray.length; i +=4 ) {
    const pixel = pixelsArray.slice(i, i + 4);
    const [ r, g, b, a ] = pixel;
    const brightness = Math.round((r + g + b) / 3);
    const type = brightness > 127 ? Brightness.Light : Brightness.Dark;
    if (type === currentBrightness) {
      currentStreak++;
      // Case 3: Streak with more than 64 bits
      //   gets broken up and written as a repeater chunk
      getRepeaterChunkByte(stack);
    } else {
      currentBrightness = type;
      currentStreak = 1;
      //brightnessChanges++;
      // Case 2: Streak with at least 8 bits
      //   gets written as a repeater chunk
      getRepeaterChunkByte(stack);
    }
    if (stack.length < 7) continue;
    if (stack.length === currentStreak) continue;
    // Case 1: Random sequence of 7 bits 
    //   get written as a raw chunk
    //const rawBits = 
    getRawChunkByte(stack);
  }
  console.log(brightnessChanges);
  //const brightness = 
  // pixels is a 1d array (in rgba order) of decoded pixel data
});
