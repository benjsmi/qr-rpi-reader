var RaspiCam = require("raspicam");
var RpiLeds = require('rpi-leds');
var leds = new RpiLeds();

var fs = require("fs")
var jsqr = require('jsqr')
var Canvas = require('canvas')
var canvas = new Canvas(1000,1000)
var context = canvas.getContext('2d')
var Image = Canvas.Image

var camera = null;
leds.status.reset();
leds.status.blink();
console.log("Setting up the camera...")
camera = new RaspiCam({
	mode: "photo",
	output: __dirname + '/pics/cam.jpg',
	rot: 0
});

camera.on("start", function(){
    console.log("Started taking picture...")
});

camera.start()

/**
 * Delete whatever local copy may exist.
 */
function deleteLocalPicture() {
	fs.unlink(__dirname + '/pics/cam.jpg', function (err) {
	  if (err)
	  {
		console.log('Error while trying to delete: ' + err)  
	  }
	  else 
	  {
	  	console.log('Successfully deleted previous picture.');
	  }
	});
}

/**
 * Camera finished taking a picture. Upload and delete local copy.
 */
camera.on("exit", function(){
   console.log("Done taking picture... Reading for QRs...")

  fs.readFile(__dirname + '/pics/cam.jpg', function(err, qr) {
    if (err) throw err;
    var img = new Image;
    img.src = qr
    context.drawImage(img, 0, 0, img.width, img.height)
    var imageData = context.getImageData(0,0,1000,1000)
    console.log("Decoding QR code...")
    var decode = jsqr.decodeQRFromImage(imageData.data, imageData.width, imageData.height)
    if (decode)
    {
      leds.status.heartbeat();
      console.log(decode)
      deleteLocalPicture()
      camera.start()
    }
    else
    {
      console.log("No QR code was found!")
      deleteLocalPicture()
      camera.start()
    }
  })
});
