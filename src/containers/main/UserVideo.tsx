"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { MindARThree } from "mind-ar/dist/mindar-face-three.prod.js";
import { useRecoilValue } from "recoil";
import { avatarState } from "@/app/store/avatar";

interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

interface Blendshapes {
  categories: BlendshapeCategory[];
}

class Avatar {
  scene: THREE.Scene | null = null;
  gltf: GLTF | null = null;
  root: THREE.Bone | null = null;
  morphTargetMeshes: THREE.Mesh[] = [];
  avatarName: string | null = null;

  constructor(avatarName: string | null) {
    this.gltf = null;
    this.morphTargetMeshes = [];
    this.avatarName = avatarName;
  }

  async init() {
    const url = `/avatar/${this.avatarName}.glb`;
    const gltf: GLTF = await new Promise(resolve => {
      const loader = new GLTFLoader();
      loader.load(url, (gltf: GLTF) => {
        resolve(gltf);
      });
    });

    // 모델 뼈대 구조 파악
    gltf.scene.traverse(object => {
      if ((object as THREE.Bone).isBone && !this.root) {
        this.root = object as THREE.Bone; // as THREE.Bone;
      }
      if (!(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;

      // 모델 형태 변경 정보 파악
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      this.morphTargetMeshes.push(mesh);
    });
    this.gltf = gltf;
  }

  // 모델 돌면서 자원 해제
  disposeResources(): void {
    const scene = this.gltf?.scene;
    scene?.traverse((object: THREE.Object3D) => {
      if (!(object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(material => this.disposeMaterial(material));
          } else {
            this.disposeMaterial(mesh.material);
          }
        }
        return;
      }
    });
  }

  disposeMaterial(material: THREE.Material): void {
    const materialsWithMaps = [
      "map",
      "lightMap",
      "bumpMap",
      "normalMap",
      "envMap",
    ] as const;

    materialsWithMaps.forEach(mapName => {
      const materialWithMap = material as THREE.MeshStandardMaterial;
      if (materialWithMap[mapName]) {
        (materialWithMap[mapName] as THREE.Texture).dispose();
      }
    });

    material.dispose();
  }

  // 모델 형태 변환
  updateBlendshapes(blendshapes: Blendshapes) {
    const categories = blendshapes.categories;
    const coefsMap = new Map();
    for (let i = 0; i < categories.length; ++i) {
      if ((i <= 18 && i >= 13) || i <= 5) continue;
      coefsMap.set(categories[i].categoryName, categories[i].score);
    }
    for (const mesh of this.morphTargetMeshes) {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) {
        continue;
      }
      for (const [name, value] of coefsMap) {
        if (!Object.keys(mesh.morphTargetDictionary).includes(name)) {
          continue;
        }
        const idx = mesh.morphTargetDictionary[name];
        mesh.morphTargetInfluences[idx] = value;
      }
    }
  }
}

const logMemoryUsage = (label: string) => {
  if ("memory" in performance) {
    const memory: any = (performance as any).memory;
    // console.log(
    //   `${label} - JS Heap Size: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
    // );
  } else {
    // console.log("Memory performance API is not available in this browser.");
  }
};

