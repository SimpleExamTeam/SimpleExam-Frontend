// 格式化日期字符串，确保兼容 iOS
export const parseDate = (dateStr) => {
  if (!dateStr) return new Date()
  
  // 处理不同格式的日期字符串
  if (dateStr.includes('T')) {
    // ISO 格式：yyyy-MM-ddTHH:mm:ss
    return new Date(dateStr)
  } else if (dateStr.includes(' ')) {
    // 标准格式：yyyy-MM-dd HH:mm:ss
    const [date, time] = dateStr.split(' ')
    return new Date(`${date}T${time}`)
  } else {
    // 纯日期格式：yyyy-MM-dd
    return new Date(`${dateStr}T00:00:00`)
  }
}

// 格式化日期为 yyyy-MM-dd HH:mm:ss
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = typeof date === 'string' ? parseDate(date) : new Date(date)
  if (isNaN(d.getTime())) return ''

  const pad = (num) => String(num).padStart(2, '0')
  
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化日期为 yyyy-MM-dd
export const formatDate = (date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? parseDate(date) : new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const pad = (num) => String(num).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 格式化为相对时间
export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const d = typeof date === 'string' ? parseDate(date) : new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 30) {
    return formatDate(date)
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
} 