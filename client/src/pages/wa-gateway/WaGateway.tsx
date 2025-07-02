import { useState, useEffect } from "react";
import axios from "axios";
import { Default } from '$app/components/layouts/Default';
import { Page } from "$app/components/Breadcrumbs";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


interface Device {
  id: number;
  name: string;
  phone: string;
  url?: string;
  status: string;
}

export default function WAGateway() {
  const [t] = useTranslation();
  const pages: Page[] = [{ name: t('WhatsApp Gateway'), href: '/wa-gateway' }];
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [qrModalDevice, setQrModalDevice] = useState<Device | null>(null);



  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('X-API-TOKEN') ?? '';

      const response = await axios.get("http://localhost:8000/api/v1/devices", {
        headers: { 'X-API-TOKEN': token },
      });

      const allDevices: Device[] = response.data.data || [];

      setDevices(allDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      alert("Error fetching devices");
    }

    setLoading(false);
  };

  const handleSaveDevice = async () => {
    try {
      const token = localStorage.getItem('X-API-TOKEN') ?? '';

      if (isEditMode && selectedDevice) {
        await axios.put(
          `http://localhost:8000/api/v1/devices/${selectedDevice.id}`,
          { name, phone: phoneNumber },
          { headers: { 'X-API-TOKEN': token } }
        );
        alert("Device updated successfully");
      } else {
        await axios.post(
          "http://localhost:8000/api/v1/devices",
          { name, phone: phoneNumber },
          { headers: { 'X-API-TOKEN': token } }
        );
        alert("Device added successfully");
      }

      fetchDevices();
      setIsModalOpen(false);
      setSelectedDevice(null);
      setIsEditMode(false);
      setName("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error saving device:", error);
      alert("Failed to save device");
    }
  };

  const openEditModal = (device: Device) => {
    setIsEditMode(true);
    setSelectedDevice(device);
    setName(device.name);
    setPhoneNumber(device.phone);
    setIsModalOpen(true);
  };

  const connectQR = async (device: Device) => {
    try {
      const token = localStorage.getItem('X-API-TOKEN') ?? '';
      const response = await axios.post(
        `http://localhost:8000/api/v1/devices/${device.id}/connect`,
        {},
        {
          headers: {
            'X-API-TOKEN': token,
          },
        }
      );

      if (response.data?.url) {
        const updatedDevice: Device = {
          ...device,
          url: response.data.url,
        };
        setQrModalDevice(updatedDevice);

      } else {
        alert(response.data?.message || "Failed to generate QR Code");
      }
    } catch (error) {
      console.error("Error requesting QR:", error);
      alert("Failed to generate QR Code");
    }
  };

  const disconnectDevice = async (id: number) => {
    try {
      const token = localStorage.getItem('X-API-TOKEN') ?? '';
      await axios.post(
        `http://localhost:8000/api/v1/devices/${id}/disconnect`,
        {},
        {
          headers: {
            'X-API-TOKEN': token,
          },
        }
      );
      fetchDevices();
    } catch (error) {
      console.error("Error disconnecting device:", error);
      alert("Failed to disconnect device");
    }
  };

  const deleteDevice = async (id: number) => {
    if (!confirm("Are you sure want to delete this device?")) return;

    try {
      const token = localStorage.getItem('X-API-TOKEN') ?? '';
      await axios.delete(
        `http://localhost:8000/api/v1/devices/${id}`,
        {
          headers: {
            'X-API-TOKEN': token,
          },
        }
      );
      fetchDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Failed to delete device");
    }
  };


  return (
    <Default title="WhatsApp Gateway" breadcrumbs={pages} docsLink="en/wa-gateway">
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
            Add Device
          </button>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <table className="device-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(devices) ? (
                devices.map((device) => (
                  <tr key={device.id}>
                    <td>{device.name}</td>
                    <td>{device.phone}</td>
                    <td>
                      {device.status === 'connected' ? (
                        <button className="action-btn disconnect" style={{ backgroundColor: '#6a0dad', color: '#fff' }}
                          onClick={() => disconnectDevice(device.id)}
                        > Disconnect </button>
                      ) : (
                        <button className="action-btn connect"
                          onClick={() => connectQR(device)}
                        > Connect (QR) </button>
                      )}
                      <button
                        className="action-btn wa"
                        onClick={() => navigate(`/wa-gateway/chat/${device.id}`)}
                      >
                        💬 Pesan
                      </button>
                      <button
                        className="action-btn chatbot"
                        onClick={() => navigate(`/wa-gateway/chatbot/${device.id}`)}
                      >
                        🤖 Chatbot
                      </button>
                      <button
                        className="action-btn show"
                        onClick={() => openEditModal(device)}
                      >
                        ✏️ Edit
                      </button>
                      <button className="action-btn delete"
                        onClick={() => deleteDevice(device.id)}
                      > Delete </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3}>No devices found</td></tr>
              )}
            </tbody>
          </table>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{isEditMode ? 'Edit Device' : 'Add Device'}</h2>
              <input type="text" placeholder="Device Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              <div className="modal-actions">
                <button className="primary-btn" onClick={handleSaveDevice}>{isEditMode ? 'Update' : 'Save'}</button>
                <button className="cancel-btn" onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDevice(null);
                  setIsEditMode(false);
                  setName('');
                  setPhoneNumber('');
                }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {qrModalDevice && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>QR Code for {qrModalDevice.name}</h2>
              <img src={qrModalDevice.url} alt="QR Code" />
              <button className="cancel-btn" onClick={() => {
                setQrModalDevice(null);
                fetchDevices();
              }}
              >Close
              </button>
            </div>
          </div>
        )}

        <style>
          {`
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f6f9;
              color: #333;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
  
            .primary-btn {
              background-color: #007bff;
              color: white;
              padding: 10px 16px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background 0.2s ease;
              font-size: 14px;
            }
  
            .primary-btn:hover {
              background-color: #0056b3;
            }

            .action-btn.wa {
              background-color: #25d366;
              color: white;
              }

            .action-btn.wa:hover {
              background-color: #1ebe5d;
              }

            .action-btn.chatbot {
              background-color: #343a40;
              color: white;
              }

            .action-btn.chatbot:hover {
              background-color: #23272b;
              }

            .cancel-btn {
              background-color: #ccc;
              color: #333;
              padding: 8px 14px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              transition: background 0.2s ease;
            }

            .cancel-btn:hover {
              background-color: #bbb;
            }

            .device-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background-color: #fff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
  
            .device-table th, .device-table td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
              text-align: left;
            }
  
            .device-table th {
              background-color: #f8f8f8;
              font-weight: 600;
            }
  
            .device-table tr:hover {
              background-color: #f1f1f1;
            }
  
            .action-btn {
              margin-right: 5px;
              padding: 6px 12px;
              font-size: 12px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              transition: background 0.2s ease;
            }
  
            .action-btn.connect {
              background-color: #4CAF50;
              color: white;
            }
  
            .action-btn.connect:hover {
              background-color: #45a049;
            }
  
            .action-btn.show {
              background-color: #ffc107;
              color: #333;
            }
  
            .action-btn.show:hover {
              background-color: #e0a800;
            }
  
            .action-btn.delete {
              background-color: #dc3545;
              color: white;
            }
  
            .action-btn.delete:hover {
              background-color: #c82333;
            }
  
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              animation: fadeIn 0.3s forwards;
            }
  
            .modal {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              width: 320px;
              text-align: center;
            }
  
            .modal h2 {
              margin-bottom: 16px;
            }
  
            .modal input {
              width: 100%;
              padding: 10px;
              margin-bottom: 12px;
              border: 1px solid #ccc;
              border-radius: 4px;
              box-sizing: border-box;
            }
  
            .modal-actions {
              display: flex;
              justify-content: space-between;
            }
            
            .modal p {
              margin-bottom: 12px;
              color: #555;
              font-size: 14px;
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
  
            .loading {
              text-align: center;
              color: #555;
              margin-top: 20px;
            }
          `}
        </style>
      </div>
    </Default>
  );

}
