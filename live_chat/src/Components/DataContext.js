import React, { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [totalGifts, setTotalGifts] = useState([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [userCoin, setUserCoin] = useState([]);
  let socket;   
  let reconnectTimeout;
  useEffect(() => {
    // Hàm kết nối WebSocket và gán các sự kiện
    const connectWebSocket = () => {
      socket = new WebSocket('ws://localhost:21213/');
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        clearTimeout(reconnectTimeout);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        reconnectTimeout = setTimeout(connectWebSocket, 3000); // Thử kết nối lại sau 3 giây
      };

      socket.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        handleData(receivedData);
      };
    };

    // Hàm xử lý dữ liệu nhận được từ WebSocket
    const handleData = (receivedData) => {
      if (receivedData.event === "gift") {
        updateGiftsAndCoins(receivedData);
      }
      if (receivedData.event === "chat") {
        setComments(prevComments => [...prevComments, receivedData]);
      }
    };

    // Cập nhật quà và số coins
    const updateGiftsAndCoins = (receivedData) => {
      if(receivedData.data.gift.repeat_end === 1 && receivedData.data.gift.gift_type === 1){
        setGifts(prevGifts => [...prevGifts, receivedData]);
        const coins = receivedData.data.diamondCount * (receivedData.data.repeatCount);
        setTotalCoins(prevTotal => prevTotal + coins);
        updateTotalGifts(receivedData.data.giftName, receivedData.data.repeatCount, receivedData.data.giftPictureUrl);
        console.log('call type 1');
        updateUserCoinTotal(receivedData.data.profilePictureUrl,coins,receivedData.data.nickname);
      }else if(receivedData.data.gift.gift_type !== 1){

            setGifts(prevGifts => [...prevGifts, receivedData]);
            const coins = receivedData.data.diamondCount 
            setTotalCoins(prevTotal => prevTotal + coins);
            updateTotalGifts(receivedData.data.giftName, receivedData.data.repeatCount, receivedData.data.giftPictureUrl);
            console.log('call type other');
            updateUserCoinTotal(receivedData.data.profilePictureUrl,coins,receivedData.data.nickname);
          }       
    };

    //cập nhật usercoinTotal
    const updateUserCoinTotal = (urlPicture, Coin, Name) => {
      console.log('call updpate coin User');
      setUserCoin(prevUserCoin => {
        let userIndex = prevUserCoin.findIndex(user => user.name === Name);
        if (userIndex === -1) {
          if (prevUserCoin.length < 20) {
            return [...prevUserCoin, { urlPicture, coin: Coin, name: Name }];
          } else {
            let minCoinIndex = prevUserCoin.reduce((minIndex, user, index) => 
              user.coin < prevUserCoin[minIndex].coin ? index : minIndex, 0);
            
            if (Coin > prevUserCoin[minCoinIndex].coin) {
              let newUserCoin = [...prevUserCoin];
              newUserCoin.splice(minCoinIndex, 1);
              newUserCoin.push({ urlPicture, coin: Coin, name: Name });
              return newUserCoin.sort((a, b) => b.coin - a.coin);
            } else {
              return prevUserCoin;
            }
          }
        } else {
          console.log('coin 1: ',prevUserCoin[userIndex].coin);
          let newUserCoin = [...prevUserCoin];
          newUserCoin[userIndex].coin += Coin;
          console.log('coin 2: ',prevUserCoin[userIndex].coin);
          return newUserCoin.sort((a, b) => b.coin - a.coin);
        }
      });
    };
    

    // Cập nhật tổng số quà tặng
    const updateTotalGifts = (giftName, repeatCount, giftPictureUrl) => {
      setTotalGifts(prevTotal => {
        const existingGift = prevTotal.find(gift => gift.giftName === giftName);
        if (existingGift) {
          return prevTotal.map(gift => 
            gift.giftName === giftName 
              ? { ...gift, count: gift.count + repeatCount }
              : gift
          );
        } else {
          return [...prevTotal, { giftName, count: repeatCount, giftPictureUrl }];
        }
      });
    };
    // Kết nối WebSocket khi component được mount
    connectWebSocket();

    return () => {
      socket.close(); // Đóng kết nối khi component unmount
    };
  }, []); // Chỉ chạy một lần khi component được mount

  return (
    <DataContext.Provider value={{ comments, gifts, totalGifts, totalCoins, userCoin,setUserCoin}}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
