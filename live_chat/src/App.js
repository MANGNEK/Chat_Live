import './App.css';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [totalGifts, setTotalGifts] = useState([]);
  const commentBoxRef = useRef(null);
  const giftBoxRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [scrollTimer, setScrollTimer] = useState(null);
  const [totalCoins, setTotalCoins] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:21213/');
    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {

      const receivedData = JSON.parse(event.data);
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
  }, []);

  const updateTotalGifts = (giftName, repeatCount, giftPictureUrl) => {
    setTotalGifts(prevTotalGifts => {
      const existingGift = prevTotalGifts.find(gift => gift.giftName === giftName);
  
      if (existingGift) {
        return prevTotalGifts.map(gift =>
          gift.giftName === giftName
            ? { ...gift, count: gift.count + repeatCount }
            : gift
        );
      } else {
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

        setTotalCoins(prevTotalCoins => 
        prevTotalCoins + ((receivedData.data.diamondCount)*(receivedData.data.repeatCount)));

        updateTotalGifts(
          receivedData.data.giftName,
          receivedData.data.repeatCount,
          receivedData.data.giftPictureUrl
        );
      } else if (receivedData.data.gift.gift_type !== 1) {
        setGifts(prevGifts => [...prevGifts, receivedData]);

        setTotalCoins(prevTotalCoins => prevTotalCoins + receivedData.data.diamondCount);

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
    if (videoRef.current) {
      const handleStream = async () => {
        // Dừng luồng cũ trước khi tải luồng mới
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject;
          oldStream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
  
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();  // Chờ video phát
        } catch (err) {
          console.error('Error accessing video stream:', err);
        }
      };
  
      handleStream();
    }
  }, [selectedCamera]);
  

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        console.log('Video access granted');
        // Nếu bạn có quyền truy cập video, hãy không làm gì cả
      })
      .catch(err => {
        console.error('Video access denied:', err);
      });
  }, []);
  
  useEffect(() => {
    // Lấy danh sách các thiết bị video (camera)
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        // Chọn camera đầu tiên mặc định
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      })
      .catch(err => console.error('Error enumerating devices:', err));
  }, []);

  useEffect(() => {
    let isMounted = true;
  
    const updateStream = async () => {
      if (!isMounted || !videoRef.current) return;
  
      // Dừng stream cũ nếu có
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        oldStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCamera } });
        if (isMounted) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing video stream:', err);
      }
    };
  
    updateStream();
  
    return () => {
      isMounted = false;
    };
  }, [selectedCamera]);
  
  const handleCameraChange = async (event) => {
    const newCameraId = event.target.value;
    setSelectedCamera(newCameraId);
  
    if (videoRef.current) {
      // Dừng stream hiện tại trước khi chuyển sang stream mới
      if (videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject;
        oldStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: newCameraId } });
        videoRef.current.srcObject = stream;
        await videoRef.current.play();  // Chờ video bắt đầu phát
      } catch (err) {
        console.error('Error accessing video stream:', err);
      }
    }
  };

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
                {comments.slice(0).map((comment, index) => (
                  <p key={index}>
                    {comment.data.profilePictureUrl && (
                      <img 
                        src={comment.data.profilePictureUrl} 
                        alt="Profile" 
                        className="profile-picture" 
                      />
                    )}
                    <strong className="">{comment.data.nickname} : </strong>
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
                {gifts.slice(0).map((gift, index) => (
                  <p key={index}>
                    <strong className="user-name">{gift.data.nickname}</strong> Đã Gửi :
                    <strong className="gift-name"> {gift.data.giftName} </strong> 
                    {gift.data.giftPictureUrl && (
                      <img 
                        src={gift.data.giftPictureUrl} 
                        alt={gift.data.giftName} 
                        className="gift-picture"
                      />
                    )}
                    <span className="gift-count"> x {gift.data.repeatCount}</span> 
                    <strong className="gift-diamond"> = {(gift.data.diamondCount)*(gift.data.repeatCount)} Xu</strong>
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
               <img className="imageCoin"
                  src="./images.png" 
                  alt="Coin Logo" 
                /> 
                <p className="totalCoins">{totalCoins}</p>
            </h1>
            {totalGifts.length > 0 ? (
              <div className="total-gifts-box scrollable">
                {totalGifts.slice(0).map((gift, index) => (
                  <p key={index}>
                    <strong className="gift-name">{gift.giftName} </strong>
                    <strong>
                      {gift.giftPictureUrl && (
                        <img 
                          src={gift.giftPictureUrl} 
                          alt={gift.giftName} 
                          className="gift-picture"
                        />
                      )}
                    </strong>
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
              <h2>Pick Camera</h2>
              <select onChange={handleCameraChange} value={selectedCamera}>
                {cameras.map((camera, index) => (
                  <option key={index} value={camera.deviceId}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
              <video
                className="video-obs"
                ref={videoRef}
                preload="none"
                controls
              ></video>
  </div>
</div>


        </div>
      </div>
    </div>
  );
}

export default App;
