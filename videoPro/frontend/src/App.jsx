import React, { useState } from 'react'
import UploadPage from './pages/UploadPage.jsx'
import { ConfigProvider, Layout, theme } from 'antd'

const { Header, Content } = Layout

function App() {
  const { token } = theme.useToken()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout className="layout">
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="logo" style={{ flex: 1 }}>
            <h1 style={{ color: '#1890ff', margin: 0 }}>智能图片/视频查重检测系统</h1>
          </div>
        </Header>
        <Content style={{ margin: '20px', padding: 0 }}>
          <UploadPage />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default App