function ARComponent() {
  const avatarName = useRecoilValue(avatarState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [avatar] = useState<Avatar>(new Avatar(avatarName));
  const [isARLoading, setIsARLoading] = useState<boolean>(true);

  useEffect(() => {
    logMemoryUsage("Before setup");

    // 모든 비디오 요소를 즉시 숨기기
    const hideAllVideos = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach(video => {
        (video as HTMLElement).style.display = "none";
        (video as HTMLElement).style.visibility = "hidden";
        (video as HTMLElement).style.opacity = "0";
        (video as HTMLElement).style.position = "absolute";
        (video as HTMLElement).style.left = "-9999px";
      });
    };

    // MindAR 스피너 숨기기 함수
    const hideMindarSpinners = () => {
      const mindarLoadingElements = document.querySelectorAll(
        "[class*='mindar'], [id*='mindar'], [class*='loading'], [id*='loading'], [class*='spinner']",
      );
      mindarLoadingElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        // 스피너나 로딩 인디케이터인 경우 숨기기
        if (
          htmlElement.style.animation ||
          htmlElement.classList.toString().includes("spinner") ||
          htmlElement.classList.toString().includes("loader") ||
          htmlElement.style.transform?.includes("rotate") ||
          getComputedStyle(htmlElement).animation !== "none"
        ) {
          htmlElement.style.display = "none";
          htmlElement.style.visibility = "hidden";
          htmlElement.style.opacity = "0";
        }
      });
    };

    // MutationObserver로 새로 추가되는 비디오와 스피너도 즉시 숨기기
    const observer = new MutationObserver(() => {
      hideAllVideos();
      hideMindarSpinners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 초기 비디오 숨기기
    hideAllVideos();

    const mindarThree = new MindARThree({
      container: containerRef.current!,
    });

    const { renderer, scene, camera } = mindarThree;
    // 기본 배경색으로 변경
    // renderer.setClearColor(0xfae4c9, 1);
    renderer.setClearColor(0x000000, 0);
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2.5);
    scene.add(light);

    // 화면 상의 특정 위치를 기준으로 얼굴을 식별하고 추적 여기서 1은 그냥 식별자임
    const anchor = mindarThree.addAnchor(1);

    const setup = async () => {
      // AR 시작 전까지 비디오 숨기기
      hideAllVideos();
      setIsARLoading(true);

      await avatar!.init();
      if (avatar!.gltf && avatar!.gltf.scene) {
        avatar!.gltf.scene.scale.set(2, 2, 2);
        /// 앵커에 아바타 추가
        anchor.group.add(avatar!.gltf.scene);
      }

      await mindarThree.start();

      // AR 초기화 완료 후 로딩 종료
      setIsARLoading(false);

      // MindAR가 생성하는 로딩 스피너 숨기기
      hideMindarSpinners();

      // AR 캔버스에 rounded 적용
      const canvas = renderer.domElement;
      if (canvas) {
        canvas.style.borderRadius = "0.75rem"; // rounded-xl
        canvas.style.overflow = "hidden";
      }

      // MindAR 시작 후에도 모든 비디오 숨기기
      hideAllVideos();

      const videoAfterStart = document.querySelector("video");
      if (!videoAfterStart) {
        console.error("비디오 없음!!!");
        return;
      }

      // 비디오를 완전히 숨기기
      (videoAfterStart as HTMLElement).style.display = "none";
      (videoAfterStart as HTMLElement).style.visibility = "hidden";
      (videoAfterStart as HTMLElement).style.opacity = "0";
      (videoAfterStart as HTMLElement).style.position = "absolute";
      (videoAfterStart as HTMLElement).style.left = "-9999px";

      const videoTexture = new THREE.VideoTexture(videoAfterStart);
      videoTexture.wrapS = THREE.RepeatWrapping;
      videoTexture.repeat.x = -1; // 텍스처 좌우 반전

      scene.background = videoTexture;

      // 얼굴 인식 못할 때 scene 배경
      const imgTexture = new THREE.TextureLoader().load(
        `/avatar/${avatarName}.png`,
      );
      imgTexture.wrapS = THREE.RepeatWrapping;
      imgTexture.wrapT = THREE.RepeatWrapping;

      let frame = 0;
      // 받은 정보로 프레임마다 아바타 모양 렌더링
      renderer.setAnimationLoop(() => {
        // 매 프레임마다 비디오 숨기기 (MindAR가 비디오를 다시 보이게 할 수 있으므로)
        hideAllVideos();

        // MindAR 로딩 스피너 지속적으로 숨기기
        hideMindarSpinners();

        // 가장 최근의 추정치를 가져옴
        const estimate = mindarThree.getLatestEstimate();
        if (estimate && estimate.blendshapes) {
          avatar!.updateBlendshapes(estimate.blendshapes);
          scene.background = videoTexture;
        } else {
          scene.background = imgTexture;
        }
        renderer.render(scene, camera);

        if (frame % 60 === 0) {
          logMemoryUsage("Memory check during animation");
        }
        frame += 1;
      });
    };

    const cleanUp = (mindarThree: MindARThree) => {
      window.removeEventListener(
        "resize",
        mindarThree._resize.bind(mindarThree),
      );
      mindarThree.stop();

      // 씬 정리
      mindarThree.scene.clear();
      mindarThree.cssScene.clear();

      // 렌더러 정리
      mindarThree.renderer.dispose();

      // 앵커와 페이스 메쉬 배열 초기화
      mindarThree.anchors = [];
      mindarThree.faceMeshes = [];

      const video = containerRef.current?.querySelector("video");
      if (video) {
        // console.log("비디오 제거");
        video.pause();
        video.srcObject = null;
      }
      const mindarElements = document.querySelectorAll("[class^='mindar-']");
      mindarElements.forEach(element => {
        element.remove();
      });

      const script = document.querySelector(
        "script[src='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm/vision_wasm_internal.js']",
      );
      if (script) {
        script.remove();
      }

      // 메모리 사용량을 주기적으로 로그로 출력
      const memoryLogInterval = setInterval(() => {
        logMemoryUsage("Memory check");
      }, 60000); // 1분 간격으로 체크

      return () => {
        clearInterval(memoryLogInterval);
      };
    };

    setup();

    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      scene.clear();

      if (avatar) {
        avatar.disposeResources();
      }
      cleanUp(mindarThree);
    };
  }, [avatarName]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-[320px] h-[240px] md:w-[400px] md:h-[300px]"
      >
        {isARLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default ARComponent;
