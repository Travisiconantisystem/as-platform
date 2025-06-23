import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { zhTW } from 'date-fns/locale'

// Tailwind CSS類名合併
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日期格式化函數
export const dateHelpers = {
  // 格式化日期
  format: (date: string | Date, pattern: string = 'yyyy-MM-dd HH:mm:ss') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '無效日期'
    return format(dateObj, pattern, { locale: zhTW })
  },

  // 相對時間
  relative: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '無效日期'
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: zhTW })
  },

  // 友好的日期顯示
  friendly: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return '無效日期'
    
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return '剛剛'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小時前`
    } else if (diffInHours < 48) {
      return '昨天'
    } else {
      return format(dateObj, 'MM-dd', { locale: zhTW })
    }
  },

  // 檢查是否為今天
  isToday: (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return false
    
    const today = new Date()
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    )
  },
}

// 字符串處理函數
export const stringHelpers = {
  // 截斷文本
  truncate: (text: string, length: number = 100, suffix: string = '...') => {
    if (text.length <= length) return text
    return text.substring(0, length) + suffix
  },

  // 首字母大寫
  capitalize: (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  },

  // 駝峰轉換
  camelCase: (text: string) => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  },

  // 蛇形轉換
  snakeCase: (text: string) => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\s+/)
      .map((word) => word.toLowerCase())
      .join('_')
  },

  // 短橫線轉換
  kebabCase: (text: string) => {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\s+/)
      .map((word) => word.toLowerCase())
      .join('-')
  },

  // 生成隨機字符串
  random: (length: number = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // 生成UUID
  uuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },

  // 移除HTML標籤
  stripHtml: (html: string) => {
    return html.replace(/<[^>]*>/g, '')
  },

  // 高亮搜索詞
  highlight: (text: string, search: string) => {
    if (!search) return text
    const regex = new RegExp(`(${search})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  },
}

// 數字處理函數
export const numberHelpers = {
  // 格式化數字
  format: (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('zh-TW', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  },

  // 格式化貨幣
  currency: (amount: number, currency: string = 'HKD') => {
    return new Intl.NumberFormat('zh-HK', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  // 格式化百分比
  percentage: (value: number, decimals: number = 1) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100)
  },

  // 文件大小格式化
  fileSize: (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  },

  // 生成範圍數組
  range: (start: number, end: number, step: number = 1) => {
    const result = []
    for (let i = start; i <= end; i += step) {
      result.push(i)
    }
    return result
  },

  // 隨機數
  random: (min: number = 0, max: number = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // 四捨五入到指定小數位
  round: (num: number, decimals: number = 2) => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals)
  },
}

// 數組處理函數
export const arrayHelpers = {
  // 去重
  unique: <T>(array: T[]) => {
    return [...new Set(array)]
  },

  // 根據屬性去重
  uniqueBy: <T>(array: T[], key: keyof T) => {
    const seen = new Set()
    return array.filter((item) => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  },

  // 分組
  groupBy: <T>(array: T[], key: keyof T) => {
    return array.reduce((groups, item) => {
      const group = item[key] as string
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },

  // 排序
  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  },

  // 分頁
  paginate: <T>(array: T[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    return {
      data: array.slice(startIndex, endIndex),
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit),
    }
  },

  // 隨機打亂
  shuffle: <T>(array: T[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },

  // 隨機選擇
  sample: <T>(array: T[], count: number = 1) => {
    const shuffled = arrayHelpers.shuffle(array)
    return shuffled.slice(0, count)
  },

  // 分塊
  chunk: <T>(array: T[], size: number) => {
    const chunks = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  },
}

// 對象處理函數
export const objectHelpers = {
  // 深拷貝
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
    if (obj instanceof Array) return obj.map((item) => objectHelpers.deepClone(item)) as unknown as T
    if (typeof obj === 'object') {
      const clonedObj = {} as { [key: string]: any }
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = objectHelpers.deepClone(obj[key])
        }
      }
      return clonedObj as T
    }
    return obj
  },

  // 深度合併
  deepMerge: <T>(target: T, ...sources: Partial<T>[]): T => {
    if (!sources.length) return target
    const source = sources.shift()
    
    if (objectHelpers.isObject(target) && objectHelpers.isObject(source)) {
      for (const key in source) {
        if (objectHelpers.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          objectHelpers.deepMerge(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
    
    return objectHelpers.deepMerge(target, ...sources)
  },

  // 檢查是否為對象
  isObject: (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item)
  },

  // 獲取嵌套屬性
  get: (obj: any, path: string, defaultValue?: any) => {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  },

  // 設置嵌套屬性
  set: (obj: any, path: string, value: any) => {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || !objectHelpers.isObject(current[key])) {
        current[key] = {}
      }
      current = current[key]
    }
    
    current[keys[keys.length - 1]] = value
    return obj
  },

  // 移除空值
  removeEmpty: (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj
        .map((item) => objectHelpers.removeEmpty(item))
        .filter((item) => item !== null && item !== undefined && item !== '')
    }
    
    if (objectHelpers.isObject(obj)) {
      const cleaned: any = {}
      for (const key in obj) {
        const value = objectHelpers.removeEmpty(obj[key])
        if (value !== null && value !== undefined && value !== '') {
          cleaned[key] = value
        }
      }
      return cleaned
    }
    
    return obj
  },

  // 扁平化對象
  flatten: (obj: any, prefix: string = ''): Record<string, any> => {
    const flattened: Record<string, any> = {}
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key
        
        if (objectHelpers.isObject(obj[key])) {
          Object.assign(flattened, objectHelpers.flatten(obj[key], newKey))
        } else {
          flattened[newKey] = obj[key]
        }
      }
    }
    
    return flattened
  },
}

// 驗證函數
export const validators = {
  // 電子郵件
  email: (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  },

  // 手機號碼（香港）
  phone: (phone: string) => {
    const regex = /^[569]\d{7}$/
    return regex.test(phone.replace(/\s+/g, ''))
  },

  // URL
  url: (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // 密碼強度
  password: (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      strength: [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length,
      requirements: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
      },
    }
  },

  // 信用卡號
  creditCard: (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s+/g, '')
    const regex = /^\d{13,19}$/
    
    if (!regex.test(cleaned)) return false
    
    // Luhn算法驗證
    let sum = 0
    let isEven = false
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10)
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  },

  // 身份證號（香港）
  hkid: (id: string) => {
    const regex = /^[A-Z]{1,2}\d{6}\([0-9A]\)$/
    return regex.test(id.toUpperCase())
  },
}

// 本地存儲助手
export const storage = {
  // 設置項目
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  // 獲取項目
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue || null
    }
  },

  // 移除項目
  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  },

  // 清空存儲
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  },

  // 檢查是否存在
  has: (key: string) => {
    return localStorage.getItem(key) !== null
  },
}

// 防抖函數
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 節流函數
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 重試函數
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// 睡眠函數
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 複製到剪貼板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}

// 下載文件
export function downloadFile(data: string | Blob, filename: string, type?: string) {
  const blob = typeof data === 'string' ? new Blob([data], { type: type || 'text/plain' }) : data
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// 檢測設備類型
export const device = {
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTablet: () => /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
  isDesktop: () => !device.isMobile() && !device.isTablet(),
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: () => /Android/.test(navigator.userAgent),
  isSafari: () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
  isChrome: () => /Chrome/.test(navigator.userAgent),
  isFirefox: () => /Firefox/.test(navigator.userAgent),
}