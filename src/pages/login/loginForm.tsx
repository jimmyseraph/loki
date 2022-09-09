import './login.css';
import Logo from '@/loki_small.jpg';
import { Form, Input, Space, Button, message } from 'antd';
import { history } from 'umi';
// import Request from '@/utils/Request';
import { useLazyQuery } from '@apollo/client';
import { api, SignOnReply, SignOnVariables } from '@/api/Api4Config';
// import React from 'react';

function LoginForm() {
  const [form] = Form.useForm();

  const [login] = useLazyQuery<{ SignOn: SignOnReply }, SignOnVariables>(
    api.login,
  );

  const handleSubmit = () => {
    form.submit();
  };

  const handleFinish = () => {
    const user = form.getFieldValue('user');
    const password = form.getFieldValue('password');
    login({ variables: { user, password } })
      .then((res) => {
        console.log(res.data);
        if (res.error) {
          message.error(res.error.message);
          return;
        }
        message.success('登录成功');
        localStorage.setItem('token', res.data?.SignOn.token as string);
        localStorage.setItem('name', res.data?.SignOn.name as string);
        localStorage.setItem('id', res.data?.SignOn.id as string);
        localStorage.setItem('email', res.data?.SignOn.email as string);
        localStorage.setItem('mobile', res.data?.SignOn.mobile as string);
        history.push('/');
      })
      .catch((err) => {
        message.error(err.message);
      });
    // Request({
    //     url: '/api/user/login',
    //     method: 'post',
    //     data: {
    //         user,
    //         password,
    //     },
    // }, (res) => {
    //     localStorage.setItem('token', res.data.data.token);
    //     localStorage.setItem('name', res.data.data.name);
    //     localStorage.setItem('id', res.data.data.id);
    //     localStorage.setItem('email', res.data.data.email);
    //     localStorage.setItem('mobile', res.data.data.mobile);
    //     history.push({
    //         pathname: '/',
    //     });
    // });
  };

  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div className="login-page">
      <div className="login-logo">
        <img src={Logo} width={'90px'} height={'90px'} />
      </div>
      <div className="login-card-layout">
        <div className="login-card">
          <Form
            form={form}
            name="login_form"
            autoComplete="off"
            style={{ marginTop: 40 }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            onFinish={handleFinish}
          >
            <Form.Item
              label="User"
              name="user"
              rules={[{ required: true, message: 'Email不能为空' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '密码不能为空' }]}
            >
              <Input type="password" />
            </Form.Item>
            <div style={{ marginBottom: '20px' }}>
              <Space style={{ marginLeft: 170 }} size="large">
                <Button type="primary" onClick={handleSubmit}>
                  提交
                </Button>
                <Button type="default" onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
