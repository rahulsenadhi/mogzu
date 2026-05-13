import React from 'react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { Building, Shield, Users, GitBranch, ArrowRight, CreditCard, LayoutGrid } from 'lucide-react';

export default function CompanySettingsPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sections = [
    {
      id: 'profile',
      title: 'Company Profile',
      description: 'Manage company details, GST info, and billing address.',
      icon: Building,
      action: () => navigate('/my-profile')
    },
    {
      id: 'roles',
      title: 'Roles & Permissions',
      description: 'Define booking limits and access levels for team members.',
      icon: Shield,
      action: () => navigate('/user-management')
    },
    {
      id: 'team',
      title: 'Team Members',
      description: 'Invite members, assign roles, and manage limits.',
      icon: Users,
      action: () => navigate('/user-management')
    },
    {
      id: 'workflow',
      title: 'Approval Workflow',
      description: 'Configure routing rules for booking approvals.',
      icon: GitBranch,
      action: () => navigate('/settings/workflow')
    },
    {
      id: 'billing',
      title: 'Payment Methods',
      description: 'Manage corporate cards and empanelled vendors.',
      icon: CreditCard,
      action: () => navigate('/wallet')
    },
    {
      id: 'dashboard-layout',
      title: 'Dashboard layout',
      description: 'Choose which sections appear on the home dashboard (including orders & deliveries hub).',
      icon: LayoutGrid,
      action: () => navigate('/company-settings/dashboard')
    }
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-['Inter'] overflow-hidden">
      <SharedSidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <MogzuCorporateScrollSurface>
          <div className="max-w-4xl mx-auto px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-['Montserrat']">Company Settings</h1>
            <p className="text-gray-500 mb-10">Manage your organization's details, team members, and corporate policies.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <div 
                    key={section.id} 
                    onClick={section.action}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 h-10">{section.description}</p>
                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Manage settings
                      <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}
