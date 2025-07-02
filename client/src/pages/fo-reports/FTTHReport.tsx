import React, { useEffect, useState } from 'react';
import { Card } from '$app/components/cards/Card';
import { Tabs, Tab } from '$app/components/Tabs';
import { DataTable } from '$app/components/DataTable';
import { Button } from '$app/components/forms/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Default } from '$app/components/layouts/Default';
import { Page } from '$app/components/Breadcrumbs';

// Dummy data for initial scaffold
const dummySummary = {
  odc: 0,
  odp: 0,
  kabelLength: 0,
  clientFtth: 0,
};

const dummyBarData = [
  { name: 'ODC 1', ODPs: 10 },
  { name: 'ODC 2', ODPs: 7 },
  { name: 'ODC 3', ODPs: 14 },
];

const tabs: Tab[] = [
  { name: 'Overview', href: '#overview' },
  { name: 'Details', href: '#details' },
];

export default function FTTHReport() {
  // State for summary data
  const [summary] = useState(dummySummary);
  // State for bar chart data
  const [barData] = useState(dummyBarData);
  // State for active tab
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Breadcrumbs
  const pages: Page[] = [
    { name: 'FTTH Report', href: '/fo-reports' }
  ];

  // Fetch data on mount (replace with real API calls)
  useEffect(() => {
    // TODO: Fetch FTTH summary, bar chart, and table data from API
    // setSummary(...)
    // setBarData(...)
    // setTableData(...)
  }, []);

  // Export handlers (stub)
  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert('Export CSV not implemented yet');
  };
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('Export PDF not implemented yet');
  };

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  return (
    <Default title="FTTH Report" breadcrumbs={pages}>
      <Tabs tabs={tabs} />
      <div className="mt-6">
        {activeTabIndex === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card title="Total ODC">{summary.odc}</Card>
              <Card title="Total ODP">{summary.odp}</Card>
              <Card title="Total Kabel Length (m)">{summary.kabelLength}</Card>
              <Card title="Total Client FTTH">{summary.clientFtth}</Card>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">ODPs per ODC</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ODPs" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-2 mb-4">
              <Button onClick={handleExportCSV}>Export CSV</Button>
              <Button onClick={handleExportPDF}>Export PDF</Button>
            </div>
          </>
        )}
        {activeTabIndex === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-2">FTTH Details</h2>
            {/* Replace with real DataTable setup and columns */}
            <DataTable
              resource="ftth"
              columns={[]}
              endpoint="/api/v1/fo-lokasis" // Example endpoint
            />
          </>
        )}
        <div className="flex gap-2 mt-4">
          {tabs.map((tab, idx) => (
            <Button
              key={tab.name}
              type={activeTabIndex === idx ? 'primary' : 'secondary'}
              onClick={() => handleTabChange(idx)}
            >
              {tab.name}
            </Button>
          ))}
        </div>
      </div>
    </Default>
  );
}
