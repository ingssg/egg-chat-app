"use client";

import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRecoilValue, useRecoilState } from "recoil";
import { Session, Publisher, StreamManager } from "openvidu-browser";
import "animate.css";
import {
  chooseState,
  meetingSocketState,
  isChosenState,
} from "@/app/store/socket";
import { avatarState } from "@/app/store/avatar";
import { userState } from "@/app/store/userInfo";
import { defaultSessionState, winnerSessionState } from "@/app/store/ovInfo";
import UserVideoComponent from "@/containers/meeting/UserVideoComponent";
import UserVideoComponent2 from "@/containers/main/UserVideo";
import {
  changeLoveStickMode,
  undoLoveStickMode,
  captureVideoFrame,
  captureCamInit,
  randomKeywordEvent,
} from "@/utils/meeting/meetingUtils";
import {
  joinSession,
  toggleLoserAudio,
  toggleLoverAudio,
  getUserID,
  getUserGender,
  sortSubscribers,
  openCam,
  leaveHandler,
  getNetworkInfo,
  getVideoConstraints,
  updatePublisherStream,
  getSystemPerformance,
} from "@/utils/meeting/openviduUtils";

type chooseResult = {
  sender: string;
  receiver: string;
};

const DynamicAvatarCollection = dynamic(
  () => import("@/containers/main/AvatarCollection"),
  { ssr: false },
);

const DynamicCanvasModal = dynamic(
  () => import("@/containers/meeting/CanvasModal"),
  { ssr: false },
);

const DynamicMatchingResult = dynamic(
  () => import("@/containers/meeting/MatchingResult"),
  { ssr: false },
);

const DynamicEggTimer = dynamic(() => import("@/containers/meeting/EggTimer"), {
  ssr: false,
});

const DynamicMeetingLoading = dynamic(
  () => import("@/containers/meeting/MeetingLoading"),
  { ssr: false },
);

const DynamicEmoji = dynamic(() => import("@/containers/meeting/emoji"), {
  ssr: false,
});

const DynamicMikeMuteButton = dynamic(
  () => import("@/containers/meeting/MikeMuteButton"),
  {
    ssr: false,
  },
);

