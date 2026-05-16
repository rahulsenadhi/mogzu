import { useState } from 'react'
import { SharedHeader } from './layouts/SharedHeader'
import { SharedSidebar } from './layouts/SharedSidebar'
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface'
import { EventsDiscoveryNav } from './events/EventsDiscoveryNav'
import EventServiceContent from './EventServiceContent'

export default function EventServicePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen min-h-screen overflow-hidden mogzu-module-shell-bg">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} activeNav="activity" />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader variant="blended" onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search event services..." />
        <MogzuCorporateScrollSurface>
          <EventsDiscoveryNav activeTab="event-service" />

          <div className="max-w-7xl mx-auto px-6 pt-6 pb-6">
            <EventServiceContent />
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  )
}
