import React from 'react';
import { Menu } from 'antd';
import { VideoCameraOutlined, YoutubeOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';
import '../Css/SideBar.css'
const { Item } = Menu;

const MenuSidebar = ({ selected, setSelected }) => {
  return (
    <div className="sidebar">
      <Menu
        mode="inline"
        selectedKeys={[selected]}
        onClick={(e) => setSelected(e.key)}
        style={{ height: '100%', fontSize: '18px' }} // Tăng kích thước chữ ở đây
      >
        <Item key="liveView" icon={<VideoCameraOutlined style={{ fontSize: '24px' }} />}>
          Live View
        </Item>
        <Item key="youtube" icon={<YoutubeOutlined style={{ fontSize: '24px' }} />}>
          YouTube
        </Item>
        <Item key="userCoin" icon={<UserOutlined style={{ fontSize: '24px' }} />}>
          User Coin Total
        </Item>
      </Menu>
    </div>
  );
};

export default MenuSidebar;

