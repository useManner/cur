import React, { useState } from 'react';
import {
  Card,
  Layout,
  Tree,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Upload,
  message,
  Popconfirm,
  Tooltip,
  Tabs,
  Image,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

const { Sider, Content: AntContent } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const ContentManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  // 分类树数据
  const categoryTreeData: DataNode[] = [
    {
      title: '首页内容',
      key: '1',
      icon: <FolderOpenOutlined />,
      children: [
        {
          title: '轮播图',
          key: '1-1',
          icon: <PictureOutlined />,
        },
        {
          title: '公告',
          key: '1-2',
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      title: '产品展示',
      key: '2',
      icon: <FolderOutlined />,
      children: [
        {
          title: '产品列表',
          key: '2-1',
          icon: <FileTextOutlined />,
        },
        {
          title: '产品详情',
          key: '2-2',
          icon: <FileTextOutlined />,
        },
      ],
    },
    {
      title: '新闻资讯',
      key: '3',
      icon: <FolderOutlined />,
      children: [
        {
          title: '公司新闻',
          key: '3-1',
          icon: <FileTextOutlined />,
        },
        {
          title: '行业动态',
          key: '3-2',
          icon: <FileTextOutlined />,
        },
      ],
    },
  ];

  // 模拟内容数据
  const mockContent = [
    {
      id: '1',
      title: '春季新品发布',
      type: 'image',
      category: '轮播图',
      status: 'published',
      author: '张三',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20',
      views: 1250,
      thumbnail: 'https://via.placeholder.com/150x100/1890FF/FFFFFF?text=轮播图1',
    },
    {
      id: '2',
      title: '系统维护通知',
      type: 'text',
      category: '公告',
      status: 'published',
      author: '李四',
      createdAt: '2024-01-19',
      updatedAt: '2024-01-19',
      views: 856,
      thumbnail: '',
    },
    {
      id: '3',
      title: '产品介绍视频',
      type: 'video',
      category: '产品列表',
      status: 'draft',
      author: '王五',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18',
      views: 0,
      thumbnail: 'https://via.placeholder.com/150x100/52C41A/FFFFFF?text=视频',
    },
  ];

  const handleCategorySelect = (selectedKeys: React.Key[]) => {
    setSelectedCategory(selectedKeys[0] as string);
  };

  const handleEdit = (record: any) => {
    setEditingContent(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    message.success('内容删除成功');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingContent) {
        // 编辑内容
        message.success('内容更新成功');
      } else {
        // 新增内容
        message.success('内容创建成功');
      }
      setIsModalVisible(false);
      setEditingContent(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingContent(null);
    form.resetFields();
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      published: { color: 'green', text: '已发布' },
      draft: { color: 'orange', text: '草稿' },
      archived: { color: 'gray', text: '已归档' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    const typeConfig = {
      text: { color: 'blue', text: '文本', icon: <FileTextOutlined /> },
      image: { color: 'green', text: '图片', icon: <PictureOutlined /> },
      video: { color: 'purple', text: '视频', icon: <VideoCameraOutlined /> },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns: ColumnsType<any> = [
    {
      title: '内容信息',
      key: 'contentInfo',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {record.thumbnail && (
            <Image
              width={60}
              height={40}
              src={record.thumbnail}
              style={{ borderRadius: '4px', objectFit: 'cover' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          )}
          <div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>{record.title}</div>
            <div style={{ fontSize: '12px', color: '#666666' }}>
              {getTypeTag(record.type)}
              <span style={{ marginLeft: '8px' }}>{record.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views) => (
        <span style={{ color: '#1890FF', fontWeight: '500' }}>{views.toLocaleString()}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个内容吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'list',
      label: '内容列表',
      children: (
        <Table
          columns={columns}
          dataSource={mockContent}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      ),
    },
    {
      key: 'media',
      label: '媒体库',
      children: (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Upload
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              listType="picture-card"
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} size="small" hoverable>
                <Image
                  src={`https://via.placeholder.com/150x100/1890FF/FFFFFF?text=图片${item}`}
                  style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
                  图片 {item}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>内容管理</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666666' }}>
          管理小程序的内容和媒体资源
        </p>
      </div>

      <Layout style={{ background: '#FFFFFF', borderRadius: '6px', overflow: 'hidden' }}>
        <Sider
          width={240}
          style={{
            background: '#FAFAFA',
            borderRight: '1px solid #F0F0F0',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #F0F0F0' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>内容分类</h3>
          </div>
          <Tree
            treeData={categoryTreeData}
            defaultExpandedKeys={['1', '2', '3']}
            selectedKeys={[selectedCategory]}
            onSelect={handleCategorySelect}
            style={{ padding: '16px' }}
          />
        </Sider>

        <AntContent style={{ padding: '24px' }}>
          {/* 搜索和操作栏 */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Search
              placeholder="搜索内容标题"
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                setEditingContent(null);
                form.resetFields();
                setIsModalVisible(true);
              }}>
                新增内容
              </Button>
            </Space>
          </div>

          {/* 内容管理标签页 */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ minHeight: '500px' }}
          />
        </AntContent>
      </Layout>

      {/* 编辑内容模态框 */}
      <Modal
        title={editingContent ? '编辑内容' : '新增内容'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'text',
            status: 'draft',
          }}
        >
          <Form.Item
            label="内容标题"
            name="title"
            rules={[{ required: true, message: '请输入内容标题' }]}
          >
            <Input placeholder="请输入内容标题" />
          </Form.Item>
          
          <Form.Item
            label="内容类型"
            name="type"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select placeholder="请选择内容类型">
              <Option value="text">文本</Option>
              <Option value="image">图片</Option>
              <Option value="video">视频</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="所属分类"
            name="category"
            rules={[{ required: true, message: '请选择所属分类' }]}
          >
            <Select placeholder="请选择所属分类">
              <Option value="轮播图">轮播图</Option>
              <Option value="公告">公告</Option>
              <Option value="产品列表">产品列表</Option>
              <Option value="产品详情">产品详情</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="内容状态"
            name="status"
            rules={[{ required: true, message: '请选择内容状态' }]}
          >
            <Select placeholder="请选择内容状态">
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="内容描述"
            name="description"
          >
            <TextArea rows={4} placeholder="请输入内容描述" />
          </Form.Item>
          
          <Form.Item
            label="上传文件"
            name="upload"
          >
            <Upload.Dragger
              name="file"
              multiple
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单个或批量上传</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentManagement;
