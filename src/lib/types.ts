export interface User {
  id: string
  email: string
  name: string | null
  business_name: string | null
  avatar_url: string | null
  logo_url: string | null
  brand_color: string
  stripe_customer_id: string | null
  subscription_status: 'free' | 'pro' | 'cancelled'
  created_at: string
}

export interface PortalView {
  id: string
  project_id: string
  viewed_at: string
  user_agent: string | null
  referrer: string | null
}

export interface AnalyticsStats {
  totalViews: number
  weeklyViews: number
  dailyViews: number
  recentViews: { viewed_at: string }[]
}

export interface Project {
  id: string
  user_id: string
  name: string
  client_name: string
  client_email: string | null
  description: string | null
  share_token: string
  password_hash: string | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'not_started' | 'in_progress' | 'complete'
  order: number
  created_at: string
}

export interface Update {
  id: string
  project_id: string
  content: string
  attachment_url: string | null
  attachment_name: string | null
  created_at: string
}

export interface Deliverable {
  id: string
  project_id: string
  name: string
  description: string | null
  file_url: string
  file_size: number
  created_at: string
}

export interface ProjectWithDetails extends Project {
  milestones: Milestone[]
  updates: Update[]
  deliverables: Deliverable[]
}
