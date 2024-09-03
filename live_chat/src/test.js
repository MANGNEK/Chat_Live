import './App.css';
import React, {  useState, useEffect, useRef } from 'react';

function App() {
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const commentBoxRef = useRef(null);
  const giftBoxRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [totalCoin, setTotalCoin]= useState([]);
  const [totalGifts, setTotalGifts] = useState([]);

  useEffect(() => {
    if (isAutoScroll) {
      commentBoxRef.current.scrollTop = commentBoxRef.current.scrollHeight;
      giftBoxRef.current.scrollTop = giftBoxRef.current.scrollHeight;
    }
  


    const socket = new WebSocket('ws://localhost:21213/');
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };
    socket.onmessage = (event) => {
      console.log('Data received:', event.data);
      const receivedData = JSON.parse(event.data); // Giả sử data là JSON
      handleData(receivedData);
    };
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    return () => {
      socket.close();
    };

    
  }, [comments, gifts, isAutoScroll]);

  const handleMouseEnter = () => {
    setIsAutoScroll(false);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsAutoScroll(true);
    }, 5000); // Tự động cuộn sau 5 giây không có chuột trong ô
  };

  const updateTotalGifts = (giftName, repeatCount, giftPictureUrl) => {
    setTotalGifts(prevTotalGifts => {
      const existingGift = prevTotalGifts.find(gift => gift.giftName === giftName);
  
      if (existingGift) {
        // Cập nhật số lượng quà tặng nếu đã tồn tại trong danh sách
        return prevTotalGifts.map(gift =>
          gift.giftName === giftName
            ? { ...gift, count: gift.count + repeatCount }
            : gift
        );
      } else {
        // Thêm mới quà tặng vào danh sách nếu chưa tồn tại
        return [
          ...prevTotalGifts,
          {
            giftName,
            count: repeatCount,
            giftPictureUrl,
          }
        ];
      }
    });
  };

  const handleData = (receivedData) => {
    if (receivedData.event === "gift") {
      if (receivedData.data.gift.repeat_end === 1 && receivedData.data.gift.gift_type === 1) {
        setGifts(prevGifts => [...prevGifts, receivedData]);
        updateTotalGifts(
          receivedData.data.giftName,
          receivedData.data.repeatCount,
          receivedData.data.giftPictureUrl
        );
      }if (receivedData.data.gift.gift_type !== 1) {
        setGifts(prevGifts => [...prevGifts, receivedData]);
        updateTotalGifts(
          receivedData.data.giftName,
          receivedData.data.repeatCount,
          receivedData.data.giftPictureUrl
        );
      } 
    }
    if (receivedData.event === "chat") {
      setComments(prevComments => [...prevComments, receivedData]);
    }
  };

  return (
    <div className="App">
      <div className="content-container">
        <div className="column">
          <h2>Comments</h2>
          <div
            className="comment-box scrollable"
            ref={commentBoxRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {comments.slice(-20).map((comment, index) => (
              <p key={index}>
                <strong className="user-name">{comment.data.nickname}:</strong>
                <strong className="comment-description">{comment.data.comment}</strong>
              </p>
            ))}
          </div>
        </div>
        <div className="column">
          <h2>Gifts</h2>
          <div
            className="gift-box scrollable"
            ref={giftBoxRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {gifts.slice(-20).map((gift, index) => (
              <p key={index}>
                <strong className="gift-name">{gift.giftName}</strong>
                {gift.giftPictureUrl && (
                  <img
                    src={gift.giftPictureUrl}
                    alt={gift.giftName}
                    className="gift-picture"
                  />
                )}
                <strong> x {gift.count}</strong>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;