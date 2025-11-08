import React, { useState, useRef, useEffect } from "react";

const WebcamDisplay = () => {
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const loadingVideoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleCam = () => {
    videoRef.current?.classList.toggle("hidden");
    isVideoOn ? setIsVideoOn(false) : setIsVideoOn(true);
  };

  const startWebCam = async () => {
    try {
      const constraints = {
        video: true,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current!;
      if (video && video instanceof HTMLVideoElement) {
        video.srcObject = stream;
      }
      setIsVideoLoading(false);
    } catch (error) {
      console.error("Error accessing the webcam: ", error);
    }
  };

  useEffect(() => {
    startWebCam();

    return setIsVideoLoading(true);
  }, []);

  // useEffect(() => {
  //   if (!isVideoLoading) {
  //     loadingVideoRef.current?.classList.add("bg-[url('/img/camoff.png')]");
  //   }
  // }, [isVideoLoading]);

  return (
    <>
      <div
        className="w-[320px] h-[240px] rounded-xl bg-contain bg-no-repeat bg-center border-4 border-[#FAE4C9] custom-shadow md:w-[400px] md:h-[300px] relative"
        ref={loadingVideoRef}
      >
        {isVideoLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="loader"></div>
          </div>
        )}
        <video
          id="myCam"
          className="mx-auto rounded-xl -scale-x-100"
          autoPlay
          playsInline
          ref={videoRef}
        ></video>
      </div>
      {/* <div className="m-4">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            role="switch"
            type="checkbox"
            className="cam-input custom-shadow"
            onClick={toggleCam}
            defaultChecked={isVideoOn}
          />
        </label>
      </div> */}
    </>
  );
};

export default WebcamDisplay;
