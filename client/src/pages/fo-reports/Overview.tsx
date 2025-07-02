import React, { useEffect, useState } from 'react';
import { Card } from '$app/components/cards/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Spinner } from '$app/components/Spinner';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom tooltip for better data display
const CustomTooltip = ({ active, payload, label }: any) => {
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

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    lokasi: 0,
    odc: 0,
    odp: 0,
    kabel: 0,
    kabelLength: 0,
    clientFtth: 0,
    tubes: 0,
    cores: 0,
    odpUtilization: 0,
    kabelUtilization: 0,
  });
  const [odpsPerOdc, setOdpsPerOdc] = useState<any[]>([]);
  const [clientsPerOdp, setClientsPerOdp] = useState<any[]>([]);
  const [odpStatusPie, setOdpStatusPie] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    request('GET', endpoint('/api/v1/ftth-statistics'))
      .then((response) => {
        const data = response.data.data;

        // Set summary data
        setSummary(data.summary);

        // Set chart data
        setOdpsPerOdc(data.charts.odpsPerOdc);
        setClientsPerOdp(data.charts.clientsPerOdp);
        setOdpStatusPie(data.charts.odpStatusPie);
      })
      .catch(() => {
        setError('Failed to load FTTH data.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      ['Total Lokasi', summary.lokasi],
      ['Total ODC', summary.odc],
      ['Total ODP', summary.odp],
      ['Total Kabel ODC', summary.kabel],
      ['Total Kabel Length (m)', summary.kabelLength],
      ['Total Tubes', summary.tubes],
      ['Total Cores', summary.cores],
      ['Total Client FTTH', summary.clientFtth],
      ['ODP Utilization (%)', summary.odpUtilization],
      ['Kabel Utilization (%)', summary.kabelUtilization],
    ];
    const csvContent = csvRows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ftth-overview.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const handleExportPDF = async () => {
    const input = document.getElementById('ftth-overview-dashboard');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('ftth-overview.pdf');
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handleExportCSV} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Export CSV</button>
        <button onClick={handleExportPDF} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">Export PDF</button>
      </div>
      <div id="ftth-overview-dashboard">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-8">
          <Card title="Total Lokasi" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-blue-600">{summary.lokasi}</Card>
          <Card title="Total ODC" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-green-600">{summary.odc}</Card>
          <Card title="Total ODP" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-purple-600">{summary.odp}</Card>
          <Card title="Total Kabel ODC" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-yellow-600">{summary.kabel}</Card>
          <Card title="Total Kabel Length (m)" childrenClassName="flex justify-center items-center text-2xl font-bold min-h-[3rem] text-orange-600">{summary.kabelLength.toLocaleString()}</Card>
          <Card title="Total Tubes" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-red-600">{summary.tubes}</Card>
          <Card title="Total Cores" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-indigo-600">{summary.cores}</Card>
          <Card title="Total Client FTTH" childrenClassName="flex justify-center items-center text-3xl font-bold min-h-[3rem] text-teal-600">{summary.clientFtth}</Card>
          <Card title="ODP Utilization (%)" childrenClassName="flex justify-center items-center text-2xl font-semibold min-h-[3rem] text-emerald-600">{summary.odpUtilization}%</Card>
          <Card title="Kabel Utilization (%)" childrenClassName="flex justify-center items-center text-2xl font-semibold min-h-[3rem] text-cyan-600">{summary.kabelUtilization}%</Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* ODPs per ODC Chart */}
          <Card title="ODPs per ODC Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={odpsPerOdc} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    label={{ value: 'Number of ODPs', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="ODPs"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name="ODPs"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Shows the distribution of ODPs across different ODCs
              </div>
            </div>
          </Card>

          {/* Clients per ODP Chart */}
          <Card title="Clients per ODP Distribution" className="h-[550px]">
            <div className="p-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={clientsPerOdp} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    label={{ value: 'Number of Clients', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Clients"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                    name="Clients"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Shows the distribution of clients across different ODPs
              </div>
            </div>
          </Card>
        </div>

        {/* ODP Status Pie Chart - Full Width */}
        <Card title="ODP Status Breakdown" className="mb-8">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={odpStatusPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {odpStatusPie.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"][idx % 6]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-sm">Count: {data.value}</p>
                          <p className="text-sm">Percentage: {((data.value / odpStatusPie.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Distribution of ODPs by their current status (Active, Archived, Deleted, etc.)
            </div>
          </div>
        </Card>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card title="Infrastructure Efficiency" className="min-h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{summary.odpUtilization}%</div>
                <div className="text-lg text-gray-700 mb-2">ODP Utilization</div>
                <div className="text-sm text-gray-500">Active ODPs vs Total ODPs</div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{summary.kabelUtilization}%</div>
                <div className="text-lg text-gray-700 mb-2">Kabel Utilization</div>
                <div className="text-sm text-gray-500">Used Kabel vs Total Kabel</div>
              </div>
            </div>
          </Card>

          <Card title="Network Capacity" className="min-h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{summary.cores}</div>
                <div className="text-lg text-gray-700 mb-2">Total Cores</div>
                <div className="text-sm text-gray-500">Available for client connections</div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">{summary.tubes}</div>
                <div className="text-lg text-gray-700 mb-2">Total Tubes</div>
                <div className="text-sm text-gray-500">Fiber optic tubes</div>
              </div>
            </div>
          </Card>

          <Card title="Network Coverage" className="min-h-[300px]">
            <div className="p-4 h-full flex flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">{summary.kabelLength.toLocaleString()}</div>
                <div className="text-lg text-gray-700 mb-2">Total Length (m)</div>
                <div className="text-sm text-gray-500">Fiber optic cable deployed</div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{summary.clientFtth}</div>
                <div className="text-lg text-gray-700 mb-2">Connected Clients</div>
                <div className="text-sm text-gray-500">Active FTTH connections</div>
              </div>
            </div>
          </Card>


        </div>
      </div>
    </div>
  );
}
