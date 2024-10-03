// ViewLive.js
import '../Css/ViewLive.css';
import React, { useRef, useEffect, useState } from 'react';
import { useData } from './DataContext';
function ViewLive() {
  const { comments, gifts, totalGifts, totalCoins } = useData();
  const commentBoxRef = useRef(null);
  const giftBoxRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [scrollTimer, setScrollTimer] = useState(null);
  const videoRef = useRef(null);

  const scrollToBottom = (ref) => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom(commentBoxRef);
      scrollToBottom(giftBoxRef);
    }
  }, [comments, gifts, isAutoScroll]);

  const handleMouseEnter = () => {
    setIsAutoScroll(false);
    clearTimeout(scrollTimer);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => {
      setIsAutoScroll(true);
    }, 5000);
    setScrollTimer(timer);
  };

  useEffect(() => {
    const findAndSetOBS = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const obsCamera = devices.find(device => device.label.includes("OBS Virtual Camera"));
        if (obsCamera) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: obsCamera.deviceId } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } else {
          console.error('OBS Virtual Camera not found');
        }
      } catch (err) {
        console.error('Error accessing video stream:', err);
      }
    };

    findAndSetOBS();
  }, []);

  return (
    <div className="App">
      <div className="row">
        <div className="content-container">
          <div className="column">
            <h1>COMMENTS</h1>
            {comments.length > 0 ? (
              <div 
                className="comment-box scrollable" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                ref={commentBoxRef}
              >
                {comments.map((comment, index) => (
                  <p key={index}>
                    {comment.data.profilePictureUrl && (
                      <img 
                        src={comment.data.profilePictureUrl} 
                        alt="Profile" 
                        className="profile-picture" 
                      />
                    )}
                    <strong>{comment.data.nickname}: </strong>
                    <strong className="comment-descreption">{comment.data.comment}</strong>
                  </p>
                ))}
              </div>
            ) : (
              <p>ANGEL_LIVE_CHAT</p>
            )}
          </div>

          <div className="column">
            <h1>GIFTS</h1>
            {gifts.length > 0 ? (
              <div 
                className="gift-box scrollable" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                ref={giftBoxRef}
              >
                {gifts.map((gift, index) => (
                  <p key={index}>
                    <strong className="user-name">{gift.data.nickname}</strong> Đã Gửi:
                    <strong className="gift-name"> {gift.data.giftName} </strong>
                    {gift.data.giftPictureUrl && (
                      <img 
                        src={gift.data.giftPictureUrl} 
                        alt={gift.data.giftName} 
                        className="gift-picture"
                      />
                    )}
                    <span className="gift-count"> x {gift.data.repeatCount}</span> 
                    <strong className="gift-diamond"> = {gift.data.diamondCount * gift.data.repeatCount} Xu</strong>
                  </p>
                ))}
              </div>
            ) : (
              <p>ANGEL_LIVE_GIFT</p>
            )}
          </div>
        </div>
        <div className="content-container">
          <div className="column">
            <h1>TOTAL GIFTS 
              <img className="imageCoin" src="/images.png" alt="Coin Logo" /> 
              <p className="totalCoins">{totalCoins}</p>
            </h1>
            {totalGifts.length > 0 ? (
              <div className="total-gifts-box scrollable">
                {totalGifts.map((gift, index) => (
                  <p key={index}>
                    <strong className="gift-name">{gift.giftName} </strong>
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
            ) : (
              <p>No total gifts recorded yet.</p>
            )}
          </div>

          <div className="column">
            <h1>VIEW OBS</h1>
            <div className="row">
              <video
                className="video-obs"
                ref={videoRef}
                preload="none"
                controls
                autoPlay playsInline
              ></video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewLive;
