import React, { useState } from 'react';
import {
  Card,
  Layout,
  Menu,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  message,
  Divider,
  Row,
  Col,
  Space,
  Typography,
  Alert,
} from 'antd';
import {
  SettingOutlined,
  SecurityScanOutlined,
  BellOutlined,
  DatabaseOutlined,
  BgColorsOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setTheme, setLanguage } from '../store/slices/systemSlice';

const { Sider, Content: AntContent } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const SystemSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, language } = useSelector((state: RootState) => state.system);
  const [selectedMenu, setSelectedMenu] = useState('basic');
  const [form] = Form.useForm();

  // 设置菜单项
  const menuItems = [
    {
      key: 'basic',
      icon: <SettingOutlined />,
      label: '基础设置',
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: '安全设置',
    },
    {
      key: 'notification',
      icon: <BellOutlined />,
      label: '通知设置',
    },
    {
      key: 'backup',
      icon: <DatabaseOutlined />,
      label: '备份设置',
    },
    {
      key: 'theme',
      icon: <BgColorsOutlined />,
      label: '主题设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedMenu(key);
  };

  const handleSave = () => {
    message.success('设置保存成功');
  };

  // 基础设置表单
  const BasicSettings = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        systemName: '小程序管理系统',
        systemLogo: '',
        contactEmail: 'admin@example.com',
        contactPhone: '400-123-4567',
        systemDescription: '这是一个功能完善的小程序后台管理系统',
      }}
    >
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="系统信息" style={{ marginBottom: '24px' }}>
            <Form.Item
              label="系统名称"
              name="systemName"
              rules={[{ required: true, message: '请输入系统名称' }]}
            >
              <Input placeholder="请输入系统名称" />
            </Form.Item>
            
            <Form.Item
              label="系统Logo"
              name="systemLogo"
            >
              <Upload
                name="logo"
                listType="picture-card"
                className="logo-uploader"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传Logo</div>
                </div>
              </Upload>
            </Form.Item>
            
            <Form.Item
              label="系统描述"
              name="systemDescription"
            >
              <TextArea rows={4} placeholder="请输入系统描述" />
            </Form.Item>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title="联系信息">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="联系邮箱"
                  name="contactEmail"
                  rules={[
                    { required: true, message: '请输入联系邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' },
                  ]}
                >
                  <Input placeholder="请输入联系邮箱" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="联系电话"
                  name="contactPhone"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  );

  // 安全设置表单
  const SecuritySettings = () => (
    <Form layout="vertical">
      <Card title="密码策略" style={{ marginBottom: '24px' }}>
        <Form.Item label="密码最小长度">
          <Input type="number" defaultValue={8} addonAfter="位" />
        </Form.Item>
        
        <Form.Item label="密码复杂度要求">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>必须包含大写字母</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>必须包含小写字母</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>必须包含数字</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>必须包含特殊字符</span>
              <Switch />
            </div>
          </Space>
        </Form.Item>
        
        <Form.Item label="密码有效期">
          <Select defaultValue="90" style={{ width: 200 }}>
            <Option value="30">30天</Option>
            <Option value="60">60天</Option>
            <Option value="90">90天</Option>
            <Option value="180">180天</Option>
            <Option value="365">365天</Option>
            <Option value="never">永不过期</Option>
          </Select>
        </Form.Item>
      </Card>
      
      <Card title="登录安全" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>启用验证码登录</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>启用短信验证码</span>
            <Switch />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>启用双因素认证</span>
            <Switch />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>记住登录状态</span>
            <Switch defaultChecked />
          </div>
        </Space>
        
        <Divider />
        
        <Form.Item label="IP白名单">
          <TextArea
            rows={4}
            placeholder="请输入允许访问的IP地址，每行一个"
            defaultValue="192.168.1.0/24&#10;10.0.0.0/8"
          />
        </Form.Item>
      </Card>
      
      <Card title="会话管理">
        <Form.Item label="会话超时时间">
          <Select defaultValue="30" style={{ width: 200 }}>
            <Option value="15">15分钟</Option>
            <Option value="30">30分钟</Option>
            <Option value="60">1小时</Option>
            <Option value="120">2小时</Option>
            <Option value="480">8小时</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="最大并发会话数">
          <Input type="number" defaultValue={3} addonAfter="个" />
        </Form.Item>
      </Card>
    </Form>
  );

  // 通知设置表单
  const NotificationSettings = () => (
    <Form layout="vertical">
      <Card title="邮件通知" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="SMTP服务器">
              <Input defaultValue="smtp.example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="端口">
              <Input type="number" defaultValue={587} />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="发送邮箱">
              <Input defaultValue="noreply@example.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="邮箱密码">
              <Input.Password defaultValue="password123" />
            </Form.Item>
          </Col>
        </Row>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>启用SSL/TLS</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>发送系统通知邮件</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>发送用户注册通知</span>
            <Switch />
          </div>
        </Space>
      </Card>
      
      <Card title="短信通知">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="短信服务商">
              <Select defaultValue="aliyun">
                <Option value="aliyun">阿里云</Option>
                <Option value="tencent">腾讯云</Option>
                <Option value="huawei">华为云</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Access Key">
              <Input.Password defaultValue="your-access-key" />
            </Form.Item>
          </Col>
        </Row>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>发送登录验证码</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>发送密码重置短信</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>发送重要通知短信</span>
            <Switch />
          </div>
        </Space>
      </Card>
    </Form>
  );

  // 备份设置表单
  const BackupSettings = () => (
    <Form layout="vertical">
      <Card title="自动备份" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>启用自动备份</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>备份数据库</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>备份文件系统</span>
            <Switch />
          </div>
        </Space>
        
        <Divider />
        
        <Form.Item label="备份频率">
          <Select defaultValue="daily" style={{ width: 200 }}>
            <Option value="hourly">每小时</Option>
            <Option value="daily">每天</Option>
            <Option value="weekly">每周</Option>
            <Option value="monthly">每月</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="备份时间">
          <Select defaultValue="02:00" style={{ width: 200 }}>
            <Option value="00:00">00:00</Option>
            <Option value="02:00">02:00</Option>
            <Option value="04:00">04:00</Option>
            <Option value="06:00">06:00</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="备份保留天数">
          <Input type="number" defaultValue={30} addonAfter="天" />
        </Form.Item>
        
        <Form.Item label="备份存储路径">
          <Input defaultValue="/backup" />
        </Form.Item>
      </Card>
      
      <Card title="手动备份">
        <Space>
          <Button type="primary" icon={<DatabaseOutlined />}>
            立即备份数据库
          </Button>
          <Button icon={<UploadOutlined />}>
            备份文件系统
          </Button>
          <Button>
            恢复备份
          </Button>
        </Space>
        
        <Alert
          message="备份提示"
          description="建议定期进行数据备份，确保数据安全。备份文件将保存在指定目录中。"
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Card>
    </Form>
  );

  // 主题设置表单
  const ThemeSettings = () => (
    <Form layout="vertical">
      <Card title="界面主题" style={{ marginBottom: '24px' }}>
        <Form.Item label="主题模式">
          <Select
            value={theme}
            onChange={(value) => dispatch(setTheme(value))}
            style={{ width: 200 }}
          >
            <Option value="light">浅色主题</Option>
            <Option value="dark">深色主题</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="语言设置">
          <Select
            value={language}
            onChange={(value) => dispatch(setLanguage(value))}
            style={{ width: 200 }}
          >
            <Option value="zh-CN">简体中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </Form.Item>
        
        <Form.Item label="主色调">
          <Space>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1890FF',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '2px solid #1890FF',
              }}
              title="默认蓝色"
            />
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#52C41A',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              title="绿色"
            />
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FA8C16',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              title="橙色"
            />
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#722ED1',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '2px solid transparent',
              }}
              title="紫色"
            />
          </Space>
        </Form.Item>
      </Card>
      
      <Card title="界面设置">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>显示面包屑导航</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>显示页面加载动画</span>
            <Switch defaultChecked />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>紧凑模式</span>
            <Switch />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>固定侧边栏</span>
            <Switch />
          </div>
        </Space>
      </Card>
    </Form>
  );

  const renderContent = () => {
    switch (selectedMenu) {
      case 'basic':
        return <BasicSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notification':
        return <NotificationSettings />;
      case 'backup':
        return <BackupSettings />;
      case 'theme':
        return <ThemeSettings />;
      default:
        return <BasicSettings />;
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>系统设置</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666666' }}>
          管理系统配置和参数设置
        </p>
      </div>

      <Layout style={{ background: '#FFFFFF', borderRadius: '6px', overflow: 'hidden' }}>
        <Sider
          width={200}
          style={{
            background: '#FAFAFA',
            borderRight: '1px solid #F0F0F0',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #F0F0F0' }}>
            <Title level={5} style={{ margin: 0 }}>设置分类</Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              marginTop: '16px',
            }}
          />
        </Sider>

        <AntContent style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {menuItems.find(item => item.key === selectedMenu)?.label}
              </Title>
              <Text type="secondary">
                {selectedMenu === 'basic' && '配置系统基本信息和联系方式'}
                {selectedMenu === 'security' && '设置系统安全策略和访问控制'}
                {selectedMenu === 'notification' && '配置邮件和短信通知服务'}
                {selectedMenu === 'backup' && '设置数据备份和恢复策略'}
                {selectedMenu === 'theme' && '自定义系统界面主题和样式'}
              </Text>
            </div>
            
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存设置
            </Button>
          </div>

          {renderContent()}
        </AntContent>
      </Layout>
    </div>
  );
};

export default SystemSettings;
