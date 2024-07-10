"use client";
import React, { useEffect, useState } from "react";
import Friend from "./Friend";
import Chat from "./Chat";
import { commonSocketState, onlineListState } from "@/app/store/commonSocket";
import { newMessageSenderState, messageAlarmState } from "@/app/store/chat";
import { useRecoilState, useRecoilValue } from "recoil";

interface Friend {
  friend: string;
  chatRoomId: string;
}

interface FriendListPros {
  friendsList: Friend[];
}

const FriendList: React.FC<FriendListPros> = ({ friendsList }) => {
  const commonSocket = useRecoilValue(commonSocketState);
  const [onlineList, setOnlineList] = useRecoilState(onlineListState);
  const [newMessageSenders, setNewMessageSenders] = useRecoilState(
    newMessageSenderState,
  );
  const [, setmessageAlarm] = useRecoilState(messageAlarmState);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);

  const toggleChat = (friend: Friend) => {
    if (!isChatVisible) {
      const updateSenders = newMessageSenders.filter(
        p => p !== friend.chatRoomId,
      );
      if (updateSenders.length === 0) {
        setmessageAlarm(false);
      }
      sessionStorage.setItem("messageSenders", JSON.stringify(updateSenders));
      setNewMessageSenders(updateSenders);
    }

    setSelectedFriend(friend);
    setIsChatVisible(prev => {
      if (prev === true) {
        console.log("closeChat: ", selectedFriend?.chatRoomId);
        commonSocket?.emit("closeChat", {
          chatRoomdId: selectedFriend?.chatRoomId,
        });
      }
      return !prev;
    });
  };

  const closeChat = () => {
    if (commonSocket) {
      const chatRoomId = selectedFriend?.chatRoomId;
      console.log(chatRoomId);
      commonSocket.emit("closeChat", { chatRoomdId: chatRoomId });
    }
    setSelectedFriend(null);
    setIsChatVisible(false);
  };

  const checkFriendOnline = (friendNickName: string) => {
    return onlineList.includes(friendNickName);
  };

  const isNewMessageSender = (friend: Friend) => {
    if (newMessageSenders.find(el => el === friend.chatRoomId)) {
      console.log(friend.friend, " 알람 보냄");
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (commonSocket) {
      commonSocket.emit("friendStat");
      commonSocket.on("friendStat", res => {
        const onlineList = sessionStorage.getItem("onlineFriends");
        if (!onlineList || onlineList.length === 0) {
          const newList: string[] = [];
          res.forEach((el: any) => {
            const key = Object.keys(el)[0];
            if (el[key]) {
              newList.push(key);
            }
          });
          console.log("friend state new List!!", newList);
          setOnlineList(newList);
          sessionStorage.setItem("onlineFriends", JSON.stringify(newList));
        } else {
          const prevList = JSON.parse(onlineList);
          res.forEach((el: any) => {
            const key = Object.keys(el)[0];
            if (el[key]) {
              prevList.push(key);
            }
          });
          const newList = Array.from(new Set(prevList)) as string[];
          console.log("update online list: ", newList);
          sessionStorage.setItem("onlineFriends", JSON.stringify(newList));
          setOnlineList(newList);
        }
      });
    }

    return () => {
      commonSocket?.off("friendStat");
    };
  }, []);

  return (
    <div
      className={`w-72 h-[35rem] overflow-auto ${friendsList && friendsList.length > 0 ? "scrollbar-custom" : "scrollbar-hide"}`}
    >
      {friendsList.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-400 text-xl">아직 친구가 없어요😓</p>
        </div>
      ) : (
        friendsList.map((friend, index) => (
          <div key={index} className="relative cursor-pointer">
            <Friend
              friend={friend}
              onChat={() => toggleChat(friend)}
              isOnline={checkFriendOnline(friend.friend)}
              isNewMessageSender={isNewMessageSender(friend)}
            />
          </div>
        ))
      )}
      {isChatVisible && selectedFriend && (
        <div className="w-full absolute top-[250px] left-[-330px] bottom-0 bg-white shadow-md rounded-lg z-11">
          <Chat friend={selectedFriend} onClose={closeChat} />
        </div>
      )}
    </div>
  );
};

export default FriendList;
