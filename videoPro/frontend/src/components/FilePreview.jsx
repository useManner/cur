import React from 'react'
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'

function FilePreview({ file, onRemove }) {
  // 创建文件预览URL
  const objectUrl = React.useMemo(() => {
    return URL.createObjectURL(file)
  }, [file])

  // 组件卸载时释放URL
  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 判断是图片还是视频
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  return (
    <div className="preview-item">
      {isImage && (
        <img 
          src={objectUrl} 
          alt={file.name}
          className="preview-image"
          style={{ 
            width: '100%', 
            height: '150px', 
            objectFit: 'contain',
            backgroundColor: '#f0f0f0'
          }}
        />
      )}
      {isVideo && (
        <div style={{ position: 'relative', height: '150px', backgroundColor: '#000' }}>
          <video 
            src={objectUrl} 
            className="preview-video"
            controls
            preload="metadata"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain'
            }}
          >
            您的浏览器不支持视频标签
          </video>
        </div>
      )}
      <div style={{ padding: 10, backgroundColor: '#f5f5f5' }}>
        <div style={{ 
          fontSize: 12, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          marginBottom: 5
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: '#666' }}>
          {formatFileSize(file.size)}
        </div>
      </div>
      <button 
        className="remove-btn" 
        onClick={onRemove}
        title="移除文件"
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}
      >
        <DeleteOutlined style={{ fontSize: '12px' }} />
      </button>
    </div>
  )
}

export default FilePreview