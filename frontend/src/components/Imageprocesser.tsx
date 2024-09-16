import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { ImageContext } from '../context/ImageContext';
import { FaUpload } from "react-icons/fa6";
import { FaFileDownload } from "react-icons/fa";

const Imageprocesser: React.FC = () => {
  // Slider states for brightness, contrast, and saturation
  const [brightness, setBrightness] = useState<number>(100); // Default 100%
  const [saturation, setSaturation] = useState<number>(100); // Default 100%
  const [r, setR] = useState<number>(255); // Default 0%
  const [g, setG] = useState<number>(255); // Default 0%
  const [b, setB] = useState<number>(255); // Default 0%
  const { previewUrl, finalImageUrl, setPreviewUrl, setFinalImageUrl } = useContext(ImageContext);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png'); // Default to 'png'
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null); // it store the file name
  const [uploadProgress, setUploadProgress] = useState<number>(0); // it will track the upload process
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false); // it will give uploacd success

  
  const [activateRGC, setactivateRGC] = useState<boolean>(false);
   // Toggle buttons state
   const [isGrayScale, setGrayScale] = useState<boolean>(false);
   const [isInvert, setInvert] = useState<boolean>(false);
   const [isBlur, setBlur] = useState<boolean>(false);
   const [rotateangles, setrotateangles] = useState<number>(0);
   const [ycoordinate, setycoordinate] = useState<number>(0);
   const [xcordinate, setxcordinate] = useState<number>(0);
   const [widthval, setwidthval] = useState<number>(2000);
   const [heightval, setheightval] = useState<number>(2000);
   const [Hue, setHue] = useState<number>(0);
   

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name); // Set the selected file's name
      setUploadProgress(0); // Reset progress bar when a new file is selected
      setUploadSuccess(false); // Reset upload success state
    }
  };

  // Simulate slow progress bar animation
  const simulateSlowProgress = (callback: () => Promise<void>) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setUploadProgress(progress);
      } else {
        clearInterval(timer);
        callback();
      }
    }, 300); // Increment every 300ms to slow down the animation
  };

  // Handle file upload and image processing
  const processed = async () => {
    if (!file) return;
    // console.log("grayScale:"+isGrayScale);
    // console.log("invert:"+isInvert);
    // console.log("Blur:"+isBlur);
    console.log("brightnesss:"+brightness);
    console.log("saturations:"+saturation);
    console.log("R:"+r);
    console.log("G:"+g);
    console.log("activateRGC:"+activateRGC);
    console.log("rotateangle:"+rotateangles);
    console.log("top:"+ycoordinate);
    console.log("width:"+widthval);
    console.log("left:"+xcordinate);
    console.log("height:"+heightval);

    
    console.log("---------------------")
    // console.log("---------------------")
    const formData = new FormData();// it will send the data to backend as key value player
    formData.append('image', file);
    formData.append('brightnesss', brightness.toString());
    formData.append('red', r.toString());
    formData.append('green', g.toString());
    formData.append('blue', b.toString());
    formData.append('saturations', saturation.toString());
    formData.append('grayScale', isGrayScale.toString());
    formData.append('activateRGCs', activateRGC.toString());
   formData.append('invert', isInvert.toString());
    formData.append('blur', isBlur.toString());
    formData.append('rotateangle', rotateangles.toString());
    formData.append('top1', ycoordinate.toString());
     formData.append('width1', widthval.toString());                
    formData.append('left1', xcordinate.toString());
    formData.append('height1', heightval.toString());
    formData.append('hue', Hue.toString());
    // Simulate slow progress first, then do the actual upload
    simulateSlowProgress(async () => {
      try {
        // Step 1: Get real-time preview (lower quality)
        const previewResponse = await axios.post('http://localhost:3001/preview', formData, {
          responseType: 'blob', // Expect a Blob for the image preview
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress); // Update the progress bar with actual progress from the server
          },
        });

        const previewUrl = URL.createObjectURL(previewResponse.data); // Create a local URL for the Blob
        setPreviewUrl(previewUrl);

        // Step 2: Get the final processed image
        const processResponse = await axios.post('http://localhost:3001/upload', formData);
        setFinalImageUrl(processResponse.data.imageUrl);

        setUploadProgress(100); // Ensure progress reaches 100%
        setUploadSuccess(true); // Set upload success to true after completion
      } catch (error) {
        console.error('Error uploading or processing the image:', error);
      }
    });
  };
  

  useEffect(() => {
    // Call processed when the file changes or when any of the toggle buttons are updated
    if (file) {
      processed();
    }
  }, [file, isGrayScale, isInvert,isBlur,brightness,saturation,r,g,b,activateRGC,rotateangles,ycoordinate,xcordinate,widthval,heightval,Hue]); // Dependencies that trigger the effect


  // Function to download the image in the selected format
  const getimage = async () => {
    if (!finalImageUrl) return;

    try {
      const response = await axios.get(`http://localhost:3001/download?format=${downloadFormat}&imageUrl=${encodeURIComponent(finalImageUrl)}`, {
        responseType: 'blob',
      });

      // Create a URL for the downloaded image and trigger a download
      const blob = new Blob([response.data], { type: `image/${downloadFormat}` });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `image.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message after the image is downloaded
      setDownloadMessage(`Image successfully downloaded as ${downloadFormat.toUpperCase()}`);

      // Hide the message after 3 seconds
      setTimeout(() => setDownloadMessage(null), 3000);

    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-100 text-black">
      {/* Branding */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-400">FilterPixel Hiring Challenge</h1>
        <p className="text-lg text-gray-300">Image Processing Web Server with Real-Time Preview</p>
      </div>

      <div className="bg-green-900 rounded-lg p-8 shadow-lg w-96 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4 text-center text-white max-w-full">Upload Your Image</h1>

        {/* Choose file button with icon */}
        <label className="flex items-center cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 justify-center">
        <FaUpload />
          Choose File
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Display the selected file name */}
        {fileName && (
          <div className="text-sm text-white mb-4">
            <span className="font-bold">Selected file:</span> {fileName}
          </div>
        )}

        {/* Progress Bar */}
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full mb-4">
            <div
              className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={processed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 flex items-center justify-center"
        >
         <FaUpload />
          Upload Image
        </button>

        {/* Success message */}
        {uploadSuccess && (
          <div className="text-center text-green-400 font-bold mb-4 flex items-center justify-center">
            <FaUpload />
            Image successfully uploaded!
          </div>
        )}
        {/* Success message */}
        {!uploadSuccess && (
          <div className="text-center text-red-400 font-bold mb-4 flex items-center justify-center">
           <FaUpload />
            Image not uploaded!
          </div>
        )}
          {/* Sliders for brightness, contrast, and saturation */}
        <div className="w-full">
          <div className=" text-white">contrast: it is mixture of Brightness+saturation+hue </div>
          <label className="text-white text-sm">Brightness: {brightness}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            
            className="w-full mb-4"
          />
           <label className="text-sm text-white">saturation: {saturation}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full mb-4"
          />
          <label className="text-sm text-white">Hue: {Hue}%</label>
          <input
            type="range"
            min="0"
            max="200"
            value={Hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full mb-4"
          />
          <div>
          <button
            onClick={() => {
              setactivateRGC(prev => !prev)
            }}
            className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg ${
              !activateRGC ? '' : 'ring-2 ring-green-500'
            }`}
          >
            activateRGC
          </button>
          </div>
          <label className="text-sm text-white">r: {r}</label>
          <input
            type="range"
            min="0"
            max="255"
            value={r}
            onChange={(e) => setR(Number(e.target.value))}
            className="w-full mb-4 text-white"
          />
          <label className="text-sm text-white">g: {g}</label>
          <input
            type="range"
            min="0"
            max="255"
            value={g}
            onChange={(e) => setG(Number(e.target.value))}
            className="w-full mb-4"
          />
          <label className="text-sm text-white">b: {b}</label>
          <input
            type="range"
            min="0"
            max="255"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className="w-full mb-4"
          />
          <label className="text-sm text-white">rotateangles: {rotateangles}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotateangles}
            onChange={(e) => setrotateangles(Number(e.target.value))}
            className="w-full mb-4"
          />
          <div>croping:</div>
          <label className="text-sm text-white">y-coordinate by defult its is 0: {ycoordinate}px</label>
          <input
            type="range"
            min="0"
            max="2000"
            value={ycoordinate}
            onChange={(e) => setycoordinate(Number(e.target.value))}
            className="w-full mb-4"
          />
          <label className="text-sm text-white">x-cordinate by defult its is 0: {xcordinate}px</label>
          <input
            type="range"
            min="0"
            max="2000"
            value={xcordinate}
            onChange={(e) => setxcordinate(Number(e.target.value))}
            className="w-full mb-4"
          />
           <label className="text-sm text-white">width | maxwith is imageWidth - 1: {widthval}px</label>
          <input
            type="range"
            min="1"
            max="2000"
            value={widthval}
            onChange={(e) => setwidthval(Number(e.target.value))}
            className="w-full mb-4"
          />
           <label className="text-sm text-white">height | maxwith is  imageheight - 1: {heightval}px</label>
          <input
            type="range"
            min="1"
            max="2000"
            value={heightval}
            onChange={(e) => setheightval(Number(e.target.value))}
            className="w-full mb-4"
          />
           
        </div>
        {/* Toggle buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            onClick={() => {
              //setGrayScale(!isGrayScale);
              setGrayScale(prev => !prev)
            }}
            className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg ${
              !isGrayScale ? '' : 'ring-2 ring-green-500'
            }`}
          >
            Grayscale
          </button>
          <button
            onClick={() => {
              //setInvert(!isInvert);
              setInvert(prev => !prev)
             
            }}
            className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg ${
              isInvert ? 'ring-2 ring-green-500' : ''
            }`}
          >
            Invert
          </button>
          <button
            onClick={() => {
              setBlur(prev => !prev)
            }}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${
              isBlur ? 'ring-2 ring-green-500' : ''
            }`}
          >
            Blur
          </button>
        </div>
        {/* Preview the image */}
        {previewUrl && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Image Preview:</h3>
            <img src={previewUrl} alt="Image Preview" className="w-full rounded-lg mt-2" />
          </div>
        )}

        {finalImageUrl && (
          <div>
            <h3 className="text-lg font-semibold text-white">Select Download Format:</h3>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpeg')}
              className="w-full bg-white text-black p-2 rounded-lg mb-4"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
            <button
              onClick={getimage}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <FaFileDownload />
              Download Image
            </button>
          </div>
        )}

        {downloadMessage && (
          <div className="mt-4 text-center text-green-400 font-bold">
            {downloadMessage}
          </div>
          
        )}
      </div>

      <div className='text-center'>
        <p className='text-gray-600 mt-10 '>Want to Contribute? Here's the code link: <span className='hover:cursor-pointer hover:text-white transition-all hover:text-pretty'>github.com/proimage</span></p>
        <p className='text-gray-600 mt-5'>Designed & Developed by Subhadeep Chell ❤️</p>
      </div>
    </div>
  );
};

export default Imageprocesser;
