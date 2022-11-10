import { PageContainer, ProLayout, ProSettings } from '@ant-design/pro-layout';
import { Avatar, Button, message, Popover, Space } from 'antd';
import React from 'react';
import menuProps from './MenuProps';
import Logo from '@/loki_pure.jpg';
import { Link } from 'umi';
// import { UserOutlined } from '@ant-design/icons';
import avatar from '@/avatar.jpg';
import { history } from 'umi';
import { api, SignOffReply } from '@/api/Api4Config';
import { useLazyQuery } from '@apollo/client';
import { clearUserInfo } from '@/utils/Storage';

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
        clearUserInfo();
        history.push('');
      })
      .catch((err) => {
        message.error(err.message);
        clearUserInfo();
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
      rightContentRender={() => {
        if (localStorage.getItem('token') && localStorage.getItem('name')) {
          return (
            <Popover content={<a onClick={handleLogout}>退出登录</a>}>
              <Space>
                <Avatar shape="square" size="small" src={avatar} />
                {localStorage.getItem('name')}
              </Space>
            </Popover>
          );
        } else {
          return (
            <Button type="link" onClick={() => history.push('/login')}>
              Sign In
            </Button>
          );
        }
      }}
      {...settings}
    >
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  );
};

export default MainLayout;
