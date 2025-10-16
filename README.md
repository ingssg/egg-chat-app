## 🍳 에그톡 (3대3 소셜 러브게임)

<div align="left">
<b>에그톡은 WebRTC와 OpenVidu 기술을 활용하여, 네트워크 환경이 좋지 않은 사용자도 지연 없이 대화를 이어갈 수 있도록 안정성을 보강한 3:3 단계별 소개팅 서비스입니다.</b>
</div>
<br/>


## 💻 서비스 소개

<p align="left">

![image](https://github.com/user-attachments/assets/eaddeda1-0394-421a-b443-43fdc7c8ae04)

#### 3대3 블라인드 미팅

미팅 중에 마음에 드는 사람과 1:1 대화를 할 수 있습니다.

#### 아이스브레이킹

처음 만나는 유저들간 어색함을 해소할 수 있는 자기 소개, 랜덤 질문, 그림 대회 이벤트를 제공합니다.

#### 최종 선택

최종 매칭이 되면 친구 신청 및 1:1 대화방으로 이동이 가능합니다. 친구가 되면 1:1 채팅을 할 수 있습니다.

---

### 🏠 메인 화면  
<img src="public/static/main_page.png" alt="메인 화면" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 🧸 아바타 선택  
<img src="public/static/avatar.png" alt="아바타 선택" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 💬 미팅 화면  
<img src="public/static/random.gif" alt="미팅 화면" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 💞 서로 선택  
<img src="public/static/love.gif" alt="서로 선택" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 🗣️ 미팅 중 1:1 대화  
<img src="public/static/oneone.png" alt="1:1 대화" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 🎨 미팅 중 그림 대회  
<img src="public/static/drawing.png" alt="그림 대회" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 📞 1:1 통화  
<img src="public/static/lastpick.png" alt="1:1 통화" width="450"/>
<hr width="450" color="#ddd" align="left"/>

### 💬 친구 채팅  
<img src="public/static/chat.png" alt="친구 채팅" width="450"/>

</p>



## 🔨 기술 스택

### Front-End

<div style="display: flex;">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Recoil-3578E5?style=for-the-badge&logo=recoil&logoColor=white" />
<img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</div>

### 🔍 Client 기술 설명
- **Next.js** – 서버사이드 렌더링을 활용해 초기 로딩 속도와 SEO를 개선
- **Recoil** – 유저 상태, 플레이어, 모달 등 전역 상태를 단일 스토어로 관리, 낮은 러닝커브
- **Three.js** – 3D 아바타의 표정·동작을 실시간으로 렌더링  
- **MindAR** – 얼굴 추적을 통해 사용자의 표정을 AR 아바타에 실시간 합성

---



## 📰 담당한 문제 및 해결
<img width="450" alt="image" src="https://github.com/user-attachments/assets/f122cac4-fc0e-4296-97e9-13e09119aca3" />

## 클라이언트별 네트워크 상태 기반 적응형 비디오 스트림 제어**

- 문제 상황  
    - 네트워크 환경이 좋지 않은(3G 환경 또는 RTT 150ms 이상) 클라이언트의 영상 전송이 지연되어  
      약 1200ms의 레이턴시가 발생하며, 미팅 간 대화 흐름이 자주 끊겼음.

- 해결 과정  
    - **첫 번째 시도**  
        - 사용자의 업링크 대역폭을 기준으로 동영상 품질을 동적으로 조절하려 시도함.  
        - 문제점: 업링크 대역폭을 브라우저에서 직접 측정할 방법이 없어, 실시간 추정이 불가능했음.  

    - **최종 해결 방법**  
        - OpenVidu는 기본적으로 **다운링크(수신자)** 기준으로만 자동 품질 조절을 수행하기 때문에,  
          송신자(업링크) 환경의 네트워크 저하에는 대응하지 못함.  
        - 이를 보완하기 위해, 클라이언트 단에서 사용자의 **네트워크 연결 유형(effectiveType)** 과  
          **RTT(왕복 지연 시간)** 을 기반으로 업링크 상태를 **간접적으로 추정**함.  
        - 업링크 상태가 불안정한 경우 (RTT ≥ 150ms 또는 3G 이하 환경)  
          **해상도(720p → 480p)** 및 **프레임레이트(30fps → 15fps)** 를 낮춰  
          `getUserMedia()` 제약 조건을 동적으로 변경하고,  
          이를 OpenVidu `Publisher`로 송출하도록 구현함.  
        - 안정적인 환경에서는 기본 품질(720p / 30fps)을 유지하여  
          영상 품질 저하 없이 실시간성을 확보함.

- 결과  
    - **지연시간 1200ms → 83ms (약 93% 감소)**  
    - 네트워크 환경이 불안정한 사용자도 **지연 없이 자연스러운 실시간 대화 가능**

- **사후 개선 및 리서치**  
    - 프로젝트 이후, **“유튜브나 틱톡 같은 플랫폼은 네트워크가 불안정할 때  
      어떻게 영상이 끊기지 않고 재생될까?”** 하는 궁금증에서 출발해 관련 기술을 리서치함.  
    - 조사 결과, 이들 플랫폼은 **Adaptive Bitrate (ABR)** 알고리즘을 사용해  
      실시간으로 전송 품질(전송 속도, 손실률, 지연 시간 등)을 측정하고,  
      그 결과에 따라 **비디오 비트레이트와 해상도를 동적으로 조정하여 끊김 없는 재생을 유지**함을 확인함.  
    - 이 원리를 간단히 프로젝트에 응용하기 위해  
      WebRTC의 `RTCPeerConnection.getStats()` API를 활용,  
      `bytesSent`, `framesEncoded`, `packetsLost`, `roundTripTime` 등의 송출 통계를 수집하고  
      네트워크 품질이 일정 기준 이하로 떨어질 경우 `getUserMedia()` 제약 조건을 변경하도록 구현함.  
    - 이를 통해 기존의 `RTT`·`networkType` 기반 추정 로직을  
      **실제 송출 통계 기반의 동적 조정 방식으로 발전**시켰으며,  
      OpenVidu 환경에서도 ABR의 핵심 원리를 일부 재현할 수 있었음.


---


### 🥚 역할 분담 (Front-End)

#### 김인석 (미팅 페이지 전반 개발)

- **3D 아바타 합성 및 실시간 송출 구현**  
  MindAR 라이브러리의 얼굴 메쉬와 BlendShapes(표정 데이터)를 사용하여  
  사용자의 얼굴 표정을 3D 아바타에 실시간으로 반영했습니다.  
  Three.js를 이용해 매 프레임마다 표정 데이터를 업데이트하고,  
  브라우저의 웹캠 스트림 위에 3D 모델을 오버레이하여  
  **실시간 아바타 합성 송출 기능**을 완성했습니다.

- **실시간 미팅 이벤트 및 타이머 동기화**  
  Socket.io를 활용해 백엔드 서버로부터 **미팅 타이머·이벤트 신호**를 수신하고,  
  클라이언트 간 시간을 동기화했습니다.  
  일정 시간마다 서버로부터 미팅 이벤트를 받아  
  아이스브레이킹(그림 대회 등) 컨텐츠를 자동으로 실행하도록 구현했습니다.

- **사용자 네트워크 상태에 따른 스트림 품질 조절**  
  navigator 객체를 통해 클라이언트의 **네트워크 유형과 RTT**를 측정해  
  연결이 불안정한 환경(3G 또는 RTT 150ms 이상)에서는  
  프레임레이트와 해상도를 자동으로 낮춰 송출했습니다.  
  이를 통해 **네트워크가 좋지 않은 사용자도 지연 없이 참여**할 수 있도록 개선했습니다.

- **동적 컴포넌트 로딩 최적화**  
  미팅 중 이벤트 수신 시에만 필요한 컴포넌트는  
  Dynamic Import(lazy loading)를 적용하여  
  **초기 렌더링 속도를 약 0.8초 단축**했습니다.

#### 이민형

메인 페이지 UI, 친구 채팅

#### 김재원

미팅 아이스브레이킹(그림 대회) 컨텐츠

#### 박진용

메인 페이지 내 전체 채팅


## 🧑‍💻 팀원 구성

|        [김인석](https://github.com/ingssg)        |        [김성현](https://github.com/sh940701)        |        [김재원](https://github.com/won-N-only)        |        [박진용](https://github.com/Bambamsong)        |        [남홍근](https://github.com/Amborsia)        |        [이민형](https://github.com/hyeong1)        |
| :-------------------------------------------------: | :-------------------------------------------------: | :---------------------------------------------------: | :---------------------------------------------------: | :-----------------------------------------------: | :------------------------------------------------: |
| ![김인석](https://github.com/ingssg.png?size=600) | ![김성현](https://github.com/sh940701.png?size=600) | ![김재원](https://github.com/won-N-only.png?size=600) | ![박진용](https://github.com/Bambamsong.png?size=600) | ![남홍근](https://github.com/Amborsia.png?size=600) | ![이민형](https://github.com/hyeong1.png?size=600) |
|                         FE                          |                      BE, Infra                      |                        BE, FE                         |                        BE, FE                         |                        BE                         |                         FE                         |




## 전체 포스터
<img width="1000" height="1400" src="public\static\poster.png">
