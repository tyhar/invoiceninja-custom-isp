import React, { useEffect, useState } from 'react';
import { Card } from '$app/components/cards/Card';
import { Spinner } from '$app/components/Spinner';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

// Custom tooltip for bar charts
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lokasiStatus, setLokasiStatus] = useState<any[]>([]);
  const [odcStatus, setOdcStatus] = useState<any[]>([]);
  const [odpStatus, setOdpStatus] = useState<any[]>([]);
  const [kabelStatus, setKabelStatus] = useState<any[]>([]);
  const [clientStatus, setClientStatus] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalLokasi: 0,
    activeLokasi: 0,
    totalOdc: 0,
    activeOdc: 0,
    totalOdp: 0,
    activeOdp: 0,
    totalKabel: 0,
    activeKabel: 0,
    totalClients: 0,
    activeClients: 0,
  });

  useEffect(() => {
    setLoading(true);
    setError(null);

    request('GET', endpoint('/api/v1/ftth-statistics'))
      .then((response) => {
        const data = response.data.data;

        // Set summary data
        setSummary(data.status);

        // Calculate percentages for all status charts
        const lokasiStatusWithPercentages = data.charts.lokasiStatus.map((item: any) => ({
          ...item,
          percentage: data.status.totalLokasi > 0 ? Math.round((item.value / data.status.totalLokasi) * 100) : 0
        }));
        const odcStatusWithPercentages = data.charts.odcStatus.map((item: any) => ({
          ...item,
          percentage: data.status.totalOdc > 0 ? Math.round((item.value / data.status.totalOdc) * 100) : 0
        }));
        const odpStatusWithPercentages = data.charts.odpStatusPie.map((item: any) => ({
          ...item,
          percentage: data.status.totalOdp > 0 ? Math.round((item.value / data.status.totalOdp) * 100) : 0
        }));
        const kabelStatusWithPercentages = data.charts.kabelStatus.map((item: any) => ({
          ...item,
          percentage: data.status.totalKabel > 0 ? Math.round((item.value / data.status.totalKabel) * 100) : 0
        }));
        const clientStatusWithPercentages = data.charts.clientStatus.map((item: any) => ({
          ...item,
          percentage: data.status.totalClients > 0 ? Math.round((item.value / data.status.totalClients) * 100) : 0
        }));
        const statusBreakdownWithPercentages = data.charts.statusBreakdown.map((item: any) => ({
          ...item,
          percentage: data.charts.statusBreakdown.reduce((sum: number, i: any) => sum + i.value, 0) > 0
            ? Math.round((item.value / data.charts.statusBreakdown.reduce((sum: number, i: any) => sum + i.value, 0)) * 100)
            : 0
        }));

        // Set chart data
        setLokasiStatus(lokasiStatusWithPercentages);
        setOdcStatus(odcStatusWithPercentages);
        setOdpStatus(odpStatusWithPercentages);
        setKabelStatus(kabelStatusWithPercentages);
        setClientStatus(clientStatusWithPercentages);
        setStatusBreakdown(statusBreakdownWithPercentages);
      })
      .catch(() => setError('Failed to load status data.'))
      .finally(() => setLoading(false));
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Total Lokasi', summary.totalLokasi],
      ['Active Lokasi', summary.activeLokasi],
      ['Total ODC', summary.totalOdc],
      ['Active ODC', summary.activeOdc],
      ['Total ODP', summary.totalOdp],
      ['Active ODP', summary.activeOdp],
      ['Total Kabel', summary.totalKabel],
      ['Active Kabel', summary.activeKabel],
      ['Total Clients', summary.totalClients],
      ['Active Clients', summary.activeClients],
      ['Lokasi Active Rate (%)', summary.totalLokasi > 0 ? Math.round((summary.activeLokasi / summary.totalLokasi) * 100) : 0],
      ['ODC Active Rate (%)', summary.totalOdc > 0 ? Math.round((summary.activeOdc / summary.totalOdc) * 100) : 0],
      ['ODP Active Rate (%)', summary.totalOdp > 0 ? Math.round((summary.activeOdp / summary.totalOdp) * 100) : 0],
      ['Kabel Active Rate (%)', summary.totalKabel > 0 ? Math.round((summary.activeKabel / summary.totalKabel) * 100) : 0],
      ['Client Active Rate (%)', summary.totalClients > 0 ? Math.round((summary.activeClients / summary.totalClients) * 100) : 0],
    ];
    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ftth-status.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const handleExportPDF = async () => {
    const input = document.getElementById('ftth-status-dashboard');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ftth-status.pdf');
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Export CSV</button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Export PDF</button>
      </div>
      <div id="ftth-status-dashboard">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card title="Total Lokasi" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-blue-600">{summary.totalLokasi.toLocaleString()}</Card>
          <Card title="Active Lokasi" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-green-600">{summary.activeLokasi.toLocaleString()}</Card>
          <Card title="Total ODC" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-purple-600">{summary.totalOdc.toLocaleString()}</Card>
          <Card title="Active ODC" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-orange-600">{summary.activeOdc.toLocaleString()}</Card>
          <Card title="Total ODP" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-indigo-600">{summary.totalOdp.toLocaleString()}</Card>
          <Card title="Active ODP" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-teal-600">{summary.activeOdp.toLocaleString()}</Card>
          <Card title="Total Kabel" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-yellow-600">{summary.totalKabel.toLocaleString()}</Card>
          <Card title="Active Kabel" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-red-600">{summary.activeKabel.toLocaleString()}</Card>
          <Card title="Total Clients" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-emerald-600">{summary.totalClients.toLocaleString()}</Card>
          <Card title="Active Clients" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-cyan-600">{summary.activeClients.toLocaleString()}</Card>
        </div>

        {/* Status Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Lokasi Status Chart */}
          <Card title="Lokasi Status Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={lokasiStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {lokasiStatus.map((entry, idx) => (
                      <Cell
                        key={`cell-lokasi-${idx}`}
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
                Distribution of Lokasi by status (Active, Archived, Deleted)
              </div>
            </div>
          </Card>

          {/* ODC Status Chart */}
          <Card title="ODC Status Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={odcStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {odcStatus.map((entry, idx) => (
                      <Cell
                        key={`cell-odc-${idx}`}
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
                Distribution of ODCs by status (Active, Archived, Deleted)
              </div>
            </div>
          </Card>

          {/* ODP Status Chart */}
          <Card title="ODP Status Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={odpStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {odpStatus.map((entry, idx) => (
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
                Distribution of ODPs by status (Active, Archived, Deleted)
              </div>
            </div>
          </Card>

          {/* Kabel Status Chart */}
          <Card title="Kabel Status Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={kabelStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={true}
                  >
                    {kabelStatus.map((entry, idx) => (
                      <Cell
                        key={`cell-kabel-${idx}`}
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
                Distribution of Kabel by status (Active, Archived, Deleted)
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Status Breakdown - Full Width */}
        <Card title="Overall Status Breakdown Across All Entities" className="mb-8">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  name="Count"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Overall distribution of all FTTH entities by their current status
            </div>
          </div>
        </Card>

        {/* Client Status Chart - Full Width */}
        <Card title="Client FTTH Status Distribution" className="mb-8">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={clientStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={true}
                >
                  {clientStatus.map((entry, idx) => (
                    <Cell
                      key={`cell-client-${idx}`}
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
              Distribution of Client FTTH connections by status (Active, Archived, Deleted)
            </div>
          </div>
        </Card>

        {/* Status Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="Infrastructure Status" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{summary.totalLokasi > 0 ? Math.round((summary.activeLokasi / summary.totalLokasi) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">Lokasi Active Rate</div>
                <div className="text-sm text-gray-500">{summary.activeLokasi} of {summary.totalLokasi} locations active</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Active ODCs:</span>
                    <span className="font-semibold">{summary.activeOdc}/{summary.totalOdc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active ODPs:</span>
                    <span className="font-semibold">{summary.activeOdp}/{summary.totalOdp}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Network Status" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{summary.totalKabel > 0 ? Math.round((summary.activeKabel / summary.totalKabel) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">Kabel Active Rate</div>
                <div className="text-sm text-gray-500">{summary.activeKabel} of {summary.totalKabel} cables active</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Active Cables:</span>
                    <span className="font-semibold">{summary.activeKabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive Cables:</span>
                    <span className="font-semibold">{summary.totalKabel - summary.activeKabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Client Status" className="h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{summary.totalClients > 0 ? Math.round((summary.activeClients / summary.totalClients) * 100) : 0}%</div>
                <div className="text-lg text-gray-700 mb-2">Client Active Rate</div>
                <div className="text-sm text-gray-500">{summary.activeClients} of {summary.totalClients} clients active</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Active Clients:</span>
                    <span className="font-semibold">{summary.activeClients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inactive Clients:</span>
                    <span className="font-semibold">{summary.totalClients - summary.activeClients}</span>
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
