"use client";

import { atom } from "recoil";

// 현재 열려있는 채팅방 정보
export const chatRoomState = atom<string | null>({
  key: "chatRoomState",
  default: null,
  dangerouslyAllowMutability: true,
});

// 나한테 채팅 알람 보낸 사람 정보
export const newMessageSenderState = atom<string[]>({
  key: "newMessageSenderState",
  default: [],
});

// 안 읽은 메시지가 있는지 여부
export const messageAlarmState = atom<boolean>({
  key: "messageAlarmState",
  default: false,
});
