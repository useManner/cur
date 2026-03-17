import React, { useState, useEffect } from 'react'

type HistoryItem = {
  id: string
  name: string
  status: string
  file_count?: number
}

export default function App() {
  const [zip, setZip] = useState<File | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)

  const upload = async () => {
    if (!zip) return
    const form = new FormData()
    form.append('file', zip)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || '上传失败')
      }
      const data = await res.json()
      setTaskId(data.task_id)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/history')
      const data = await res.json()
      setHistory(data.items || [])
    }
    load()
  }, [])

  // 任务状态轮询
  useEffect(() => {
    if (!taskId) return
    let mounted = true
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/task/${taskId}`)
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setCurrentStatus(data.status)
        if (data.status === 'done') {
          clearInterval(timer)
          // 刷新历史
          const hres = await fetch('/history')
          const hdata = await hres.json()
          if (mounted) setHistory(hdata.items || [])
        }
      } catch (e) {
        // 忽略轮询错误
      }
    }, 2000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [taskId])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Visual Duplicate Finder Pro</h1>
      <p>上传 ZIP 文件（包含图片/视频），系统将自动计算哈希并查重。</p>

      <div style={{ border: '1px dashed #999', padding: 16, marginTop: 16 }}>
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setZip(e.target.files?.[0] || null)}
        />
        <button onClick={upload} disabled={!zip || loading} style={{ marginLeft: 12 }}>
          {loading ? '上传中...' : '上传 ZIP'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: '#c00' }}>{error}</div>
      )}

      {taskId && (
        <div style={{ marginTop: 16 }}>
          已创建任务：<code>{taskId}</code>
          {currentStatus && (
            <span style={{ marginLeft: 12 }}>状态：{currentStatus}</span>
          )}
        </div>
      )}

      <h2 style={{ marginTop: 32 }}>历史任务</h2>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>任务ID</th>
            <th>名称</th>
            <th>状态</th>
            <th>文件数</th>
            <th>报告</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td><code>{h.id}</code></td>
              <td>{h.name}</td>
              <td>{h.status}</td>
              <td>{h.file_count ?? '-'}</td>
              <td>
                <a href={`/task/${h.id}/report?format=json`} target="_blank">JSON</a>
                {' '}|{' '}
                <a href={`/task/${h.id}/report?format=html`} target="_blank">HTML</a>
                {' '}|{' '}
                <a href={`/task/${h.id}/report?format=xlsx`} target="_blank">XLSX</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


