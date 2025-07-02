import React from 'react';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';
import { Tabs, Tab } from '$app/components/Tabs';
import { Outlet } from 'react-router-dom';

const tabs: Tab[] = [
  { name: 'Overview', href: '/fo-reports/overview' },
  { name: 'Utilization', href: '/fo-reports/utilization' },
  { name: 'Status', href: '/fo-reports/status' },
  { name: 'Details', href: '/fo-reports/details' },
];

export default function FTTHReportsIndex() {
  const pages: Page[] = [
    { name: 'FTTH Reports', href: '/fo-reports' },
  ];
  return (
    <Default title="FTTH Reports" breadcrumbs={pages}>
      <Tabs tabs={tabs} />
      <div className="mt-6">
        <Outlet />
      </div>
    </Default>
  );
}
