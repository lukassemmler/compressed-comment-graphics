var PNG = require('png-js');
PNG.decode('media/nintendo-land.png', function(pixels) {
  const pixelsArray = new Uint8Array(pixels);
  for (let i = 0; i < pixelsArray.length; i +=4 ) {
    const pixel = pixelsArray.slice(i, i + 4);
    const [ r, g, b, a ] = pixel;
    const brightness = Math.round((r + g + b) / 3);
    const type = brightness > 127 ? "light" : "dark";
    console.log(type);
    break;
  }
  //const brightness = 
  // pixels is a 1d array (in rgba order) of decoded pixel data
});
