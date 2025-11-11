"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAE4C9]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-solid border-[#F8B85F] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-[#171717]">
            <Image
              src="/img/egg1.png"
              alt="에그톡 Logo"
              width={40}
              height={40}
              priority
            />
            <h1 className="font-Jalnan text-2xl text-[#F8B85F]">에그톡</h1>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a
              className="text-sm font-medium text-[#171717] hover:text-[#F8B85F]"
              href="#features"
            >
              특징
            </a>
            <a
              className="text-sm font-medium text-[#171717] hover:text-[#F8B85F]"
              href="#about"
            >
              소개
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate("/main")}
              className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#F8B85F] px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-all hover:bg-[#F8A85F] hover:shadow-lg"
            >
              <span className="truncate">시작하기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#FAE4C9] to-[#FFF5E6]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFE8C8] to-[#FFF5E6] opacity-50"></div>
              <div className="relative flex min-h-[60vh] flex-col items-center justify-center gap-8 p-8 text-center sm:min-h-[70vh] md:min-h-[75vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/img/egg1.png"
                      alt="에그톡 캐릭터"
                      width={80}
                      height={80}
                      className="animate-bounce"
                    />
                    <Image
                      src="/img/heart.png"
                      alt="하트"
                      width={50}
                      height={50}
                      className="animate-pulse"
                    />
                    <Image
                      src="/img/egg2.png"
                      alt="에그톡 캐릭터"
                      width={80}
                      height={80}
                      className="animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <h1 className="font-Jalnan text-4xl font-black leading-tight tracking-tighter text-[#F8B85F] sm:text-5xl md:text-6xl">
                    🍳 에그톡 (Egg-Talk)
                  </h1>
                  <h2 className="mx-auto max-w-3xl text-lg font-medium leading-relaxed text-[#5F4056] sm:text-xl md:text-2xl">
                    3:3 블라인드 미팅 서비스
                    <br />
                    <span className="text-base text-gray-600 sm:text-lg">
                      WebRTC와 Three.js 3D 아바타로 만나는 새로운 소셜 경험
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigate("/main")}
                  className="flex h-14 min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#FFB648] to-[#F8B85F] px-8 text-lg font-bold leading-normal tracking-[0.015em] text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <span className="truncate">지금 시작하기</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-Jalnan mb-12 text-center text-3xl text-[#F8B85F] sm:text-4xl">
              ✨ 주요 기능
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1: WebRTC 실시간 영상 통화 */}
              <div className="group relative flex flex-col items-center gap-6 rounded-2xl border-2 border-[#FAE4C9] bg-gradient-to-br from-white to-[#FFF5E6] p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#F8B85F] hover:shadow-xl">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAE4C9]">
                  <svg
                    className="h-12 w-12 text-[#F8B85F]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-Jalnan text-xl text-[#5F4056]">
                    실시간 영상 통화
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    OpenVidu 기반 WebRTC로 3:3 그룹 화상 통화와 1:1 대화 모드를
                    자유롭게 전환할 수 있어요.
                  </p>
                </div>
              </div>

              {/* Feature 2: 3D 아바타 & AR */}
              <div className="group relative flex flex-col items-center gap-6 rounded-2xl border-2 border-[#FAE4C9] bg-gradient-to-br from-white to-[#FFF5E6] p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#F8B85F] hover:shadow-xl">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAE4C9]">
                  <svg
                    className="h-12 w-12 text-[#F8B85F]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="8" r="7"></circle>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-Jalnan text-xl text-[#5F4056]">
                    3D 아바타 & AR
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    Three.js와 MindAR로 구현한 3D 아바타가 표정을 실시간으로
                    따라해요. 블라인드 미팅의 재미를 더해줍니다.
                  </p>
                </div>
              </div>

              {/* Feature 3: 아이스브레이킹 게임 */}
              <div className="group relative flex flex-col items-center gap-6 rounded-2xl border-2 border-[#FAE4C9] bg-gradient-to-br from-white to-[#FFF5E6] p-6 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#F8B85F] hover:shadow-xl">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FAE4C9]">
                  <svg
                    className="h-12 w-12 text-[#F8B85F]"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-Jalnan text-xl text-[#5F4056]">
                    재미있는 이벤트
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                    자기소개, 랜덤 질문, 그림 대회 등 다양한 아이스브레이킹
                    이벤트로 어색함을 해소하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Behind the Scene Section */}
        <section
          id="about"
          className="bg-gradient-to-br from-[#FAE4C9] to-[#FFF5E6] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <Image
                    alt="개발자 프로필 사진"
                    className="h-auto w-full max-w-md rounded-2xl border-4 border-[#F8B85F] object-cover shadow-2xl"
                    src="/img/ingssg_photo.webp"
                    width={400}
                    height={400}
                  />
                  <div className="absolute -right-4 -top-4 rounded-full bg-white p-3 shadow-lg">
                    <Image
                      src="/img/egg1.png"
                      alt="에그톡"
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <h2 className="font-Jalnan text-3xl tracking-tight text-[#F8B85F] sm:text-4xl">
                  🍳 프로젝트 소개
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-[#5F4056] sm:text-lg">
                  <strong className="text-[#F8B85F]">에그톡</strong>은 WebRTC와
                  OpenVidu 기술을 활용하여, 네트워크 환경이 좋지 않은 사용자도
                  지연 없이 대화를 이어갈 수 있도록 안정성을 보강한{" "}
                  <strong>3:3 단계별 소개팅 서비스</strong>입니다.
                </p>
                <p className="mt-4 max-w-xl text-base leading-8 text-gray-600">
                  실시간 비디오 스트림 품질을 동적으로 조절하고, Three.js 기반
                  3D 아바타로 블라인드 미팅의 재미를 더했습니다. 소켓 기반
                  실시간 이벤트로 자연스러운 만남을 제공합니다.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    Next.js 14
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    TypeScript
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    Recoil
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    OpenVidu
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    Socket.IO
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    Three.js
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    MindAR
                  </span>
                  <span className="rounded-full bg-[#F8B85F] px-4 py-2 text-sm font-bold text-white shadow-md">
                    TailwindCSS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FFB648] to-[#F8B85F] py-20 sm:py-24">
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/img/background_img.png"
              alt="배경"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6 flex justify-center gap-4">
                <Image
                  src="/img/egg1.png"
                  alt="에그"
                  width={60}
                  height={60}
                  className="animate-bounce"
                />
                <Image
                  src="/img/egg2.png"
                  alt="에그"
                  width={60}
                  height={60}
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
              <h2 className="font-Jalnan text-4xl font-bold text-white sm:text-5xl">
                새로운 만남을 시작해보세요 💕
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
                3:3 블라인드 미팅에서 당신의 운명을 찾아보세요.
                <br />
                3D 아바타와 함께하는 특별한 경험이 기다리고 있어요!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => handleNavigate("/main")}
                  className="font-Jalnan rounded-full bg-white px-10 py-4 text-xl font-semibold text-[#F8B85F] shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#FAE4C9] hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  🍳 에그톡 시작하기
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#F8B85F] bg-white py-10 text-sm text-[#5F4056]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/img/egg1.png" alt="에그톡" width={30} height={30} />
              <p className="font-Jalnan text-base">© 2025 에그톡 (Egg-Talk)</p>
            </div>
            <div className="flex items-center gap-x-4">
              <a
                className="transition-colors hover:text-[#F8B85F] hover:underline"
                href="https://raspy-law-bf1.notion.site/2a049a1a30b480e1a306c0a67ce68e5c"
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Resume
              </a>
              <span className="text-gray-400">·</span>
              <a
                className="transition-colors hover:text-[#F8B85F] hover:underline"
                href="https://raspy-law-bf1.notion.site/2a049a1a30b48069871af531b05a21da"
                target="_blank"
                rel="noopener noreferrer"
              >
                💼 Portfolio
              </a>
              <span className="text-gray-400">·</span>
              <a
                className="transition-colors hover:text-[#F8B85F] hover:underline"
                href="https://github.com/ingssg"
                target="_blank"
                rel="noopener noreferrer"
              >
                💻 GitHub
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>WebRTC · OpenVidu · Socket.IO · Three.js · MindAR</p>
            <p className="mt-1">
              네트워크 적응형 비디오 스트림 제어로 안정적인 실시간 통화 경험
              제공
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
