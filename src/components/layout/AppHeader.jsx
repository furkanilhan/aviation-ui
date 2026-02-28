import { Layout, Button, Typography, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#001529',
      padding: '0 24px'
    }}>
      <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
        ✈ Aviation App
      </Typography.Title>
      <Space>
        <Text style={{ color: 'white' }}>
          {user?.username} ({user?.role})
        </Text>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          type="text"
          style={{ color: 'white' }}
        >
          Logout
        </Button>
      </Space>
    </Header>
  );
};

export default AppHeader;