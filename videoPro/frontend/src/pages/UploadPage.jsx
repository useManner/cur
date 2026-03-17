import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button, Slider, message, Table, Modal, Tabs, InputNumber } from 'antd'
import { UploadOutlined, SearchOutlined, DeleteOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons'
import FilePreview from '../components/FilePreview.jsx'
import axios from 'axios'

function UploadPage() {
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [similarityThreshold, setSimilarityThreshold] = useState(0.8)
  const [isProcessing, setIsProcessing] = useState(false)
  const [compareModalVisible, setCompareModalVisible] = useState(false)
  const [compareFiles, setCompareFiles] = useState([])
  const [selectedTab, setSelectedTab] = useState('upload')
  const [frameSampleRate, setFrameSampleRate] = useState(10) // 每秒采样帧数

  // 处理文件拖放
  const onDrop = useCallback((acceptedFiles) => {
    // 支持的图片和视频类型
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm'];
    const supportedExtensions = [...imageExtensions, ...videoExtensions];
    
    // 过滤支持的文件类型（考虑可能没有type的情况）
    const supportedFiles = acceptedFiles.filter(file => {
      // 检查是否是文件夹
      if (file.type === '' && file.name.endsWith('/')) {
        message.warning('不支持上传文件夹，请直接上传文件');
        return false;
      }
      
      // 使用文件扩展名作为备选判断方式
      const fileName = file.name.toLowerCase();
      const hasSupportedExtension = supportedExtensions.some(ext => 
        fileName.endsWith(ext)
      );
      
      return file.type.startsWith('image/') || 
             file.type.startsWith('video/') ||
             hasSupportedExtension;
    })

    if (supportedFiles.length > 0) {
      // 文件去重：通过文件大小、名称和修改时间来判断是否重复
      setFiles(prevFiles => {
        // 计算新增且不重复的文件
        const newFiles = supportedFiles.filter(newFile => {
          // 检查是否已存在相同的文件
          const isDuplicate = prevFiles.some(existingFile => 
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size &&
            existingFile.lastModified === newFile.lastModified
          );
          return !isDuplicate;
        });
        
        // 计算重复的文件数量
        const duplicateCount = supportedFiles.length - newFiles.length;
        
        // 显示相应的消息
        if (newFiles.length > 0) {
          message.success(`已添加 ${newFiles.length} 个新文件`);
        }
        if (duplicateCount > 0) {
          message.info(`${duplicateCount} 个文件已存在，未重复添加`);
        }
        
        // 返回更新后的文件列表
        return [...prevFiles, ...newFiles];
      });
    } else {
      message.error('请上传图片或视频文件（支持jpg、png、gif、mp4、avi、mov等格式）')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject, rejectedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: true,
    directory: false, // 不允许文件夹上传
    onDropRejected: (files) => {
      if (files.some(file => file.size > 500 * 1024 * 1024)) {
        message.error('部分文件超过500MB限制，请选择更小的文件');
      } else if (files.some(file => file.name.endsWith('/'))) {
        message.warning('不支持上传文件夹，请直接上传文件');
      } else {
        message.error('部分文件格式不支持，请选择图片或视频文件');
      }
    }
  })

  // 移除文件
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // 一键清除所有文件
  const clearAllFiles = () => {
    if (files.length > 0) {
      setFiles([]);
      message.success('已清除所有文件');
    } else {
      message.info('当前没有文件可清除');
    }
  }

  // 开始查重
  const startDetection = async () => {
    if (files.length < 2) {
      message.error('至少需要上传2个文件进行比较')
      return
    }

    setIsProcessing(true)
    const formData = new FormData()
    
    // 添加文件到表单
    files.forEach(file => {
      formData.append('files', file)
    })
    
    // 添加配置参数
    formData.append('similarityThreshold', similarityThreshold)
    formData.append('frameSampleRate', frameSampleRate)

    try {
      const response = await axios.post('/api/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`上传进度: ${percentCompleted}%`)
        }
      })
      
      setResults(response.data.results)
      setSelectedTab('results')
      message.success('查重完成')
    } catch (error) {
      console.error('查重失败:', error)
      message.error('查重失败，请稍后重试')
      // 使用模拟数据（当后端不可用时）
      setResults(getMockResults())
      setSelectedTab('results')
      message.info('使用模拟数据展示结果')
    } finally {
      setIsProcessing(false)
    }
  }

  // 打开对比弹窗
  const showCompareModal = (file1, file2) => {
    setCompareFiles([file1, file2])
    setCompareModalVisible(true)
  }

  // 生成模拟数据
  const getMockResults = () => {
    return [
      {
        groupId: 1,
        similarity: 0.95,
        files: [
          {
            name: 'sample1.jpg',
            type: 'image/jpeg',
            size: 1024 * 1024,
            url: 'https://via.placeholder.com/400x300/1890ff/ffffff?text=Sample+1'
          },
          {
            name: 'sample2.jpg',
            type: 'image/jpeg',
            size: 1024 * 1024,
            url: 'https://via.placeholder.com/400x300/1890ff/ffffff?text=Sample+2'
          }
        ]
      },
      {
        groupId: 2,
        similarity: 0.87,
        files: [
          {
            name: 'video1.mp4',
            type: 'video/mp4',
            size: 1024 * 1024 * 5,
            url: 'https://example.com/video1.mp4'
          },
          {
            name: 'video2.mp4',
            type: 'video/mp4',
            size: 1024 * 1024 * 6,
            url: 'https://example.com/video2.mp4'
          }
        ]
      }
    ]
  }

  // 删除结果记录
  const deleteResult = (groupId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setResults(results.filter(result => result.groupId !== groupId))
        message.success('记录已删除')
      }
    })
  }

  // 表格列配置
  const columns = [
    {
      title: '重复组ID',
      dataIndex: 'groupId',
      key: 'groupId'
    },
    {
      title: '相似度',
      dataIndex: 'similarity',
      key: 'similarity',
      render: (similarity) => (
        <span className={
          similarity > 0.9 ? 'similarity-high' :
          similarity > 0.7 ? 'similarity-medium' : 'similarity-low'
        }>
          {(similarity * 100).toFixed(1)}%
        </span>
      )
    },
    {
      title: '文件数量',
      dataIndex: ['files', 'length'],
      key: 'fileCount'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => showCompareModal(record.files[0], record.files[1])}
            style={{ marginRight: 8 }}
          >
            查看详情
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => deleteResult(record.groupId)}
          >
            删除记录
          </Button>
        </>
      )
    }
  ]

  return (
    <div className="container">
      <Tabs 
      activeKey={selectedTab} 
      onChange={setSelectedTab}
      items={[
        {
          key: 'upload',
          label: '文件上传',
          children: (
            <div className="upload-section">
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isDragReject ? 'dropzone-rejected' : ''}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>将文件拖放到此处...</p>
                ) : isDragReject ? (
                  <div>
                    <p style={{ color: '#f5222d', fontSize: 16, marginTop: 8 }}>文件格式不支持，请选择图片或视频文件</p>
                  </div>
                ) : (
                  <div>
                    <UploadOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <p>点击或拖拽文件到此处上传</p>
                    <p style={{ color: '#999', fontSize: 14, marginTop: 8 }}>
                      支持 JPG、PNG、GIF、BMP、WEBP、MP4、AVI、MOV、MKV、WMV、FLV、WEBM 等格式<br/>
                      单个文件最大500MB，不支持文件夹上传
                    </p>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <>
                  <div style={{ marginTop: 20, marginBottom: 10, textAlign: 'right' }}>
                    <Button
                      type="default"
                      danger
                      onClick={clearAllFiles}
                      disabled={isProcessing}
                      style={{ marginRight: 10 }}
                    >
                      一键清除
                    </Button>
                  </div>
                  <div className="preview-container" style={{ marginTop: 10 }}>
                    {files.map((file, index) => (
                      <FilePreview
                        key={index}
                        file={file}
                        onRemove={() => removeFile(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              <div style={{ marginTop: 30 }}>
                <h3>配置参数</h3>
                <div style={{ marginBottom: 20 }}>
                  <label>相似度阈值: {(similarityThreshold * 100).toFixed(0)}%</label>
                  <Slider
                    min={0.5}
                    max={1}
                    step={0.01}
                    value={similarityThreshold}
                    onChange={setSimilarityThreshold}
                    tooltip={{ formatter: (value) => `${(value * 100).toFixed(0)}%` }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label>视频采样率（每秒帧数）: {frameSampleRate}</label>
                  <InputNumber
                    min={1}
                    max={30}
                    value={frameSampleRate}
                    onChange={setFrameSampleRate}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </div>
                <Button
                  type="primary"
                  size="large"
                  onClick={startDetection}
                  loading={isProcessing}
                  disabled={isProcessing || files.length < 2}
                  style={{ width: '100%' }}
                >
                  开始查重
                </Button>
              </div>
            </div>
          ),
        },
        {
          key: 'results',
          label: '查重结果',
          children: (
            <div className="result-section">
              {results.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={results}
                  rowKey="groupId"
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <SearchOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                  <p>暂无查重结果</p>
                </div>
              )}
            </div>
          ),
        },
      ]}
    />

      {/* 对比弹窗 */}
      <Modal
        title="文件对比"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        footer={null}
        width={800}
        className="compare-modal"
      >
        {compareFiles.length === 2 && (
          <Tabs 
            activeKey="1"
            items={[
              {
                key: '1',
                label: '相似文件',
                children: (
                  <div className="compare-container">
                    <div className="compare-item">
                      <h4>{compareFiles[0].name}</h4>
                      {compareFiles[0].type.startsWith('image/') ? (
                        <img 
                          src={compareFiles[0].url || (compareFiles[0] instanceof File ? URL.createObjectURL(compareFiles[0]) : '')} 
                          alt={compareFiles[0].name}
                          className="compare-image"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                      ) : (
                        <video 
                          src={compareFiles[0].url || (compareFiles[0] instanceof File ? URL.createObjectURL(compareFiles[0]) : '')}
                          controls
                          className="compare-video"
                          style={{ width: '100%', height: '300px', backgroundColor: '#000' }}
                        >
                          您的浏览器不支持视频标签
                        </video>
                      )}
                    </div>
                    <div className="compare-item">
                      <h4>{compareFiles[1].name}</h4>
                      {compareFiles[1].type.startsWith('image/') ? (
                        <img 
                          src={compareFiles[1].url || (compareFiles[1] instanceof File ? URL.createObjectURL(compareFiles[1]) : '')} 
                          alt={compareFiles[1].name}
                          className="compare-image"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                      ) : (
                        <video 
                          src={compareFiles[1].url || (compareFiles[1] instanceof File ? URL.createObjectURL(compareFiles[1]) : '')}
                          controls
                          className="compare-video"
                          style={{ width: '100%', height: '300px', backgroundColor: '#000' }}
                        >
                          您的浏览器不支持视频标签
                        </video>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: '2',
                label: '详细信息',
                children: (
                  <div className="comparison-details">
                    <div style={{ marginBottom: 20 }}>
                      <h4>文件信息</h4>
                      <div className="file-info">
                        <div className="file-item">
                          <p className="file-name">{compareFiles[0].name}</p>
                          <p className="file-size">大小: {(compareFiles[0].size / (1024 * 1024)).toFixed(2)} MB</p>
                          <p className="file-type">类型: {compareFiles[0].type || '未知'}</p>
                        </div>
                        <div className="file-item">
                          <p className="file-name">{compareFiles[1].name}</p>
                          <p className="file-size">大小: {(compareFiles[1].size / (1024 * 1024)).toFixed(2)} MB</p>
                          <p className="file-type">类型: {compareFiles[1].type || '未知'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  )
}

export default UploadPage