'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, Play, Pause, Settings } from 'lucide-react'

interface AIAgent {
  id: string
  name: string
  status: 'active' | 'inactive' | 'training'
  type: string
  lastActive: string
}

const mockAgents: AIAgent[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    status: 'active',
    type: 'Support',
    lastActive: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Sales Assistant',
    status: 'active',
    type: 'Sales',
    lastActive: '5 minutes ago'
  },
  {
    id: '3',
    name: 'Content Generator',
    status: 'training',
    type: 'Content',
    lastActive: '1 hour ago'
  },
  {
    id: '4',
    name: 'Data Analyzer',
    status: 'inactive',
    type: 'Analytics',
    lastActive: '2 hours ago'
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'training':
      return 'bg-yellow-500'
    case 'inactive':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    case 'training':
      return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Training</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    default:
      return <Badge variant="secondary">Unknown</Badge>
  }
}

export function AIAgentStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Agents Status
        </CardTitle>
        <CardDescription>
          Monitor and manage your AI agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockAgents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                <div>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {agent.type} • Last active {agent.lastActive}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(agent.status)}
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}