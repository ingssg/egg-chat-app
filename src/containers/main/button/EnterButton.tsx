"use client";

import React, { useState, useRef, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useRecoilState, useRecoilValue } from "recoil";
import { meetingSocketState } from "@/app/store/socket";
// import { testState } from "@/app/store/userInfo"; // FIXME 테스트용 랜덤 닉네임 저장, 배포 전에 삭제해야함
import { userState } from "@/app/store/userInfo";
import { defaultSessionState } from "@/app/store/ovInfo";

const EnterButton = () => {
  const router = useRouter();
  const [meetingSocket, setMeetingSocket] = useRecoilState(meetingSocketState);
  //   const [, setTestName] = useRecoilState(testState); // FIXME 테스트용 랜덤 닉네임 저장, 배포 전에 삭제해야함
  const currentUser = useRecoilValue(userState);
  const [, setDefaultUserInfo] = useRecoilState(defaultSessionState);
  const enterBtnRef = useRef<HTMLParagraphElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnterLoading, setIsEnterLoading] = useState<boolean>(false);

  const connectSocket = async () => {
    return new Promise(resolve => {
      const newMeetingSocket = io(
        `${process.env.NEXT_PUBLIC_API_SERVER}/meeting`,
        {
          transports: ["websocket"],
          auth: { token: JSON.parse(localStorage.getItem("token")!) },
        },
      );
      newMeetingSocket.on("connect", () => {
        setMeetingSocket(newMeetingSocket);
        resolve(newMeetingSocket);
      });
    });
  };

  type ovInfo = {
    sessionId: string;
    token: string;
    participantName: string;
  };

  const handleLoadingOn = async () => {
    alert("업데이트 예정");
    let newMeetingSocket = meetingSocket;
    if (!newMeetingSocket) {
      newMeetingSocket = (await connectSocket()) as Socket | null;
    }
    console.log("지금 ready 호출 하기 직전! 쌈@뽕");
    newMeetingSocket?.emit("ready", {
      participantName: currentUser.nickname,
      gender: currentUser.gender,
    });
    console.log("지금 ready 호출! 쌈@뽕");
    setIsLoading(true);

    newMeetingSocket?.on("startCall", async (ovInfo: ovInfo) => {
      //   setTestName(ovInfo.participantName);
      setDefaultUserInfo({
        sessionId: ovInfo.sessionId,
        token: ovInfo.token,
        participantName: ovInfo.participantName,
      });
      setIsLoading(false);
      setIsEnterLoading(true);
      router.push(`/meeting/${ovInfo.sessionId}`);
      setTimeout(() => {
        setIsEnterLoading(false);
      }, 2000);
    });
  };

  const handleLoadingCancel = () => {
    meetingSocket?.emit("cancel", {
      participantName: currentUser.nickname,
      gender: currentUser.gender,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (isEnterLoading && enterBtnRef.current) {
      enterBtnRef.current.innerText = "입장 중입니다.";
    }
  }, [isEnterLoading]);

  return (
    <div className="w-full mt-4 relative">
      <button
        className="w-full h-12 bg-amber-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-1 z-10 relative custom-shadow"
        onClick={handleLoadingOn}
        disabled={isLoading || isEnterLoading}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 mr-3 text-white inline-block"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.42.936 4.635 2.464 6.291l1.536-1.536z"
            ></path>
          </svg>
        ) : (
          <p className="w-full text-2xl font-bold" ref={enterBtnRef}>
            입장하기
          </p>
        )}
      </button>
      {isLoading && (
        <div className="absolute border-b-2 right-0 mt-2 border-black text-sm text-gray-900">
          <button onClick={handleLoadingCancel}>매칭 취소</button>
        </div>
      )}
    </div>
  );
};

export default EnterButton;
