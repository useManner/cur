import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { loginAsync } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const onFinish = async (values: { username: string; password: string; captcha: string }) => {
    setLoading(true);
    
    try {
      await dispatch(loginAsync({
        username: values.username,
        password: values.password
      })).unwrap();
      message.success('登录成功！');
    } catch (error: any) {
      message.error(error || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1890FF',
            marginBottom: '8px',
          }}>
            小程序管理系统
          </div>
          <div style={{ color: '#666666', fontSize: '14px' }}>
            请输入您的登录凭据
          </div>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#BFBFBF' }} />}
              placeholder="用户名/邮箱"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#BFBFBF' }} />}
              placeholder="密码"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[{ required: true, message: '请输入验证码!' }]}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <Input
                prefix={<SafetyCertificateOutlined style={{ color: '#BFBFBF' }} />}
                placeholder="验证码"
                style={{ flex: 1, borderRadius: '6px' }}
              />
              <div style={{
                width: '120px',
                height: '40px',
                background: '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1890FF',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: '1px solid #D9D9D9',
              }}>
                A8K9
              </div>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '14px',
          color: '#999999',
        }}>
          <button type="button" style={{ color: '#1890FF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => message.info('忘记密码功能开发中...')}>忘记密码？</button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
