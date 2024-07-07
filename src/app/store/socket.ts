"use client";

import { atom } from "recoil";
import { Socket } from "socket.io-client";

export const meetingSocketState = atom<Socket | null>({
  key: "meetingSocketState",
  default: null,
  dangerouslyAllowMutability: true,
});

export const isChosenState = atom<boolean>({
  key: "isChosenState",
  default: false,
});
