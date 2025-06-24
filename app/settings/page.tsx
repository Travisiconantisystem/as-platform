'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Zap, 
  Mail, 
  Key, 
  Palette, 
  Monitor, 
  Smartphone, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  Upload,
  Trash2,
  Plus,
  Info
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
// import { useAppStore } from '@/lib/store/useAppStore'

interface APIKey {
  id: string
  name: string
  service: string
  key: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  lastUsed?: string
  usageCount: number
  rateLimit: number
}

interface NotificationSetting {
  id: string
  type: 'email' | 'push' | 'sms'
  category: 'workflow' | 'ai_agent' | 'system' | 'security'
  enabled: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Claude API',
    service: 'Anthropic',
    key: 'sk-ant-api03-***************************',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T10:30:00Z',
    usageCount: 15420,
    rateLimit: 1000
  },
  {
    id: '2',
    name: 'Apollo API',
    service: 'Apollo.io',
    key: 'apollo_***************************',
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
    lastUsed: '2024-01-15T09:15:00Z',
    usageCount: 8934,
    rateLimit: 500
  },
  {
    id: '3',
    name: 'Instagram Basic Display',
    service: 'Meta',
    key: 'IGQVJ***************************',
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    lastUsed: '2024-01-14T15:20:00Z',
    usageCount: 2156,
    rateLimit: 200
  },
  {
    id: '4',
    name: 'N8N Webhook',
    service: 'N8N',
    key: 'n8n_webhook_***************************',
    status: 'inactive',
    createdAt: '2024-01-08T00:00:00Z',
    usageCount: 0,
    rateLimit: 100
  }
]

const mockNotificationSettings: NotificationSetting[] = [
  {
    id: '1',
    type: 'email',
    category: 'workflow',
    enabled: true,
    frequency: 'immediate'
  },
  {
    id: '2',
    type: 'push',
    category: 'workflow',
    enabled: true,
    frequency: 'immediate'
  },
  {
    id: '3',
    type: 'email',
    category: 'ai_agent',
    enabled: true,
    frequency: 'daily'
  },
  {
    id: '4',
    type: 'push',
    category: 'ai_agent',
    enabled: false,
    frequency: 'immediate'
  },
  {
    id: '5',
    type: 'email',
    category: 'system',
    enabled: true,
    frequency: 'immediate'
  },
  {
    id: '6',
    type: 'sms',
    category: 'security',
    enabled: true,
    frequency: 'immediate'
  }
]

