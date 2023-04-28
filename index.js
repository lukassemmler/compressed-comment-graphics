var PNG = require('png-js');

const Brightness = Object.freeze({
  Light: 1,
  Dark: 0,
});

PNG.decode('media/nintendo-land.png', function(pixels) {
  const pixelsArray = new Uint8Array(pixels);
  let brightnessChanges = 0;
  let currentBrightness = -1;
  let currentLength = -1;
  for (let i = 0; i < pixelsArray.length; i +=4 ) {
    const pixel = pixelsArray.slice(i, i + 4);
    const [ r, g, b, a ] = pixel;
    const brightness = Math.round((r + g + b) / 3);
    const type = brightness > 127 ? Brightness.Light : Brightness.Dark;
    if (type === currentBrightness) {
      currentLength++;
    } else {
      currentBrightness = type;
      currentLength = 1;
      brightnessChanges++;
    }
  }
  console.log(brightnessChanges);
  //const brightness = 
  // pixels is a 1d array (in rgba order) of decoded pixel data
});
