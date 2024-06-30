"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UserVideoComponent from "@/containers/meeting/UserVideoComponent";
import {
  OpenVidu,
  Session,
  Publisher,
  StreamManager,
  Device,
  Subscriber,
} from "openvidu-browser";

// import io from "socket.io-client";

type Props = {
  sessionId: string;
  token: string;
  participantName: string;
};

const Meeting = (props: Props) => {
  const [myUserName, setMyUserName] = useState<string>(
    "Participant" + Math.floor(Math.random() * 100),
  );
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [mainStreamManager, setMainStreamManager] = useState<any>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<Device | null>(
    null,
  );
  const [isAvatar, setIsAvatar] = useState<boolean>(true);
  const [isLoveMode, setIsLoveMode] = useState<boolean>(false);
  const [isMatched, setIsMatched] = useState<boolean>(true);
  const [isChooseMode, setIsChooseMode] = useState<boolean>(false);
  const [isOneToOneMode, setIsOneToOneMode] = useState<boolean>(false);

  // const socket = io("http://localhost:5002/meeting", {
  //   transports: ["websocket"],
  // });

  // const socket = JSON.parse(sessionStorage.getItem('session')!)

  // 어떻게든 종료 하면 세션에서 나가게함.
  useEffect(() => {
    console.log("메인이 실행되었습니다.");
    const handleBeforeUnload = () => leaveSession();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      console.log("메인이 종료되었습니다.");
    };
  });

  // 메인 비디오 스트림을 변경
  // const handleMainVideoStream = (stream: StreamManager) => {
  //   if (mainStreamManager !== stream) {
  //     setMainStreamManager(stream);
  //   }
  // };

  const deleteSubscriber = (streamManager: StreamManager) => {
    setSubscribers(prevSubscribers =>
      prevSubscribers.filter(sub => sub !== streamManager),
    );
  };

  const joinSession = () => {
    const OV = new OpenVidu();

    const newSession = OV.initSession();
    setSession(newSession);
    const { sessionId, token, participantName } = JSON.parse(
      sessionStorage.getItem("ovInfo")!,
    );
    console.log("===========세션에 저장된 오픈비두 ===============")
    console.log(sessionId, token, participantName);
    // Connect to the session
    newSession
      .connect(token, { clientData: participantName })
      .then(async () => {
        const publisher = await OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: true,
        });

        newSession.publish(publisher);

        const devices = await OV.getDevices();
        const videoDevices = devices.filter(
          device => device.kind === "videoinput",
        );
        const currentVideoDeviceId = publisher.stream
          .getMediaStream()
          .getVideoTracks()[0]
          .getSettings().deviceId;
        const currentVideoDevice = videoDevices.find(
          device => device.deviceId === currentVideoDeviceId,
        );

        if (currentVideoDevice) {
          setCurrentVideoDevice(currentVideoDevice);
        }
        setMainStreamManager(publisher);
        setPublisher(publisher);
      })
      .catch(error => {
        console.log(
          "There was an error connecting to the session:",
          error.code,
          error.message,
        );
      });

    newSession.on("streamCreated", event => {
      // 새로운 스트림이 생성될 때, 해당 스트림을 구독
      const subscriber = newSession.subscribe(event.stream, undefined);
      // 구독한 스트림을 구독자 목록에 추가
      setSubscribers(prevSubscribers => [...prevSubscribers, subscriber]);
      console.log("setSubscribers", subscribers);
    });

    newSession.on("streamDestroyed", event => {
      deleteSubscriber(event.stream.streamManager);
    });

    newSession.on("exception", exception => {
      console.warn(exception);
    });
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
    }
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    setSession(undefined);
    setSubscribers([]);
    setPublisher(undefined);
    setSortedSubscribers([]);
    setIsFull(false);
    router.push("/main");
  };

  const showArrow = (datas: Array<chooseResult>) => {
    const acc = [-2, -1, 0, 1, 2, 3];
    datas.forEach(({ sender, receiver }, idx) => {
      const fromUser = document.getElementById(sender) as HTMLDivElement;
      const toUser = document.getElementById(receiver) as HTMLDivElement;
      const arrowContainer = fromUser?.querySelector(
        ".arrow-container",
      ) as HTMLDivElement;
      const arrowBody = arrowContainer?.querySelector(
        ".arrow-body",
      ) as HTMLDivElement;
      // console.log(sender, receiver);
      // console.log(fromUser, toUser, arrowContainer, arrowBody);

      const rect1 = fromUser.getBoundingClientRect();
      const rect2 = toUser.getBoundingClientRect();
      // console.log(rect1, rect2);
      const centerX1 = rect1.left + rect1.width / 2 + acc[idx] * 10;
      const centerY1 = rect1.top + rect1.height / 2 + acc[idx] * 10;
      const centerX2 = rect2.left + rect2.width / 2 + acc[idx] * 10;
      const centerY2 = rect2.top + rect2.height / 2 + acc[idx] * 10;
      // const halfWidth = Math.abs(rect1.right - rect1.left) * (3 / 4);

      const deltaX = centerX2 - centerX1;
      const deltaY = centerY2 - centerY1;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      // const arrowWidth = distance - halfWidth;

      if (idx > 2) {
        arrowBody.style.backgroundColor = "#33C4D7";
        const arrowHead = arrowBody.querySelector(
          '.arrow-head'
        ) as HTMLDivElement;
        arrowHead.style.borderBottom = "20px solid #33C4D7";
      }
      arrowBody.style.width = distance + "px";
      arrowContainer.style.top = centerY1 - rect1.top + "px";
      arrowContainer.style.left = centerX1 - rect1.left + "px";
      arrowContainer.style.transform = `rotate(${
        (Math.atan2(deltaY, deltaX) * 180) / Math.PI
      }deg)`;
      arrowContainer.classList.remove("hidden");
    });
  };

  const hideArrow = () => {
    const arrowContainers = document.querySelectorAll(".arrow-container");
    arrowContainers.forEach(arrowContainer => {
      arrowContainer.classList.add("hidden");
    });
  };

  const changeLoveStickMode = (datas: Array<chooseResult>) => {
    if (keywordRef.current) {
      keywordRef.current.innerText = "에그 시그널 결과";
      console.log("에그시그널 결과라고 p태그 변경했음");
    }
    const videoContainer =
      document.getElementsByClassName("video-container")[0];
    const videoElements = document.querySelectorAll("video");
    const canvasElements = document.querySelectorAll("canvas");
    videoElements.forEach(video => {
      video.style.width = "100%";
      video.style.height = "100%";
    });
    canvasElements.forEach(canvas => {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    });
    // if (!isLoveMode) {
    videoContainer.classList.add("love-stick");
    showArrow(datas);
    // setIsLoveMode(true);
    return;
    // }
    // videoContainer.classList.remove("love-stick");
    // hideArrow();
    // setIsLoveMode(false);
  };

  const undoLoveStickMode = () => {
    // if (keywordRef.current) {
    //   keywordRef.current.innerText = '';
    //   console.log("에그시그널 결과라고 p태그 변경한거 삭제함");
    // }
    const videoContainer =
      document.getElementsByClassName("video-container")[0];
    console.log("사랑의 작대기 모드 해제");
    videoContainer.classList.remove("love-stick");
    hideArrow();
  };
  // time 초 동안 발표 모드 (presenter: 발표자, time: 발표 시간(초))
  const changePresentationMode = (presenter: HTMLDivElement, time: number) => {
    const videoSet = new Set<HTMLDivElement | null>();
    videoSet.add(presenter);
    videoSet.add(pubRef.current);
    subRef.current.forEach(sub => {
      videoSet.add(sub);
    });
    const videoArray = Array.from(videoSet);

    // 비디오 그리드 a: main , bcdef
    videoArray.forEach((video, idx) => {
      video?.classList.add(String.fromCharCode(97 + idx));
    });

    // time 초 후 원래대로
    setTimeout(() => {
      videoArray.forEach((video, idx) => {
        video?.classList.remove(String.fromCharCode(97 + idx));
      });
    }, time * 1000);
  };

  const captureCamInit = () => {
    const videoElement = captureRef.current?.querySelector(
      "video",
    ) as HTMLVideoElement;
    const canvasElement = captureRef.current?.querySelector(
      "canvas",
    ) as HTMLCanvasElement;
    if (videoElement) {
      videoElement.style.display = "none";
    }
    if (canvasElement) {
      canvasElement.style.display = "none";
    }
  };

  const openKeyword = (random: number) => {
    if (keywordRef.current) {
      keywordRef.current.innerText = keywords[random];
    }
  };

  const undoChooseMode = () => {
    // 선택 모드 일 때는 마우스 하버시에 선택 가능한 상태로 변경
    // 클릭 시에 선택된 상태로 변경
    if (keywordRef.current) {
      keywordRef.current.innerText = "";
      console.log("선택모드 p태그 삭제");
    }
    const chooseBtns = document.getElementsByClassName("choose-btn");
    const btnArray = Array.from(chooseBtns);
    btnArray.forEach(btn => {
      btn.classList.add("hidden");
    });
  };

  const setChooseMode = () => {
    // 선택 모드 일 때는 마우스 하버시에 선택 가능한 상태로 변경
    // 클릭 시에 선택된 상태로 변경
    if (keywordRef.current) {
      keywordRef.current.innerText = "대화해보고 싶은 사람을 선택해주세요";
    }
    console.log("선택 모드로 변경");
    const chooseBtns = document.getElementsByClassName("choose-btn");
    const btnArray = Array.from(chooseBtns);
    btnArray.forEach(btn => {
      btn.classList.remove("hidden");
    });
  };

  const setOneToOneMode = (loverElement: HTMLDivElement) => {
    console.log("1:1 모드로 시작");
    const videoContainer = document.getElementsByClassName(
      "video-container",
    )[0] as HTMLDivElement;
    const videoElements = document.querySelectorAll("video");
    const canvasElements = document.querySelectorAll("canvas");
    const streamElements = document.getElementsByClassName(
      "stream-container",
    ) as HTMLCollectionOf<HTMLDivElement>;
    videoElements.forEach(video => {
      video.style.width = "100%";
      video.style.height = "100%";
    });
    canvasElements.forEach(canvas => {
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    });
    // if (!isOneToOneMode) {
    console.log("1:1 모드로 변경");
    videoContainer.classList.add("one-one-four");
    streamElements[0].classList.add("a");
    if (!loverElement) {
      console.log("상대방이 없습니다.");
    }
    loverElement?.classList.add("b");
    console.log("컨테이너", videoContainer);
    console.log("나자신", streamElements[0]);
    console.log("상대방: ", loverElement);
    let acc = 2;
    for (let i = 1; i < streamElements.length; i++) {
      if (streamElements[i].classList.contains("b")) {
        continue;
      }
      const className = String.fromCharCode(97 + acc);
      streamElements[i].classList.add(className);
      acc += 1;
    }
  };

  const undoOneToOneMode = (loverElement: HTMLDivElement) => {
    console.log("1:1 모드 해제");
    const videoContainer =
      document.getElementsByClassName("video-container")[0];
    const streamElements = document.getElementsByClassName("stream-container");
    videoContainer.classList.remove("one-one-four");
    streamElements[0].classList.remove("a");
    let acc = 2;
    for (let i = 1; i < streamElements.length; i++) {
      if (streamElements[i].classList.contains("b")) {
        continue;
      }
      const className = String.fromCharCode(97 + acc);
      streamElements[i].classList.remove(className);
      acc += 1;
    }
    loverElement?.classList.remove("b");
    console.log("나자신", streamElements[0]);
    console.log("상대방: ", loverElement);
  };
  const randomUser = (keywordIdx: number, pickUser: string) => {
    const streamElements = document.getElementsByClassName("stream-container");
    const tickSound = document.getElementById("tickSound") as HTMLAudioElement;

    if (keywordRef.current) {
      keywordRef.current.innerText =
        "곧 한 참가자가 선택됩니다. 선택된 사람은 질문에 답변해주세요";
    }

    const animationDuration = 10000; // 초기 강조 애니메이션 기본 지속 시간
    const currentIndex = 0;
    let currentDuration = 50;
    let isAnimating = true;

    // speaking 클래스 제거
    for (let i = 0; i < streamElements.length; i++) {
      streamElements[i].classList.remove("speaking");
    }

    const highlightUser = (index: number) => {
      if (!isAnimating) return;
      // 현재 인덱스의 참여자를 강조 (빨간색 border 추가)
      streamElements[index].classList.add("highlighted");

      // 룰렛 소리 재생
      tickSound.currentTime = 0; // 오디오를 처음부터 재생
      tickSound.play();

      // 일정 시간 후에 border 초기화 (빨간색 border 제거)
      setTimeout(() => {
        streamElements[index].classList.remove("highlighted");
        streamElements[(index + 1) % streamElements.length].classList.add(
          "highlighted",
        );

        // 다음 참여자 강조 시작 (재귀 호출)
        setTimeout(() => {
          currentDuration += 10;
          highlightUser((index + 1) % streamElements.length);
        }, currentDuration - 10);

        setTimeout(() => {
          isAnimating = false;
          for (let i = 0; i < streamElements.length; i++) {
            streamElements[i].classList.remove("highlighted");
          }
          openKeyword(keywordIdx);
          // todo1: random user nickname(pickUser) 으로 video 찾아서 발표자 화면 출력하기
          const presenterElement = Array.prototype.filter.call(
            streamElements,
            function (element) {
              const nestedDiv = element.querySelector(
                `div > div[id=${pickUser}]`,
              );
              return nestedDiv !== null;
            },
          )[0];
          changePresentationMode(presenterElement, 10);
        }, animationDuration);
      }, currentDuration - 10);
    };
    // 초기 강조 시작
    highlightUser(currentIndex);
  };
      return;
    }
    videoContainer.classList.remove('one-one-four');
    for (let i = 0; i < streamElements.length; i++) {
      const className = String.fromCharCode(97 + i);
      streamElements[i].classList.remove(className);
    }
    setIsOneToOneMode(false);
  };

  useEffect(() => {
    joinSession();
  });

  return (
    <div className="container">
      <div id="session">
        <div id="session-header">
          <input
            className="btn btn-large btn-danger"
            type="button"
            id="buttonLeaveSession"
            onClick={leaveSession}
            value="Leave session"
          />
          <div className="btn-container">
            <button onClick={openReal}>캠 오픈</button>
            <button onClick={changeLoveStickMode}>사랑의 작대기</button>
            <button onClick={openKeyword}>키워드</button>
            <button onClick={setGrayScale}>흑백으로 만들기</button>
            <button onClick={setChooseMode}>선택모드</button>
            <button onClick={setOneToOneMode}>1:1모드</button>
            <button onClick={() => showArrow(datass)}>그냥 연결</button>
          </div>
        </div>
        <div className="keyword-wrapper">
          <p className="keyword"></p>
        </div>

        <div className="col-md-6 video-container">
          {publisher !== undefined ? (
            <div
              className="stream-container col-md-6 col-xs-6 pub"
              // onClick={() => handleMainVideoStream(publisher)}
            >
              <UserVideoComponent streamManager={publisher}/>
            </div>
          ) : null}
          {subscribers.map((sub, i) => (
            <div
              key={sub.id}
              className="stream-container col-md-6 col-xs-6 sub"
              // onClick={() => handleMainVideoStream(sub)}
            >
              <span>{sub.id}</span>
              <UserVideoComponent streamManager={sub}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Meeting;
