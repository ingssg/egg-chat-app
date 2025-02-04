"use client";

import React from "react";
import { StreamManager } from "openvidu-browser";
import { useEffect } from "react";
import { isChosenState } from "@/app/store/socket";
import { useRecoilState } from "recoil";
import "../../styles/App.css";
import { chooseState, meetingSocketState } from "@/app/store/socket";
import { useRecoilValue } from "recoil";

type Props = {
  streamManager: StreamManager;
};

const OpenViduVideoComponent = (props: Props) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLDivElement>(null);
  const [isChosen, setIsChosen] = useRecoilState<boolean>(isChosenState);
  const socket = useRecoilValue(meetingSocketState);
  const choiceState = useRecoilValue(chooseState);

  useEffect(() => {
    if (props.streamManager && videoRef.current) {
      props.streamManager.addVideoElement(videoRef.current);
    }
  }, [videoRef, props.streamManager]);

  const handleChoose = () => {
    if (isChosen) {
      alert("선택은 한 번만 할 수 있어요!");
      return;
    }
    const myName = document.querySelector(".pub")?.querySelector(".nickname");
    console.log(myName?.textContent);
    const currentNickname = containerRef.current
      ?.closest(".streamcomponent")
      ?.querySelector(".nickname");
    console.log(currentNickname?.textContent);
    // const currStreamContainer = containerRef.current?.closest(".stream-container");
    const emitChoose = (eventName: string) => {
      socket?.emit(eventName, {
        sender: myName?.textContent,
        receiver: currentNickname?.textContent,
      });
    };

    containerRef.current!.classList.add("chosen-stream");
    videoRef.current!.classList.add("opacity");
    if (choiceState === "first") {
      emitChoose("choose");
    } else {
      emitChoose("lastChoose");
    }

    containerRef.current!.classList.add("chosen-stream");
    videoRef.current!.classList.add("opacity");

    console.log(myName?.textContent, currentNickname?.textContent);
    setIsChosen(true);
  };

  return (
    <>
      <div className="cam-wrapper" ref={containerRef}>
        <video autoPlay={true} ref={videoRef}></video>
        <div
          className="choose-btn hidden"
          onClick={handleChoose}
          ref={btnRef}
        ></div>
      </div>
    </>
  );
};

export default React.memo(OpenViduVideoComponent);
