import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import CustomPagination from '../../Utils/CustomPagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faCircleRight, faThumbsUp, faTimes, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';


const ServiceRequest = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [assetAllocations, setAssetAllocations] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: 0,
    userId: '',
    assetName: '',
    assetId: '',
    serviceRequestDate: new Date().toISOString().split('T')[0],
    issue_Type: '',
    serviceDescription: '',
    serviceReqStatus: 'UnderReview',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const issueTypeMapping = {
    1: 'Malfunction',
    2: 'Repair',
    3: 'Installation',
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = Cookies.get('token');
      if (token) {
        const decode = jwtDecode(token);
        const userId = decode.nameid;

        if (userId) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            userId: userId,
          }));

          try {
            // Fetch service requests
            const serviceResponse = await axios.get('https://localhost:7287/api/ServiceRequests', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('Service Requests fetched:', serviceResponse.data);
            setServiceRequests(serviceResponse.data.$values || []);

            
          } catch (error) {
            setError('Error fetching data');
            console.error('Error fetching service requests:', error);
          } 
          try {
            const assetResponse = await axios.get(`https://localhost:7287/api/AssetAllocations/user/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('Asset Allocations fetched:', assetResponse.data);
            setAssetAllocations(assetResponse.data.$values || []);
          } catch (assetError) {
            console.error('Error fetching asset allocations:', assetError.response ? assetError.response.data : assetError.message);
            setAssetAllocations([]);
          }finally {
            setLoading(false);
          }
        } else {
          setError('User ID not found in token payload');
        }
      } else {
        setError('Token not found');
      }
    };

    fetchData();
  }, []);

  const handleAssetNameChange = (e) => {
    const selectedAssetName = e.target.value.trim();
    const selectedAsset = assetAllocations.find(asset => asset.assetName.toLowerCase() === selectedAssetName.toLowerCase());

    console.log("Selected Asset Name:", selectedAssetName);
    console.log("Available Assets:", assetAllocations);
    console.log("Selected Asset:", selectedAsset);

    if (selectedAsset) {
      console.log("Asset ID Found:", selectedAsset.assetId);
      setFormData({
        ...formData,
        assetName: selectedAssetName,
        assetId: selectedAsset.assetId
      });
    } else {
      console.warn("No matching asset found for:", selectedAssetName);
      setFormData({
        ...formData,
        assetName: selectedAssetName,
        assetId: ''
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Service Request:", formData);
    if (!formData.assetId || !formData.issue_Type || !formData.serviceDescription) {
      console.error("Form submission failed: Missing required fields");
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error("No token found");
        return;
      }
      const response = await axios.post(
        'https://localhost:7287/api/ServiceRequests',
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Service Request Submitted:", response.data);

      setFormData({
        serviceId: 0,
        userId: '',
        assetName: '',
        assetId: '',
        serviceRequestDate: new Date().toISOString().split('T')[0],
        issue_Type: '',
        serviceDescription: '',
        serviceReqStatus: 'UnderReview',
      });
      if (!formData.assetId || !formData.issue_Type || !formData.serviceDescription) {
        console.error("Form submission failed: Missing required fields");
        return;
      }
      
      setShowForm(false);
      setSuccessMessage('Service request sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      window.location.reload();

    } catch (error) {
      console.error("Error submitting service request:", error.response ? error.response.data : error.message);
    }
  };
  
  

  const navigate = useNavigate();
  
      const handleDashboardClick = () => {
          navigate('/dashboard'); // Navigate to the dashboard page
      };

      const handleAssetClick = () => {
        navigate('/Asset'); // Navigate to the dashboard page
    };

    const handleReturnRequest = () => {
      navigate('/ReturnRequest'); // Navigate to the dashboard page
  };

  // Calculate the index of the last item and the first item of the current page
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;

  // Slice the filteredRequests to get the requests for the current page
  const currentRequests = serviceRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="bg-indigo-950 text-white w-1/4 p-6">
        <h1 className="text-3xl font-bold mb-8">Asset Management</h1>
        <nav className="space-y-4">
          <button className="w-full text-left p-3 rounded hover:bg-indigo-800"
            onClick={handleDashboardClick}>
            Dashboard
          </button>
          <button className="w-full text-left p-3 rounded hover:bg-indigo-800"
           onClick={handleReturnRequest}>
            Return Request 
          </button>
          <button className="w-full text-left p-3 rounded hover:bg-indigo-800"
          onClick={handleAssetClick}>
            Assets
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-indigo-950">Service Requests</h1>
          <button
            className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600"
            onClick={() => setShowForm(true)}
          >
            + New Service Request
          </button>
        </div>

        {/* Content Section */}
        <section className="bg-white p-8 shadow-lg rounded-lg">
          {/* Loading/Error Messages */}
          {loading ? (
            <p>Loading service requests...</p>
          ) : error ? (
            <p className="text-center text-gray-500">
              No Service Requests Sent.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cards for Service Requests */}
              {currentRequests.map((request) => (
                <div
                  key={request.serviceId}
                  className="p-6 bg-indigo-50 rounded-lg shadow-md border border-gray-200"
                >
                  <h2 className="text-xl font-bold mb-2">
                    {request.assetName || "N/A"}
                  </h2>
                  <p className="text-gray-700 mb-1">
                    <strong>Service ID:</strong> {request.serviceId}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Request Date:</strong>{" "}
                    {new Date(
                      request.serviceRequestDate
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Issue:</strong>{" "}
                    {issueTypeMapping[request.issue_Type] || "Unknown"}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Status:</strong>{" "}
                    {request.serviceReqStatus === 0 ? (
                      <span className="text-blue-600 font-semibold">
                        <FontAwesomeIcon icon={faCircleExclamation} /> Under
                        Review
                      </span>
                    ) : request.serviceReqStatus === 1 ? (
                      <span className="text-yellow-500 font-semibold">
                        <FontAwesomeIcon icon={faThumbsUp} /> Approved
                      </span>
                    ) : request.serviceReqStatus === 2 ? (
                      <span className="text-green-500 font-semibold">
                        <FontAwesomeIcon icon={faCircleCheck} /> Completed
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        <FontAwesomeIcon icon={faXmark} /> Rejected
                      </span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    <strong>Description:</strong> {request.serviceDescription}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="flex justify-center mt-10">
          {/* Custom Pagination Component */}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-5 right-5 bg-green-500 text-white p-3 rounded shadow-lg">
            {successMessage}
          </div>
        )}
      </main>

      {/* Service Request Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-5 rounded shadow-lg w-1/3"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-950">
                Raise a Service Request
              </h3>
              <FontAwesomeIcon
                icon={faTimes}
                className="text-red-500 cursor-pointer"
                onClick={() => setShowForm(false)}
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
  type="text"
  value={formData.userId}
  readOnly
  className="w-full p-3 border rounded-lg text-gray-900 bg-white"
/>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Asset Name
  </label>
  <select
    value={formData.assetName}
    onChange={handleAssetNameChange}
    className="w-full p-3 border rounded-lg text-gray-900 bg-white"
    required
  >
    <option value="" disabled>
      Select an Asset
    </option>
    {assetAllocations.map((asset) => (
      <option key={asset.assetId} value={asset.assetName}>
        {asset.assetName}
      </option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Issue Type
  </label>
  <select
    value={formData.issue_Type}
    onChange={(e) =>
      setFormData({
        ...formData,
        issue_Type: parseInt(e.target.value),
      })
    }
    className="w-full p-3 border rounded-lg text-gray-900 bg-white"
    required
  >
    <option value="" disabled>
      Select Issue Type
    </option>
    {Object.keys(issueTypeMapping).map((key) => (
      <option key={key} value={key}>
        {issueTypeMapping[key]}
      </option>
    ))}
  </select>
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Description
  </label>
  <textarea
    value={formData.serviceDescription || ""}
    onChange={(e) =>
      setFormData({
        ...formData,
        serviceDescription: e.target.value,
      })
    }
    className="w-full p-3 border rounded-lg text-gray-900 bg-white"
    rows="4"
    placeholder="Describe the issue"
/>
</div>
              <button
                type="submit"
                className="w-full bg-indigo-950 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};


export default ServiceRequest;






