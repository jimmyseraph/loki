import { PageContainer, ProLayout, ProSettings } from '@ant-design/pro-layout';
import { Avatar, message, Popover, Space } from 'antd';
import React from 'react';
import menuProps from './MenuProps';
import Logo from '@/loki_pure.jpg';
import { Link } from 'umi';
import { UserOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { api, SignOffReply } from '@/api/Api4Config';
import { useLazyQuery } from '@apollo/client';

const MainLayout: React.FC = (props: any) => {
  const [pathname, setPathname] = React.useState(window.location.pathname);
  const [, { refetch: logout }] = useLazyQuery<{ SignOff: SignOffReply }>(
    api.logout,
  );
  const [settings, setSettings] = React.useState<
    Partial<ProSettings> | undefined
  >({
    title: 'Loki',
    navTheme: 'light',
  });

  const handleLogout = () => {
    logout()
      .then(() => {
        localStorage.removeItem('token');
        history.push('/login');
      })
      .catch((err) => {
        message.error(err.message);
      });
  };
  return (
    <ProLayout
      {...menuProps}
      location={{
        pathname: window.location.pathname,
      }}
      logo={Logo}
      fixSiderbar
      menuItemRender={(item, dom: any) => (
        <Link
          to={item.path as string}
          onClick={() => {
            // setPathname(item.path as string);
            // console.log(item.path, pathname);
          }}
        >
          {dom}
        </Link>
      )}
      rightContentRender={() => (
        <Popover content={<a onClick={handleLogout}>退出登录</a>}>
          <Space>
            <Avatar shape="square" size="small" icon={<UserOutlined />} />
            {localStorage.getItem('name')}
          </Space>
        </Popover>
      )}
      {...settings}
    >
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  );
};

export default MainLayout;
