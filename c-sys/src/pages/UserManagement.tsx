import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  setUsers,
  setLoading,
  setTotal,
  setCurrentPage,
  setPageSize,
  setSearchKeyword,
  setSelectedUsers,
} from '../store/slices/userSlice';
import { userAPI } from '../services/api';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../types';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UserManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, total, currentPage, pageSize, searchKeyword, selectedUsers } = useSelector(
    (state: RootState) => state.user
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  const loadUsers = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const response = await userAPI.getUsers({
        page: currentPage,
        pageSize: pageSize,
        search: searchKeyword,
      });
      if (response.success) {
        dispatch(setUsers(response.data.users as User[]));
        dispatch(setTotal(response.data.total));
      } else {
        message.error('获取用户列表失败');
      }
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败');
    } finally {
      dispatch(setLoading(false));
    }
  }, [currentPage, pageSize, searchKeyword, dispatch]);

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, searchKeyword, loadUsers]);

  const handleSearch = (value: string) => {
    dispatch(setSearchKeyword(value));
    dispatch(setCurrentPage(1));
  };

  const handleTableChange = (pagination: any) => {
    dispatch(setCurrentPage(pagination.current));
    dispatch(setPageSize(pagination.pageSize));
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      message.success('用户删除成功');
      loadUsers();
    } catch (error: any) {
      message.error(error.message || '删除用户失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, values);
        message.success('用户信息更新成功');
      } else {
        await userAPI.createUser(values);
        message.success('用户创建成功');
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      loadUsers();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '活跃' },
      disabled: { color: 'red', text: '禁用' },
      pending: { color: 'orange', text: '待审核' },
    } as const;
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRoleTag = (role: string) => {
    const roleConfig = {
      admin: { color: 'blue', text: '管理员' },
      user: { color: 'default', text: '普通用户' },
    } as const;
    const config = roleConfig[role as keyof typeof roleConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<any> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar size={40} icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div style={{ fontWeight: '500' }}>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666666' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (time: string | null) => time || '从未登录',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>用户管理</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666666' }}>
          管理系统用户信息和权限
        </p>
      </div>

      <Card style={{ borderRadius: '6px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Search
              placeholder="搜索用户名、邮箱或手机号"
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
            <RangePicker placeholder={['注册开始时间', '注册结束时间']} />
            <Button icon={<ReloadOutlined />} onClick={loadUsers}>
              刷新
            </Button>
          </div>
          
          <Space>
            <Button icon={<ExportOutlined />} onClick={() => message.info('导出功能开发中...')}>导出</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setIsModalVisible(true);
            }}>
              新增用户
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条/共 ${t} 条`,
          }}
          onChange={handleTableChange}
          rowSelection={{
            selectedRowKeys: selectedUsers,
            onChange: (selectedRowKeys) => dispatch(setSelectedUsers(selectedRowKeys as string[])),
          }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            role: 'user',
          }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          
          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">活跃</Option>
              <Option value="disabled">禁用</Option>
              <Option value="pending">待审核</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
