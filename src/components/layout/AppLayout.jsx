import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

const { Content, Sider } = Layout;

const AppLayout = () => {
  return (
    <Layout style={{ overflow: 'auto' }}>
      <AppHeader />
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <AppSidebar />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{
            background: '#fff',
            padding: 24,
            borderRadius: 8,
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;