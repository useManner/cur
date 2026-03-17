import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Statistic,
  Table,
  Space,
  Tag,
  Progress,
  Tooltip,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DataAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7days');

  // 核心指标数据
  const coreMetrics = [
    {
      title: 'PV (页面访问量)',
      value: 125847,
      prefix: <EyeOutlined style={{ color: '#1890FF' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '12.5%',
      color: '#1890FF',
    },
    {
      title: 'UV (独立访客)',
      value: 32456,
      prefix: <UserOutlined style={{ color: '#52C41A' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '8.2%',
      color: '#52C41A',
    },
    {
      title: '转化率',
      value: 3.8,
      prefix: <ShoppingCartOutlined style={{ color: '#FA8C16' }} />,
      suffix: <ArrowDownOutlined style={{ color: '#F5222D' }} />,
      suffixValue: '2.1%',
      color: '#FA8C16',
    },
    {
      title: '留存率',
      value: 68.5,
      prefix: <DollarOutlined style={{ color: '#722ED1' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52C41A' }} />,
      suffixValue: '5.3%',
      color: '#722ED1',
    },
  ];

  // 用户增长趋势图配置
  const userGrowthOption = {
    title: {
      text: '用户增长趋势',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'normal' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['新增用户', '活跃用户', '流失用户'],
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
      name: '用户数',
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        itemStyle: { color: '#1890FF' },
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '活跃用户',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
        itemStyle: { color: '#52C41A' },
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '流失用户',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
        itemStyle: { color: '#F5222D' },
        areaStyle: { opacity: 0.3 },
      },
    ],
  };

  // 访问来源饼图配置
  const trafficSourceOption = {
    title: {
      text: '访问来源分布',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'normal' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: '微信分享', itemStyle: { color: '#52C41A' } },
          { value: 735, name: '搜索访问', itemStyle: { color: '#1890FF' } },
          { value: 580, name: '直接访问', itemStyle: { color: '#FA8C16' } },
          { value: 484, name: '二维码', itemStyle: { color: '#722ED1' } },
          { value: 300, name: '其他', itemStyle: { color: '#F5222D' } },
        ],
      },
    ],
  };

  // 用户行为热力图配置
  const heatmapOption = {
    title: {
      text: '用户行为热力图',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'normal' },
    },
    tooltip: {
      position: 'top',
    },
    grid: {
      height: '50%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: ['首页', '产品页', '详情页', '订单页', '个人中心', '设置页'],
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: ['0-2时', '2-4时', '4-6时', '6-8时', '8-10时', '10-12时', '12-14时', '14-16时', '16-18时', '18-20时', '20-22时', '22-24时'],
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 1000,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d'],
      },
    },
    series: [
      {
        name: '访问量',
        type: 'heatmap',
        data: [
          [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0],
          [1, 0, 7], [1, 1, 2], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0],
          [2, 0, 26], [2, 1, 9], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0],
          [3, 0, 184], [3, 1, 53], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0],
          [4, 0, 312], [4, 1, 98], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 0],
          [5, 0, 457], [5, 1, 143], [5, 2, 0], [5, 3, 0], [5, 4, 0], [5, 5, 0],
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 热门页面排行数据
  const hotPagesData = [
    {
      key: '1',
      rank: 1,
      page: '首页',
      pv: 12547,
      uv: 3241,
      bounceRate: 35.2,
      avgTime: '2分30秒',
    },
    {
      key: '2',
      rank: 2,
      page: '产品列表',
      pv: 8932,
      uv: 2156,
      bounceRate: 42.8,
      avgTime: '3分15秒',
    },
    {
      key: '3',
      rank: 3,
      page: '产品详情',
      pv: 6543,
      uv: 1890,
      bounceRate: 28.5,
      avgTime: '4分20秒',
    },
    {
      key: '4',
      rank: 4,
      page: '个人中心',
      pv: 4231,
      uv: 1567,
      bounceRate: 18.9,
      avgTime: '1分45秒',
    },
    {
      key: '5',
      rank: 5,
      page: '订单页面',
      pv: 3124,
      uv: 923,
      bounceRate: 15.2,
      avgTime: '2分10秒',
    },
  ];

  const hotPagesColumns: ColumnsType<any> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => (
        <Tag color={rank <= 3 ? 'red' : 'default'} style={{ borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {rank}
        </Tag>
      ),
    },
    {
      title: '页面名称',
      dataIndex: 'page',
      key: 'page',
      render: (page) => <span style={{ fontWeight: '500' }}>{page}</span>,
    },
    {
      title: 'PV',
      dataIndex: 'pv',
      key: 'pv',
      render: (pv) => <span style={{ color: '#1890FF', fontWeight: '500' }}>{pv.toLocaleString()}</span>,
    },
    {
      title: 'UV',
      dataIndex: 'uv',
      key: 'uv',
      render: (uv) => <span style={{ color: '#52C41A', fontWeight: '500' }}>{uv.toLocaleString()}</span>,
    },
    {
      title: '跳出率',
      dataIndex: 'bounceRate',
      key: 'bounceRate',
      render: (rate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress
            percent={rate}
            size="small"
            strokeColor={rate > 40 ? '#F5222D' : rate > 30 ? '#FA8C16' : '#52C41A'}
            style={{ width: '60px' }}
          />
          <span style={{ fontSize: '12px' }}>{rate}%</span>
        </div>
      ),
    },
    {
      title: '平均停留时间',
      dataIndex: 'avgTime',
      key: 'avgTime',
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>数据分析</h1>
        <p style={{ margin: '8px 0 0 0', color: '#666666' }}>
          深度分析用户行为和业务数据
        </p>
      </div>

      {/* 时间筛选和操作栏 */}
      <Card style={{ marginBottom: '24px', borderRadius: '6px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span style={{ fontWeight: '500' }}>时间范围：</span>
          </Col>
          <Col>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Option value="today">今日</Option>
              <Option value="yesterday">昨日</Option>
              <Option value="7days">近7天</Option>
              <Option value="30days">近30天</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker />
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => message.success('数据已刷新')}>刷新数据</Button>
          </Col>
          <Col flex="auto">
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={() => message.info('Excel导出功能开发中...')}>导出Excel</Button>
                <Button icon={<DownloadOutlined />} onClick={() => message.info('PDF导出功能开发中...')}>导出PDF</Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 核心指标 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        {coreMetrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card style={{ borderRadius: '6px' }}>
              <Statistic
                title={metric.title}
                value={metric.value}
                prefix={metric.prefix}
                suffix={
                  <span style={{ 
                    fontSize: '12px', 
                    marginLeft: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {metric.suffix}
                    <span style={{ color: metric.suffix?.props?.style?.color }}>
                      {metric.suffixValue}
                    </span>
                  </span>
                }
                valueStyle={{ color: metric.color, fontSize: '24px', fontWeight: 'bold' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* 用户增长趋势 */}
        <Col xs={24} lg={16}>
          <Card 
            title="用户增长趋势" 
            style={{ borderRadius: '6px', marginBottom: '24px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <ReactECharts 
              option={userGrowthOption} 
              style={{ height: '400px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>

        {/* 访问来源分布 */}
        <Col xs={24} lg={8}>
          <Card 
            title="访问来源分布" 
            style={{ borderRadius: '6px', marginBottom: '24px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <ReactECharts 
              option={trafficSourceOption} 
              style={{ height: '400px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户行为热力图 */}
      <Row style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title="用户行为热力图" 
            style={{ borderRadius: '6px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <ReactECharts 
              option={heatmapOption} 
              style={{ height: '500px' }}
              opts={{ renderer: 'canvas' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 热门页面排行 */}
      <Row>
        <Col span={24}>
          <Card 
            title="热门页面排行" 
            style={{ borderRadius: '6px' }}
            extra={
              <Tooltip title="点击查看详细数据">
                <Button type="link">查看详情</Button>
              </Tooltip>
            }
          >
            <Table
              columns={hotPagesColumns}
              dataSource={hotPagesData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataAnalytics;
