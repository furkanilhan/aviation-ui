import { Menu } from 'antd';
import {
  EnvironmentOutlined,
  SwapOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppSidebar = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    ...(isAdmin() ? [
      {
        key: '/locations',
        icon: <EnvironmentOutlined />,
        label: 'Locations',
      },
      {
        key: '/transportations',
        icon: <SwapOutlined />,
        label: 'Transportations',
      },
    ] : []),
    {
      key: '/routes',
      icon: <CompassOutlined />,
      label: 'Routes',
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default AppSidebar;