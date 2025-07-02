import React, { useEffect, useState } from 'react';
import { Card } from '$app/components/cards/Card';
import { Spinner } from '$app/components/Spinner';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

// Custom tooltip for pie charts
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">Count: {data.value}</p>
        <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function Utilization() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coreUtil, setCoreUtil] = useState<any[]>([]);
  const [tubeUtil, setTubeUtil] = useState<any[]>([]);
  const [odpUtil, setOdpUtil] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalCores: 0,
    assignedCores: 0,
    totalTubes: 0,
    usedTubes: 0,
    totalOdps: 0,
    withClient: 0,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    request('GET', endpoint('/api/v1/ftth-statistics'))
      .then((response) => {
        const data = response.data.data;

        // Set summary data
        setSummary(data.utilization);

        // Calculate percentages for pie charts
        const coreUtilWithPercentages = data.charts.coreUtilization.map((item: any) => ({
          ...item,
          percentage: data.utilization.totalCores > 0 ? Math.round((item.value / data.utilization.totalCores) * 100) : 0
        }));
        const tubeUtilWithPercentages = data.charts.tubeUtilization.map((item: any) => ({
          ...item,
          percentage: data.utilization.totalTubes > 0 ? Math.round((item.value / data.utilization.totalTubes) * 100) : 0
        }));
        const odpUtilWithPercentages = data.charts.odpUtilization.map((item: any) => ({
          ...item,
          percentage: data.utilization.totalOdps > 0 ? Math.round((item.value / data.utilization.totalOdps) * 100) : 0
        }));

        // Set chart data
        setCoreUtil(coreUtilWithPercentages);
        setTubeUtil(tubeUtilWithPercentages);
        setOdpUtil(odpUtilWithPercentages);
      })
      .catch(() => setError('Failed to load utilization data.'))
      .finally(() => setLoading(false));
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Total Cores', summary.totalCores],
      ['Assigned Cores', summary.assignedCores],
      ['Total Tubes', summary.totalTubes],
      ['Used Tubes', summary.usedTubes],
      ['Total ODPs', summary.totalOdps],
      ['ODPs with Client', summary.withClient],
      ['Core Utilization (%)', summary.totalCores > 0 ? Math.round((summary.assignedCores / summary.totalCores) * 100) : 0],
      ['Tube Utilization (%)', summary.totalTubes > 0 ? Math.round((summary.usedTubes / summary.totalTubes) * 100) : 0],
      ['ODP Utilization (%)', summary.totalOdps > 0 ? Math.round((summary.withClient / summary.totalOdps) * 100) : 0],
    ];
    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ftth-utilization.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const handleExportPDF = async () => {
    const input = document.getElementById('ftth-utilization-dashboard');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ftth-utilization.pdf');
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Export CSV</button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Export PDF</button>
      </div>
      <div id="ftth-utilization-dashboard">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card title="Total Cores" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-blue-600">{summary.totalCores.toLocaleString()}</Card>
          <Card title="Assigned Cores" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-green-600">{summary.assignedCores.toLocaleString()}</Card>
          <Card title="Total Tubes" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-purple-600">{summary.totalTubes.toLocaleString()}</Card>
          <Card title="Used Tubes" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-orange-600">{summary.usedTubes.toLocaleString()}</Card>
          <Card title="Total ODPs" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-indigo-600">{summary.totalOdps.toLocaleString()}</Card>
          <Card title="ODPs with Client" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-teal-600">{summary.withClient.toLocaleString()}</Card>
          <Card title="Core Utilization (%)" childrenClassName="flex justify-center items-center text-2xl font-semibold min-h-[3rem] text-emerald-600">{summary.totalCores > 0 ? Math.round((summary.assignedCores / summary.totalCores) * 100) : 0}%</Card>
          <Card title="Tube Utilization (%)" childrenClassName="flex justify-center items-center text-2xl font-semibold min-h-[3rem] text-cyan-600">{summary.totalTubes > 0 ? Math.round((summary.usedTubes / summary.totalTubes) * 100) : 0}%</Card>
          <Card title="ODP Utilization (%)" childrenClassName="flex justify-center items-center text-2xl font-semibold min-h-[3rem] text-rose-600">{summary.totalOdps > 0 ? Math.round((summary.withClient / summary.totalOdps) * 100) : 0}%</Card>
        </div>

        {/* Utilization Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Core Utilization Chart */}
          <Card title="Core Utilization Analysis" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={coreUtil}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {coreUtil.map((entry, idx) => (
                      <Cell
                        key={`cell-core-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Distribution of core utilization (Assigned vs Available)
              </div>
            </div>
          </Card>

          {/* Tube Utilization Chart */}
          <Card title="Tube Utilization Analysis" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={tubeUtil}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {tubeUtil.map((entry, idx) => (
                      <Cell
                        key={`cell-tube-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Distribution of tube utilization (Used vs Available)
              </div>
            </div>
          </Card>

          {/* ODP Utilization Chart */}
          <Card title="ODP Utilization Analysis" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={odpUtil}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {odpUtil.map((entry, idx) => (
                      <Cell
                        key={`cell-odp-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Distribution of ODP utilization (With Client vs Available)
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Utilization Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="Core Efficiency Metrics" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{summary.totalCores > 0 ? Math.round((summary.assignedCores / summary.totalCores) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">Core Utilization Rate</div>
                <div className="text-sm text-gray-500">{summary.assignedCores} of {summary.totalCores} cores assigned</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Available Cores:</span>
                    <span className="font-semibold">{summary.totalCores - summary.assignedCores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Cores:</span>
                    <span className="font-semibold">{summary.assignedCores}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Tube Efficiency Metrics" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{summary.totalTubes > 0 ? Math.round((summary.usedTubes / summary.totalTubes) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">Tube Utilization Rate</div>
                <div className="text-sm text-gray-500">{summary.usedTubes} of {summary.totalTubes} tubes in use</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Available Tubes:</span>
                    <span className="font-semibold">{summary.totalTubes - summary.usedTubes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used Tubes:</span>
                    <span className="font-semibold">{summary.usedTubes}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="ODP Efficiency Metrics" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{summary.totalOdps > 0 ? Math.round((summary.withClient / summary.totalOdps) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">ODP Utilization Rate</div>
                <div className="text-sm text-gray-500">{summary.withClient} of {summary.totalOdps} ODPs have clients</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Available ODPs:</span>
                    <span className="font-semibold">{summary.totalOdps - summary.withClient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active ODPs:</span>
                    <span className="font-semibold">{summary.withClient}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
