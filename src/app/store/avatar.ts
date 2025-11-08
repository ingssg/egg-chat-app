"use client";

import { atom } from "recoil";

export const avatarState = atom<string | null>({
  key: "avatarState",
  default: "rabbit",
});