function getStatusColor(status: APIKey['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: APIKey['status']) {
  switch (status) {
    case 'active':
      return '正常'
    case 'inactive':
      return '未啟用'
    case 'expired':
      return '已過期'
    default:
      return '未知'
  }
}

function getCategoryText(category: NotificationSetting['category']) {
  switch (category) {
    case 'workflow':
      return '工作流程'
    case 'ai_agent':
      return 'AI 智能體'
    case 'system':
      return '系統'
    case 'security':
      return '安全'
    default:
      return '其他'
  }
}

function getTypeText(type: NotificationSetting['type']) {
  switch (type) {
    case 'email':
      return '郵件'
    case 'push':
      return '推送'
    case 'sms':
      return '簡訊'
    default:
      return '其他'
  }
}

function getFrequencyText(frequency: NotificationSetting['frequency']) {
  switch (frequency) {
    case 'immediate':
      return '即時'
    case 'hourly':
      return '每小時'
    case 'daily':
      return '每日'
    case 'weekly':
      return '每週'
    default:
      return '未設定'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys)
  const [notifications, setNotifications] = useState<NotificationSetting[]>(mockNotificationSettings)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState('zh-TW')
  const [timezone, setTimezone] = useState('Asia/Hong_Kong')
  // const { user, setUser } = useAppStore()

  // const handleApiKeyToggle = (keyId: string, status: APIKey['status']) => {
  //   setApiKeys(prev => prev.map(key => 
  //     key.id === keyId 
  //       ? { ...key, status }
  //       : key
  //   ))
  // }

  const handleNotificationToggle = (notificationId: string, enabled: boolean) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, enabled }
        : notification
    ))
  }

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">設置</h1>
        <p className="text-muted-foreground">
          管理您的帳戶設置、整合配置和系統偏好
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            個人資料
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            整合
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            安全
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            外觀
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            進階
          </TabsTrigger>
        </TabsList>

        {/* 個人資料 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>個人資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">名字</Label>
                  <Input id="firstName" defaultValue="Travis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">姓氏</Label>
                  <Input id="lastName" defaultValue="Chen" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input id="email" type="email" defaultValue="travis@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">公司</Label>
                <Input id="company" defaultValue="AI Automation Solutions" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">個人簡介</Label>
                <Textarea 
                  id="bio" 
                  placeholder="簡單介紹一下自己..." 
                  defaultValue="香港AI automation創業家，專注於高度個性化冷郵件外展解決方案。"
                />
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存更改
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>聯繫信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">電話號碼</Label>
                  <Input id="phone" placeholder="+852 1234 5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">網站</Label>
                  <Input id="website" placeholder="https://example.com" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" placeholder="@username" />
                </div>
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存更改
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 整合設置 */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">API 密鑰管理</h3>
              <p className="text-sm text-muted-foreground">
                管理您的第三方服務 API 密鑰
              </p>
            </div>
            <Button onClick={() => setIsAddKeyDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加密鑰
            </Button>
          </div>
          
          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Key className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <p className="text-sm text-muted-foreground">{apiKey.service}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apiKey.status)}>
                        {getStatusText(apiKey.status)}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      >
                        {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">API 密鑰：</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {showApiKey === apiKey.id ? apiKey.key : apiKey.key.replace(/(?<=.{8}).(?=.{8})/g, '*')}
                      </code>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">創建時間：</span>
                        <span>{formatDate(apiKey.createdAt)}</span>
                      </div>
                      {apiKey.lastUsed && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">最後使用：</span>
                          <span>{formatDate(apiKey.lastUsed)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">使用次數：</span>
                        <span>{apiKey.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">速率限制：</span>
                        <span>{apiKey.rateLimit}/小時</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Webhook 設置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="webhookUrl" 
                    defaultValue="https://your-domain.com/api/webhooks/apollo" 
                    readOnly
                  />
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook 密鑰</Label>
                <div className="flex gap-2">
                  <Input 
                    id="webhookSecret" 
                    type="password" 
                    defaultValue="your-webhook-secret-key" 
                  />
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>重要提醒</AlertTitle>
                <AlertDescription>
                  請確保您的 Webhook 密鑰安全，並定期更新。這個密鑰用於驗證來自第三方服務的請求。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設置 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知偏好</CardTitle>
              <p className="text-sm text-muted-foreground">
                選擇您希望接收的通知類型和頻率
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['workflow', 'ai_agent', 'system', 'security'].map((category) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-3">{getCategoryText(category as NotificationSetting['category'])}</h4>
                    <div className="space-y-3">
                      {notifications
                        .filter(n => n.category === category)
                        .map((notification) => (
                          <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded">
                                {notification.type === 'email' && <Mail className="h-4 w-4" />}
                                {notification.type === 'push' && <Bell className="h-4 w-4" />}
                                {notification.type === 'sms' && <Smartphone className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium">{getTypeText(notification.type)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getFrequencyText(notification.frequency)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Select defaultValue={notification.frequency}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">即時</SelectItem>
                                  <SelectItem value="hourly">每小時</SelectItem>
                                  <SelectItem value="daily">每日</SelectItem>
                                  <SelectItem value="weekly">每週</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Switch
                                checked={notification.enabled}
                                onCheckedChange={(checked) => handleNotificationToggle(notification.id, checked)}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存通知設置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全設置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>密碼設置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">當前密碼</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密碼</Label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認新密碼</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                更新密碼
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>雙重驗證</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">啟用雙重驗證</p>
                  <p className="text-sm text-muted-foreground">
                    為您的帳戶添加額外的安全層
                  </p>
                </div>
                <Switch />
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>安全建議</AlertTitle>
                <AlertDescription>
                  啟用雙重驗證可以大大提高您帳戶的安全性。我們建議使用 Google Authenticator 或類似的應用程式。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>登錄歷史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { location: '香港', device: 'Chrome on macOS', time: '2024-01-15 10:30', current: true },
                  { location: '香港', device: 'Safari on iPhone', time: '2024-01-14 18:45', current: false },
                  { location: '香港', device: 'Chrome on macOS', time: '2024-01-14 09:15', current: false }
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.time}
                        </p>
                      </div>
                    </div>
                    
                    {session.current ? (
                      <Badge className="bg-green-100 text-green-800">當前會話</Badge>
                    ) : (
                      <Button size="sm" variant="outline">
                        撤銷
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 外觀設置 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>主題設置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">深色模式</p>
                  <p className="text-sm text-muted-foreground">
                    切換到深色主題以減少眼部疲勞
                  </p>
                </div>
                <Switch 
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>主題色彩</Label>
                <div className="flex gap-2">
                  {[
                    { name: '藍色', color: 'bg-blue-500' },
                    { name: '綠色', color: 'bg-green-500' },
                    { name: '紫色', color: 'bg-purple-500' },
                    { name: '橙色', color: 'bg-orange-500' }
                  ].map((theme) => (
                    <button
                      key={theme.name}
                      className={`w-8 h-8 rounded-full ${theme.color} border-2 border-gray-300 hover:border-gray-400`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>語言和地區</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">語言</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="zh-CN">简体中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">時區</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Hong_Kong">香港 (GMT+8)</SelectItem>
                      <SelectItem value="Asia/Shanghai">上海 (GMT+8)</SelectItem>
                      <SelectItem value="Asia/Tokyo">東京 (GMT+9)</SelectItem>
                      <SelectItem value="America/New_York">紐約 (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">倫敦 (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                保存設置
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 進階設置 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>數據管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">導出數據</p>
                  <p className="text-sm text-muted-foreground">
                    下載您的所有數據副本
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  導出
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">導入數據</p>
                  <p className="text-sm text-muted-foreground">
                    從備份文件恢復數據
                  </p>
                </div>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  導入
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">刪除帳戶</p>
                  <p className="text-sm text-muted-foreground">
                    永久刪除您的帳戶和所有數據
                  </p>
                </div>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  刪除帳戶
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>系統信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">版本：</span>
                  <span>v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最後更新：</span>
                  <span>2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API 版本：</span>
                  <span>v2.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">數據庫版本：</span>
                  <span>PostgreSQL 15.4</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 添加 API 密鑰對話框 */}
      <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加 API 密鑰</DialogTitle>
            <DialogDescription>
              添加新的第三方服務 API 密鑰
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">密鑰名稱</Label>
              <Input id="keyName" placeholder="例如：Claude API" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">服務提供商</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="選擇服務" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="apollo">Apollo.io</SelectItem>
                  <SelectItem value="meta">Meta (Instagram)</SelectItem>
                  <SelectItem value="n8n">N8N</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API 密鑰</Label>
              <Input id="apiKey" type="password" placeholder="輸入您的 API 密鑰" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rateLimit">速率限制 (每小時)</Label>
              <Input id="rateLimit" type="number" placeholder="1000" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddKeyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsAddKeyDialogOpen(false)}>
              添加密鑰
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}