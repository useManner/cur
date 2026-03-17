import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Button, Timeline, Tag, message } from 'antd';
import { 
  UserOutlined, 
  EyeOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  EditOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // 模拟数据
  const statistics = [
    {
      title: '总用户数',
      value: 12847,
      prefix: <UserOutlined style={{ color: '#1890FF' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '12.5%',
      color: '#1890FF',
    },
    {
      title: '今日访问',
      value: 3241,
      prefix: <EyeOutlined style={{ color: '#52C41A' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '8.2%',
      color: '#52C41A',
    },
    {
      title: '订单数量',
      value: 892,
      prefix: <ShoppingCartOutlined style={{ color: '#FA8C16' }} />,
      suffix: <ArrowDownOutlined style={{ color: '#F5222D' }} />,
      suffixValue: '3.1%',
      color: '#FA8C16',
    },
    {
      title: '总收入',
      value: 45678,
      prefix: <DollarOutlined style={{ color: '#722ED1' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '15.3%',
      color: '#722ED1',
    },
  ];

  const chartOption = {
    title: {
      text: '用户增长趋势',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'normal' },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['新增用户', '活跃用户'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#1890FF' },
      },
      {
        name: '活跃用户',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
        itemStyle: { color: '#52C41A' },
      },
    ],
  };

  const recentActivities = [
    {
      title: '新用户注册',
      description: '用户 "张三" 刚刚注册了账号',
      time: '2分钟前',
      type: 'success',
    },
    {
      title: '订单完成',
      description: '订单 #12345 已成功完成支付',
      time: '5分钟前',
      type: 'info',
    },
    {
      title: '系统更新',
      description: '系统已更新到版本 v1.2.0',
      time: '1小时前',
      type: 'warning',
    },
    {
      title: '数据备份',
      description: '每日数据备份已完成',
      time: '2小时前',
      type: 'info',
    },
  ];

  const quickActions = [
    { title: '新增用户', icon: <PlusOutlined />, color: '#1890FF' },
    { title: '编辑内容', icon: <EditOutlined />, color: '#52C41A' },
    { title: '查看报表', icon: <BarChartOutlined />, color: '#FA8C16' },
  ];

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return '#52C41A';
      case 'warning': return '#FA8C16';
      case 'error': return '#F5222D';
      default: return '#1890FF';
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>仪表板</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666666' }}>
          欢迎回来！这里是您的数据概览
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card loading={loading} style={{ borderRadius: '6px' }}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={
                  <span style={{ 
                    fontSize: '12px', 
                    marginLeft: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {stat.suffix}
                    <span style={{ color: stat.suffix?.props?.style?.color }}>
                      {stat.suffixValue}
                    </span>
                  </span>
                }
                valueStyle={{ color: stat.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* 用户增长趋势图 */}
        <Col xs={24} lg={16}>
          <Card 
            title="用户增长趋势" 
            style={{ borderRadius: '6px', height: '400px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <ReactECharts 
              option={chartOption} 
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>

        {/* 快捷操作 */}
        <Col xs={24} lg={8}>
          <Card 
            title="快捷操作" 
            style={{ borderRadius: '6px', marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  type="text"
                  size="large"
                  icon={action.icon}
                  onClick={() => {
                    if (index === 0) {
                      message.info('跳转到用户管理页面');
                    } else if (index === 1) {
                      message.info('跳转到内容管理页面');
                    } else {
                      message.info('跳转到数据分析页面');
                    }
                  }}
                  style={{
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    color: action.color,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  {action.title}
                </Button>
              ))}
            </div>
          </Card>

          {/* 系统状态 */}
          <Card 
            title="系统状态" 
            style={{ borderRadius: '6px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>服务器状态</span>
                <Tag color="green">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>在线用户</span>
                <span style={{ fontWeight: 'bold' }}>1,247</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>内存使用</span>
                <span style={{ fontWeight: 'bold' }}>68%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CPU使用</span>
                <span style={{ fontWeight: 'bold' }}>45%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最新动态 */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="最新动态" 
            style={{ borderRadius: '6px' }}
          >
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={getStatusColor(activity.type)}
                >
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {activity.title}
                    </div>
                    <div style={{ color: '#666666', fontSize: '14px' }}>
                      {activity.description}
                    </div>
                    <div style={{ color: '#999999', fontSize: '12px', marginTop: '4px' }}>
                      {activity.time}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
