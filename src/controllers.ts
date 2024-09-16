import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';







// Process the uploaded image
export const processImage = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file?.path;
    // Get the transformation options from the request body
    const { grayScale, invert, blur, brightnesss, saturations,red,green,blue,activateRGCs,rotateangle,top1,width1,height1,left1,hue} = req.body;
    if (!imagePath) return res.status(400).send('No image uploaded.');
     // Initialize Sharp instance
    let sharpInstance = sharp(imagePath);
     // Get image metadata (dimensions)
     const imageMetadata = await sharpInstance.metadata();
     const imageWidth = imageMetadata.width || 1000;  // default to 1000px if unknown
     const imageHeight = imageMetadata.height || 1000;  // default to 1000px if unknown
 
     // Parse and constrain the cropping parameters to ensure they're valid
     const left = Math.max(0, Math.min(parseFloat(left1), imageWidth - 1));  // Ensure left is within 0 to imageWidth-1
     const top = Math.max(0, Math.min(parseFloat(top1), imageHeight - 1));  // Ensure top is within 0 to imageHeight-1
     const width = Math.max(1, Math.min(parseFloat(width1), imageWidth - left));  // Width must fit within the remaining image width
     const height = Math.max(1, Math.min(parseFloat(height1), imageHeight - top));  // Height must fit within the remaining image height
 
     console.log(`Cropping Parameters -> Left: ${left}, Top: ${top}, Width: ${width}, Height: ${height}`);
     console.log("---------------------")
    if (grayScale === 'true') sharpInstance = sharpInstance.grayscale();
    if (invert === 'true') sharpInstance = sharpInstance.flip();
    if (blur === 'true') sharpInstance = sharpInstance.blur(5);
    if (brightnesss) sharpInstance = sharpInstance.modulate({ brightness: parseFloat(brightnesss) / 100 });
    if (saturations) sharpInstance = sharpInstance.modulate({ saturation: parseFloat(saturations) / 100 });
    if (saturations) sharpInstance = sharpInstance.modulate({ saturation: parseFloat(saturations) / 100 });
    if (hue>=-360 && hue<=360) sharpInstance = sharpInstance.modulate({ hue: parseFloat(hue)});
    if(activateRGCs=== 'true')sharpInstance = sharpInstance.tint({ r: red, g: green, b: blue }); //  effect using tint
    sharpInstance = sharpInstance.rotate(parseFloat(rotateangle));
    sharpInstance = sharpInstance.extract({left: left, top: top, width: width, height: height });
    
    // Process the image using Sharp
    const processedImagePath = `uploads/processed-${req.file?.filename}.png`;
    await sharpInstance
      .toFormat('png') // Convert image to PNG
      .toFile(processedImagePath);
      
    res.json({ message: 'Image processed successfully', imageUrl: processedImagePath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process image' });
  }
};


// Generate a preview of the uploaded image
export const getPreview = async (req: Request, res: Response) => {
  try {
    const imagePath = req.file?.path;
    if (!imagePath) return res.status(400).send('No image uploaded.');
    const { grayScale, invert, blur, brightnesss, saturations,red,green,blue,activateRGCs,rotateangle,top1,width1,height1,left1,hue} = req.body;
    let sharpInstance = sharp(imagePath);
    // Create a preview of the image using Sharp
    // console.log("grayScale:"+grayScale);
    // console.log("invert:"+invert);
    // console.log("blur:"+blur);
    // console.log("---------------------")
     console.log("brightnesss:"+parseFloat(brightnesss));
     console.log("R:"+red);
     console.log("G:"+green);
     console.log("B:"+blue);
     console.log("activateRGCs:"+activateRGCs);
     console.log("rotateangle:"+rotateangle);
     // Get image metadata (dimensions)
     const imageMetadata = await sharpInstance.metadata();
     const imageWidth = imageMetadata.width || 1000;  // default to 1000px if unknown
     const imageHeight = imageMetadata.height || 1000;  // default to 1000px if unknown
 
     // Parse and constrain the cropping parameters to ensure they're valid
     const left = Math.max(0, Math.min(parseFloat(left1), imageWidth - 1));  // Ensure left is within 0 to imageWidth-1
     const top = Math.max(0, Math.min(parseFloat(top1), imageHeight - 1));  // Ensure top is within 0 to imageHeight-1
     const width = Math.max(1, Math.min(parseFloat(width1), imageWidth - left));  // Width must fit within the remaining image width
     const height = Math.max(1, Math.min(parseFloat(height1), imageHeight - top));  // Height must fit within the remaining image height
 
     console.log(`Cropping Parameters -> Left: ${left}, Top: ${top}, Width: ${width}, Height: ${height}`);
     console.log("---------------------")
    if (grayScale === 'true') sharpInstance = sharpInstance.grayscale();
    if (invert === 'true') sharpInstance = sharpInstance.flip();
    if (blur === 'true') sharpInstance = sharpInstance.blur(5);
    if (brightnesss) sharpInstance = sharpInstance.modulate({ brightness: parseFloat(brightnesss) / 100 });
    if (saturations) sharpInstance = sharpInstance.modulate({ saturation: parseFloat(saturations) / 100 });
    if (saturations) sharpInstance = sharpInstance.modulate({ saturation: parseFloat(saturations) / 100 });
    if (hue>=-360 && hue<=360) sharpInstance = sharpInstance.modulate({ hue: parseFloat(hue)});
    if(activateRGCs=== 'true')sharpInstance = sharpInstance.tint({ r: red, g: green, b: blue }); //  effect using tint
    sharpInstance = sharpInstance.rotate(parseFloat(rotateangle));
    sharpInstance = sharpInstance.extract({left: left, top: top, width: width, height: height });
    const previewBuffer = await sharpInstance
      .toFormat('jpeg') // JPEG format for preview
      .jpeg({ quality: 50 }) // Lower quality for faster preview
      .toBuffer();
    // Send the preview image back
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(previewBuffer, 'binary');
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
};
// funtion that match the is the in among one of them
const allvalidformat = (format: any): format is keyof sharp.FormatEnum => {
  return ['png', 'jpeg', 'jpg'].includes(format);
};

// Handle image download with format conversion
export const downloadImage = async (req: Request, res: Response) => {
  const { format, imageUrl } = req.query;

  try {
    // Decode the image URL and get the full path
    const decodedImageUrl = decodeURIComponent(imageUrl as string);
    const imagePath = path.resolve(__dirname, `../${decodedImageUrl}`);

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send({ error: 'File not found' });
    }

    // Validate the format, default to 'png'
    const validFormat = allvalidformat(format) ? format : 'png';

    // Convert and send the image
    const imageBuffer = await sharp(imagePath)
      .toFormat(validFormat) // Convert to valid format
      .toBuffer();

    res.set('Content-Disposition', `attachment; filename="image.${validFormat}"`);
    res.set('Content-Type', `image/${validFormat}`);
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send({ error: 'Failed to download the image' });
  }
};
