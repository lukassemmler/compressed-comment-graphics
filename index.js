var PNG = require('png-js');

const Brightness = Object.freeze({
  Light: 1,
  Dark: 0,
});

function getRepeaterChunkByte(stack) {
  
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
