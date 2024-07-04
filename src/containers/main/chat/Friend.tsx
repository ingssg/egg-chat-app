"use client";
import { newMessageSenderState } from "@/app/store/chat";
import React from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { useRecoilValue } from "recoil";

interface Props {
  friend: {
    friend: string;
    chatRoomId: string;
  };
  onChat: () => void;
  isOnline: boolean;
}

const Friend: React.FC<Props> = ({ friend, onChat, isOnline }) => {
  const newMessageSenders = useRecoilValue(newMessageSenderState);
  console.log(friend.friend, ": ", isOnline ? "온라인" : "오프라인");
  return (
    <div
      className="flex justify-between items-center mb-1 mt-1 text-lg p-2 border-b border-gray-300"
      onClick={onChat}
    >
      <span>{friend.friend}</span>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <AiOutlineMessage className="w-7 h-7" />
          {newMessageSenders.length !== 0 &&
            newMessageSenders.find(el => el === friend.chatRoomId) && (
              <div className="absolute left-[-5px] top-[-5px] w-2 h-2 rounded-full bg-rose-500" />
            )}
        </div>
        {isOnline ? (
          <div className="w-5 h-5 rounded-full bg-green-300" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-300" />
        )}
      </div>
    </div>
  );
};

export default Friend;
