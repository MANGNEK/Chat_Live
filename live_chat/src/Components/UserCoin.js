import { useData } from './DataContext';
import { useEffect } from 'react';

function UserCoinview() {
  const { userCoin,setUserCoin } = useData(); // Lấy hàm reset từ context
  useEffect(() => {
    console.log("UserCoinview re-rendered with userCoin:", userCoin);
  }, [userCoin]);
  
  const resetUserCoin = () => {
    setUserCoin([]); // Cập nhật lại state userCoin thành mảng rỗng
  };
  return (
    <div className="column-1">
      <div className="user-rank-header">
        <h1>User Rank</h1>
        <button onClick={resetUserCoin} className="reset-button">Reset</button> {/* Nút reset */}
      </div>
      
      {userCoin.length > 0 ? (
        <div className="comment-box scrollable">
          {userCoin.map((user, index) => (
            <p key={index}>
              {user.urlPicture && (
                <img 
                  src={user.urlPicture} 
                  alt="Profile" 
                  className="profile-picture" 
                />
              )}
              <strong>{user.name}: </strong>
              <strong className="comment-description">{user.coin}</strong>
            </p>
          ))}
        </div>
      ) : (
        <p>No data</p>
      )}
    </div>
  );
}

export default UserCoinview;