const Meeting = () => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [publisher, setPublisher] = useState<Publisher | undefined>(undefined);
  const [subscribers, setSubscribers] = useState<StreamManager[]>([]);
  const [sortedSubscribers, setSortedSubscribers] = useState<StreamManager[]>(
    [],
  );
  const [speakingPublisherIds, setSpeakingPublisherIds] = useState<string[]>(
    [],
  );
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState<boolean>(false);
  const [keywordsIndex, setKeywordsIndex] = useState(0);
  const [isChosen, setIsChosen] = useRecoilState(isChosenState);

  const captureRef = useRef<HTMLDivElement>(null);
  const keywordRef = useRef<HTMLParagraphElement>(null);
  const pubRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<Array<HTMLDivElement | null>>([]);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<HTMLDivElement>(null);

  const [avatar, setAvatar] = useRecoilState(avatarState);
  const [isOpenCam, setIsOpenCam] = useState<boolean>(false);
  const [socket, setSocket] = useRecoilState(meetingSocketState);
  const [isFull, setIsFull] = useState<boolean>(false);
  const userInfo = useRecoilValue(userState);
  const isFullRef = useRef(isFull);
  const [isMatched, setIsMatched] = useState<boolean>(false); // 매칭이 되었는지 여부
  const [choiceState, setChoiceState] = useRecoilState(chooseState);
  const [lover, setLover] = useState<string>("");

  const { sessionId, token, participantName } =
    useRecoilValue(defaultSessionState);
  const [, setSessionInfo] = useRecoilState(winnerSessionState);

  const router = useRouter();

  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isFinish, setIsFinish] = useState(false);

  const chooseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 어떻게든 종료 하면 세션에서 나가게함.
  useEffect(() => {
    console.log("메인이 실행되었습니다.");
    const handleBeforeUnload = () => leaveSession();
    window.addEventListener("beforeunload", handleBeforeUnload);

    const preventGoBack = () => {
      history.pushState(null, "", location.href);
      leaveHandler(leaveSession);
      setSubscribers([]); // 리렌더링용
    };
    history.pushState(null, "", location.href);
    window.addEventListener("popstate", preventGoBack);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", preventGoBack);
      console.log("메인이 종료되었습니다.");
    };
  }, []);

  // 선택된 표시 제거
  const removeChooseSign = () => {
    const chosenElements = document.getElementsByClassName("chosen-stream");
    const opacityElements = document.getElementsByClassName("opacity");
    Array.from(chosenElements).forEach(chosenElement => {
      chosenElement.classList.remove("chosen-stream");
    });
    Array.from(opacityElements).forEach(opacityElement => {
      opacityElement.classList.remove("opacity");
    });
  };

  const leaveSession = (isSucceedFlag = false) => {
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
    setChoiceState("");
    setIsChosen(false);
    OffSocketEvent();

    if (!isSucceedFlag) {
      router.push("/main");
      return;
    } else {
      router.push("/meeting/matching");
      return;
    }
  };

  // time 초 동안 발표 모드 (presenter: 발표자, time: 발표 시간(초), mention: 발표 주제)
  const changePresentationMode = (
    presenter: HTMLDivElement,
    time: number,
    mention: string = "",
  ) => {
    if (keywordRef.current) {
      keywordRef.current.innerText = mention;
    }
    const videoSet = new Set<HTMLDivElement | null>();
    videoSet.add(presenter); // 발표자 추가
    videoSet.add(pubRef.current); // 다음으로 퍼블리셔 추가
    subRef.current.forEach(sub => {
      videoSet.add(sub); // 나머지 사람들 다 추가
    });
    const videoArray = Array.from(videoSet); // 중복 제거된 순서대로 발표자 > 나 > 나머지 순서대로 정렬
    videoContainerRef.current?.classList.add("presentation-mode");
    // 비디오 그리드 a: main , bcdef
    videoArray.forEach((video, idx) => {
      video?.classList.add(String.fromCharCode(97 + idx));
    });

    // time 초 후 원래대로
    setTimeout(() => {
      videoArray.forEach((video, idx) => {
        video?.classList.remove(String.fromCharCode(97 + idx));
      });
      videoContainerRef.current?.classList.remove("presentation-mode");
      if (keywordRef.current) {
        keywordRef.current.innerText = "";
      }
    }, time * 1000);
  };

  const undoChooseMode = () => {
    setIsChosen(false);
    // 선택 모드 일 때는 마우스 하버시에 선택 가능한 상태로 변경
    // 클릭 시에 선택된 상태로 변경
    if (keywordRef.current) {
      keywordRef.current.innerText = "";
      console.log("선택모드 p태그 삭제");
    }

    const oppositeRef = subRef.current.slice(2);

    oppositeRef.forEach(subContainer => {
      const chooseBtn = subContainer!.getElementsByClassName("choose-btn")[0];
      chooseBtn.classList.add("hidden");
    });
  };

  const setChooseMode = () => {
    // 선택 모드 일 때는 마우스 하버시에 선택 가능한 상태로 변경
    // 클릭 시에 선택된 상태로 변경
    if (keywordRef.current) {
      keywordRef.current.innerText = "대화해보고 싶은 사람을 선택해주세요";
    }
    // 이성만 선택 버튼 활성화
    const oppositeRef = subRef.current.slice(2);

    oppositeRef.forEach(subContainer => {
      const chooseBtn = subContainer!.getElementsByClassName("choose-btn")[0];
      chooseBtn.classList.remove("hidden");
    });
    setIsChosen(false);
    chooseTimerRef.current = setTimeout(() => {
      const emitChoose = (eventName: string) => {
        socket?.emit(eventName, {
          sender: userInfo?.nickname,
          receiver: subRef.current[subRef.current.length - 1]?.id,
        });
      };
      if (choiceState === "first") {
        emitChoose("choose");
      } else {
        emitChoose("lastChoose");
      }
    }, 5000);
  };

  const setOneToOneMode = (loverElement: HTMLDivElement) => {
    console.log("1:1 모드로 시작");
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
    videoContainerRef.current?.classList.add("one-one-four");
    streamElements[0].classList.add("a");
    if (!loverElement) {
      console.log("상대방이 없습니다.");
    }
    loverElement?.classList.add("b");
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
    setIsChosen(false);
    const streamElements = document.getElementsByClassName("stream-container");
    videoContainerRef.current?.classList.remove("one-one-four");
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
  };

  const meetingEvent = () => {
    socket?.on("keyword", message => {
      try {
        console.log("keyword Event: ", message);
        console.log("random user: ", message.getRandomParticipant);

        if (sessionRef.current) {
          sessionRef.current.classList.add("bg-black");
        }
        setTimeout(() => {
          pubRef.current?.classList.add("bright-5");
          subRef.current.forEach(sub => {
            sub?.classList.add("bright-5");
          });
        }, 500); // 0.5초 후 밝기 하락
        setTimeout(() => {
          if (keywordRef.current) {
            keywordRef.current.classList.add("text-white");
            keywordRef.current.innerText =
              "곧 한 참가자가 선택됩니다. 선택된 사람은 질문에 답변해주세요";
          }
        }, 2000);
        setTimeout(() => {
          randomKeywordEvent(
            parseInt(message.message),
            message.getRandomParticipant,
            pubRef.current as HTMLDivElement,
            subRef.current as HTMLDivElement[],
            changePresentationMode,
          );
          setTimeout(() => {
            if (sessionRef.current) {
              sessionRef.current.classList.remove("bg-black");
            }
            setTimeout(() => {
              pubRef.current?.classList.remove("bright-5");
              subRef.current.forEach(sub => {
                sub?.classList.remove("bright-5");
              });
              if (keywordRef.current) {
                keywordRef.current.classList.remove("text-white");
              }
            }, 500); // 0.5초 후 밝기 해제
          }, 21000); // 총 발표 시간
        }, 5000); // 어두워 지고 5초 후 이벤트 시작
      } catch (e: any) {
        console.error(e);
      }
    });

    socket?.on("finish", message => {
      try {
        console.log(message);
        // 1차: 모든 참여자 세션 종료
        let countdown = 5;
        const intervalId = setInterval(() => {
          if (countdown > 0) {
            if (keywordRef.current) {
              keywordRef.current.innerText = `${countdown}초 뒤 미팅이 종료됩니다.`;
            }
            countdown -= 1;
          } else {
            clearInterval(intervalId);
            if (keywordRef.current) {
              keywordRef.current.innerText = "";
            }
            setIsFinish(true);
            if (session) {
              session.disconnect();
              setSession(undefined);
            }
            // leaveSession();
          }
        }, 1000);
      } catch (e: any) {
        console.error(e);
      }
    });

    // 선택 결과 받고 사랑의 작대기 모드로 변경
    socket?.on("chooseResult", response => {
      try {
        console.log("chooseResult 도착");
        console.log("chooseResult = ", response);
        undoChooseMode(); // 선택모드 해제
        removeChooseSign(); // 선택된 사람 표시 제거
        changeLoveStickMode(
          response.message as Array<chooseResult>,
          subRef.current as HTMLDivElement[],
          pubRef.current as HTMLDivElement,
          videoContainerRef.current as HTMLDivElement,
        );
        setTimeout(() => {
          console.log("원 위치로 변경");
          undoLoveStickMode(
            subRef.current as HTMLDivElement[],
            pubRef.current as HTMLDivElement,
            videoContainerRef.current as HTMLDivElement,
          );
          if (keywordRef.current) {
            console.log("잠시 후 1:1대화가 시작된다는 멘트 ");
            keywordRef.current.innerText =
              "잠시 후 매칭된 사람과의 1:1 대화가 시작됩니다.";
          }
        }, 10000); // 5초 후 원 위치
      } catch (e: any) {
        console.error(e);
      }
    });

    // 선택시간 신호 받고 선택 모드로 변경
    socket?.on("cupidTime", (response: string) => {
      try {
        console.log("cupidTime 도착", response);
        setChoiceState("first");
      } catch (e: any) {
        console.error(e);
      }
    });

    socket?.on("lastCupidTime", (response: any) => {
      try {
        console.log("lastCupidTime 도착", response);
        setChoiceState("last");
      } catch (e: any) {
        console.error(e);
      }
    });

    socket?.on("lastChooseResult", response => {
      try {
        console.log("lastChooseResult 도착");
        console.log("lastChooseResult = ", response);
        undoChooseMode(); // 선택모드 해제
        removeChooseSign(); // 선택된 사람 표시 제거
        changeLoveStickMode(
          response.message as Array<chooseResult>,
          subRef.current as HTMLDivElement[],
          pubRef.current as HTMLDivElement,
          videoContainerRef.current as HTMLDivElement,
        );
        setTimeout(() => {
          console.log("원 위치로 변경");
          undoLoveStickMode(
            subRef.current as HTMLDivElement[],
            pubRef.current as HTMLDivElement,
            videoContainerRef.current as HTMLDivElement,
          );
          if (keywordRef.current) {
            keywordRef.current.innerText = "잠시 후 미팅이 종료됩니다";
          }
        }, 5000); // 5초 후 원 위치 (시연용)
      } catch (e: any) {
        console.error(e);
      }
    });

    type lastCupidResult = {
      lover: string;
    };

    socket?.on("matching", (response: lastCupidResult) => {
      try {
        console.log("matching도착", response);
        const { lover } = response;
        if (lover != "0") {
          // 러버 저장하고 넘겨야해요. 모달로 띄워야되니까
          console.log("제게는 사랑하는 짝이 있어요. 그게 누구냐면..", lover);
          setLover(lover);
          setCapturedImage(captureVideoFrame(lover) as string);
          setIsMatched(true); // 이게 성공 모달
        }
      } catch (e: any) {
        console.error(e);
      }
    });

    socket?.on("choice", response => {
      console.log("choice 도착!~~~~~~~~~~~~~~", response);
      const { sessionId, token } = response;
      setSessionInfo({ sessionId: sessionId, token: token });
      leaveSession(true);
    });

    /**그림대회 모달 */
    socket?.on("drawingContest", response => {
      console.log("drawingContest 도착", response);
      const index = response.keywordsIndex;
      setKeywordsIndex(index);
      if (keywordRef.current)
        keywordRef.current.innerText = "잠시 후 그림 대회가 시작됩니다";

      setTimeout(() => {
        if (keywordRef.current)
          keywordRef.current.innerText =
            "1등은 원하는사람과 1:1 대화를 할 수 있어요";
      }, 4500);

      setTimeout(() => {
        setIsCanvasModalOpen(true);
        if (keywordRef.current) {
          keywordRef.current!.innerText = "주제에 맞는 그림을 그려보세요";
        }
      }, 8000);

      setTimeout(() => {
        if (keywordRef.current) {
          keywordRef.current!.innerText = "";
        }
      }, 20000);
    });

    /**이모티콘 */
    socket?.on("emojiBroadcast", ({ nickname, emojiIndex }) => {
      const targetVideo = document.getElementById(nickname);
      const emojiContainer = targetVideo?.querySelector(".emoji-container");

      if (emojiContainer) {
        const emojiElement = document.createElement("div");
        emojiElement.className =
          "emoji absolute text-5xl animate__animated animate__bounceInUp";
        const emojiImage = (
          <Image src={emojiIndex} alt="" width={56} height={56} />
        );
        createRoot(emojiElement).render(emojiImage);

        emojiContainer.appendChild(emojiElement);

        emojiElement.onanimationend = () => {
          emojiElement.classList.replace(
            "animate__bounceInUp",
            "animate__bounceOutUp",
          );
          emojiElement.onanimationend = () =>
            emojiContainer.removeChild(emojiElement);
        };
      }
    });

    // 자기소개 시간
    socket?.on("introduce", response => {
      try {
        if (keywordRef.current) {
          keywordRef.current.innerText =
            "잠시 후 화면에 표시된 사람은 자기소개를 시작해주세요";
        }
        console.log(response);

        setTimeout(() => {
          // const participantsArray: Array<string> = response;
          const participantsArray: string = response;
          console.log("Introduce 도착", participantsArray);
          // let idx = 0;
          const participantElement = document.getElementById(
            // participantsArray[idx],
            participantsArray, //FIXME 시연용
          ) as HTMLDivElement;
          changePresentationMode(
            participantElement,
            // 10,
            // "20초간 자기소개 해주세요",
            5, //FIXME 시연용
            "자기소개 해주세요", //FIXME 시연용
          ); // FIXME 테스트용 10초 나중에 원래대로 돌리기
          // const timeInterval = setInterval(() => {
          //   idx += 1;
          //   const participantElement = document.getElementById(
          //     participantsArray[idx],
          //   ) as HTMLDivElement;
          //   changePresentationMode(
          //     participantElement,
          //     10,
          //     "20초간 자기소개 해주세요",
          //   ); // FIXME 테스트용 10초 나중에 원래대로 돌리기
          //   if (idx == 5) {
          //     clearInterval(timeInterval);
          //   }
          // }, 10100); // FIXME 테스트용 10초 나중에 원래대로 돌리기
        }, 5000);
      } catch (e: any) {
        console.error(e);
      }
    });
  };

  const meetingCupidResultEvent = () => {
    type cupidResult = {
      lover: string;
      loser: Array<string>;
    };

    // 선택 결과 받고 1:1 모드로 변경
    socket?.on("cupidResult", response => {
      try {
        console.log("cupidResult 도착", response);
        const { lover, loser } = response as cupidResult;
        console.log(lover, loser);

        // 매칭 된 사람의 경우
        setTimeout(() => {
          console.log("큐피드result로 계산 시작");
          if (lover != "0") {
            if (keywordRef.current) {
              console.log("즐거운 시간 보내라고 p 태그 변경");
              keywordRef.current.innerText =
                "즐거운 시간 보내세요~ 1:1 대화 소리는 다른 참여자들이 들을 수 없어요.";
            }
            const loverElement = document
              .getElementById(lover)
              ?.closest(".stream-container") as HTMLDivElement;

            loser.forEach(loser => {
              const loserElementContainer = document.getElementById(
                loser,
              ) as HTMLDivElement;
              const loserElement = loserElementContainer.querySelector(
                ".stream-wrapper",
              ) as HTMLDivElement;
              loserElement.classList.add("black-white");
            });

            setOneToOneMode(loverElement);
            toggleLoserAudio(subscribers, lover, false); // 나머지 오디오 차단
            setTimeout(() => {
              if (keywordRef.current) {
                keywordRef.current.innerText = "";
                console.log("즐거운시간 삭제");
              }
              undoOneToOneMode(loverElement);
              toggleLoserAudio(subscribers, lover, true); // 나머지 오디오 재개
              loser.forEach(loser => {
                const loserElementContainer = document.getElementById(
                  loser,
                ) as HTMLDivElement;
                const loserElement = loserElementContainer.querySelector(
                  ".stream-wrapper",
                ) as HTMLDivElement;
                loserElement.classList.remove("black-white");
              });
              // }, 60000); // 1분 후 원 위치
            }, 20000); //FIXME 시연용 20초 후 원 위치
          }
          // 매칭 안된 사람들의 경우
          else {
            // const pubElement = document.getElementsByClassName("pub")[0] as HTMLDivElement;
            // pubElement.classList.toggle("black-white");
            if (loser.length === 6) {
              if (keywordRef.current) {
                keywordRef.current.innerText =
                  "매칭 된 사람이 없습니다. 사이좋게 대화하세요";
              }
              return;
            }
            if (keywordRef.current) {
              keywordRef.current.innerText =
                "당신은 선택받지 못했습니다. 1:1 대화 중인 참여자들의 소리를 들을 수 없어요.";
            }
            toggleLoverAudio(subscribers, loser, false); // 매칭된 사람들 오디오 차단
            loser.forEach(loser => {
              const loserElementContainer = document.getElementById(
                loser,
              ) as HTMLDivElement;
              const loserElement = loserElementContainer.querySelector(
                ".stream-wrapper",
              ) as HTMLDivElement;
              loserElement.classList.add("black-white");
              setTimeout(() => {
                // pubElement.classList.toggle("black-white");
                loserElement.classList.remove("black-white");
                // }, 60000); // 1분 후 흑백 해제
              }, 20000); //FIXME 시연용 20초 후 원 위치
            });
            setTimeout(() => {
              if (keywordRef.current) {
                keywordRef.current.innerText = "";
              }
              toggleLoverAudio(subscribers, loser, true); // 오디오 재개
              // }, 60000); // 1분 후 음소거 해제
            }, 20000); //FIXME 시연용 20초 후 원 위치
          }
        }, 13000); // 결과 도착 후 13초뒤에 1:1 대화 진행
      } catch (e: any) {
        console.error(e);
      }
    });
  };

  const meetingCamEvent = () => {
    socket?.on("cam", message => {
      try {
        console.log("cam Event: ", message);
        let countdown = 5;
        const intervalId = setInterval(() => {
          if (countdown > 0) {
            if (keywordRef.current) {
              keywordRef.current.innerText = `${countdown}초 뒤 얼굴이 공개됩니다.`;
            }
            countdown -= 1;
          } else {
            clearInterval(intervalId);
            if (keywordRef.current) {
              keywordRef.current.innerText = "";
            }
            openCam(publisher as Publisher, setIsOpenCam);
          }
        }, 1000);
      } catch (e: any) {
        console.error(e);
      }
    });
  };

  const speakingStyle = (streamManager: Publisher | StreamManager) => {
    if(!speakingPublisherIds.includes(streamManager.stream.streamId)) {
      return {};
    }
    return {
      width: "100%",
      height: "100%",
      boxShadow: "0 0 10px 10px rgba(50, 205, 50, 0.7)",
    };
  };


  const OffSocketEvent = () => {
    if (socket) {
      socket.off("keyword");
      socket.off("finish");
      socket.off("chooseResult");
      socket.off("cupidTime");
      socket.off("lastCupidTime");
      socket.off("lastChooseResult");
      socket.off("matching");
      socket.off("choice");
      socket.off("drawingContest");
      socket.off("introduce");
      socket.off("cupidResult");
      socket.off("cam");
    }
  };

  useEffect(() => {
    if (!choiceState) {
      return;
    }
    setChooseMode();
  }, [choiceState]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (!isFullRef.current) {
        if (loadingRef.current) {
          loadingRef.current.innerHTML =
            "<p>누군가 연결을 해제하여 메인화면으로 이동합니다.</p>";
        }
        setTimeout(() => {
          leaveSession();
        }, 5000);
      }
    }, 60000); // 60초 동안 6명 안들어 오면 나가기

    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  useEffect(() => {
    isFullRef.current = isFull;
  }, [isFull]);

  useEffect(() => {
    if (!publisher) {
      return;
    }
    const updateNetwork = setInterval(() => {
      const networkInfo = getNetworkInfo();
      const systemInfo = getSystemPerformance();
      if (networkInfo) {
        const newConstraints = getVideoConstraints(networkInfo, systemInfo);
        updatePublisherStream(publisher, newConstraints);
      }
    }, 5000);
    meetingCamEvent();

    return () => clearInterval(updateNetwork);
  }, [publisher]);

  useEffect(() => {
    console.log("subscribers", subscribers);
    if (!subscribers) {
      return;
    }
    const cupidParams = {
      keywordRef,
      videoContainerRef,
      subscribers,
      setOneToOneMode,
      toggleLoserAudio,
      undoOneToOneMode,
      setIsChosen,
    }

    if (subscribers.length === 5) {
      if (getUserGender(publisher!) === "MALE") {
        sortSubscribers("MALE", subscribers, setSortedSubscribers);
      } else {
        sortSubscribers("FEMALE", subscribers, setSortedSubscribers);
      }
      setIsFull(true);
      socket?.emit("startTimer", { sessionId: sessionId });
      meetingCupidResultEvent(socket, cupidParams);
    }
    if (isFull && subscribers.length !== 5 && !isFinish) {
      if (keywordRef.current) {
        keywordRef.current.innerText =
          "누군가가 연결을 해제하여 10초 후 메인으로 이동합니다.";
      }
      setTimeout(() => {
        leaveSession();
      }, 10000); // 누군가 탈주하면 10초 뒤에 세션 종료
    }
  }, [subscribers]);

  useEffect(() => {
    if (!avatar) {
      console.log("avatar가 없습니ㅏㄷ!!!!!!!!!!!!!!!!!!");
      return;
    }

    captureCamInit(captureRef.current!); // 캡쳐용 비디오, 캔버스 display none
    joinSession({
      token,
      userInfo,
      captureRef: captureRef.current!,
      sessionId,
      setSession,
      setPublisher,
      setSubscribers,
      setSpeakingPublisherIds,
    });

    const meetingEventParams = {
      sessionRef,
      pubRef,
      subRef,
      keywordRef,
      videoContainerRef,
      session,
      setIsFinish,
      setSession,
      leaveSession,
      setSessionInfo,
      setLover,
      setCapturedImage,
      setIsMatched,
      setChoiceState,
      setIsCanvasModalOpen,
      setKeywordsIndex,
      setIsChosen,
    };

    meetingEvent(socket, meetingEventParams);

    return () => {
      setAvatar(null);
    };
  }, [avatar]);

  useEffect(() => {
    if (!isChosen) {
      return;
    }
    if (chooseTimerRef.current) {
      clearTimeout(chooseTimerRef.current);
      chooseTimerRef.current = null;
    }
  }, [isChosen]);

  return !avatar ? (
    <DynamicAvatarCollection />
  ) : !isFinish ? (
    <>
      {!isFull ? (
        <DynamicMeetingLoading ref={loadingRef} />
      ) : (
        <div className="h-full">
          <div
            id="session-header"
            className="fixed flex flex-col justify-center items-center w-full"
          >
            <div className="flex w-full mb-2 px-[10vw]">
              <input
                className="border-b border-gray-500 text-gray-500 cursor-pointer"
                type="button"
                id="buttonLeaveSession"
                onClick={() => leaveHandler(leaveSession)}
                value="종료하기"
              />
            </div>
            <DynamicEggTimer setTime={5} />
            <div className="w-full h-6 mt-4">
              <p
                className="flex justify-center items-center font-bold h-full text-3xl"
                ref={keywordRef}
              ></p>
              <audio
                id="tickSound"
                src="/sound/tick.mp3"
                className="hidden"
              ></audio>
            </div>
          </div>
          <div
            id="session"
            className="h-full flex justify-center items-center transition-colors duration-[1500ms] ease-in-out"
            ref={sessionRef}
          >
            <div
              className="relative col-md-6 video-container"
              ref={videoContainerRef}
            >
              {publisher !== undefined ? (
                <div
                  className={`stream-container col-md-6 col-xs-6 pub custom-shadow ${getUserGender(publisher)}`}
                  id={getUserID(publisher)}
                  ref={pubRef}
                  style={speakingStyle(publisher)}
                >
                  <UserVideoComponent
                    streamManager={publisher}
                  />
                </div>
              ) : null}
              {sortedSubscribers.map((sub, idx) => (
                <div
                  key={sub.stream.streamId}
                  data-key={sub.stream.streamId}
                  className={`stream-container col-md-6 col-xs-6 sub custom-shadow ${getUserGender(sub)}`}
                  id={getUserID(sub)}
                  ref={el => {
                    subRef.current[idx] = el;
                  }}
                  style={speakingStyle(sub)}
                >
                  <UserVideoComponent
                    key={sub.stream.streamId}
                    streamManager={sub}
                  />
                </div>
              ))}
            </div>
            <div className="fixed bottom-3 left-0 right-0 flex justify-center">
              <div className="relative bg-white p-2 rounded-lg shadow-md">
                <DynamicEmoji />
                <DynamicMikeMuteButton publisher={publisher} />
              </div>
            </div>
          </div>
        </div>
      )}
      {isCanvasModalOpen && (
        <DynamicCanvasModal
          onClose={() => setIsCanvasModalOpen(false)}
          keywordsIndex={keywordsIndex}
        />
      )}
      {!isOpenCam ? (
        <div ref={captureRef} className="hidden">
          <UserVideoComponent2 />
        </div>
      ) : null}
    </>
  ) : (
    <>
      {isFinish ? (
        <DynamicMatchingResult
          capturedImage={capturedImage}
          lover={lover}
          isMatched={isMatched}
          onClose={leaveSession}
        />
      ) : null}
    </>
  );
};

export default Meeting;
