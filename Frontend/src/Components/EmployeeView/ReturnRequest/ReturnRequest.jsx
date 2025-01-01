import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import CustomPagination from '../../Utils/CustomPagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faTimes, faPaperPlane, faThumbsUp, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';


const ReturnRequest = () => {
    const [returnRequests, setReturnRequests] = useState([]);
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [showForm, setShowForm] = useState(false);

    const [assetAllocations, setAssetAllocations] = useState([]);
    const [formData, setFormData] = useState({
        assetId: '',
        userId: '',
        assetName: '',
        returnDate: new Date().toISOString().split('T')[0],
        condition: '',
        reason: '',
        returnStatus: '',
    });


    const navigate = useNavigate();

    const handleDashboardClick = () => {
        navigate('/dashboard'); // Navigate to the dashboard page
    };

    const handleAssetClick = () => {
        navigate('/Asset'); // Navigate to the dashboard page
    };

    const handleServiceClick = () => {
        navigate('/ServiceRequest'); // Navigate to the dashboard page
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Set the number of items per page

    const ConditionMapping = {
        0: 'Working',
        1: 'Damaged',
        2: 'Broken',
    };

    useEffect(() => {
        const fetchUserIdAndRequests = async () => {
            setLoading(true);
            // Fetch the token from cookies and decode it to get the userId
            const token = Cookies.get('token');
            if (token) {
                const decode = jwtDecode(token);
                console.log('Decoded token payload:', decode);
                // Extract the userId from the 'nameid' field
                const userId = decode.nameid;
                if (userId) {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        userId: userId // Set the userId in formData
                    }));

                    try {
                        // Fetch return requests first
                        const returnResponse = await axios.get('https://localhost:7287/api/ReturnRequests', {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        console.log('Return Requests fetched:', returnResponse.data);

                        // Set return requests regardless of the allocation fetch
                        setReturnRequests(returnResponse.data.$values || []);
                        
                    } catch (error) {
                        // Handle error fetching return requests if necessary
                        console.error('Error fetching return requests:', error.response ? error.response.data : error.message);
                        setError('Error fetching return requests: ' + (error.response ? error.response.data : 'Unknown error'));
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
                        // Log the error but do not set error state; just indicate no asset allocations were found
                        console.error('Error fetching asset allocations:', assetError.response ? assetError.response.data : assetError.message);
                        setAssetAllocations([]); // or handle it as needed
                    }
                    finally {
                        setLoading(false); // End loading
                    }

                } else {
                    setError('User ID not found in token payload');
                }
            } else {
                setError('Token not found');
            }
        };

        fetchUserIdAndRequests(); // Call the function to fetch data
    }, []); // Empty dependency array to run only on mount


    const handleAssetNameChange = (e) => {
        const selectedAssetName = e.target.value.trim();
        const selectedAsset = assetAllocations.find(asset => asset.assetName.toLowerCase() === selectedAssetName.toLowerCase());

        console.log("Selected Asset Name:", selectedAssetName);
        console.log("Available Assets:", assetAllocations);
        console.log("Selected Asset:", selectedAsset);

        if (selectedAsset) {
            console.log("Asset ID Found:", selectedAsset.assetId);
            console.log("Category Id found", selectedAsset.categoryId);
            setFormData({
                ...formData,
                assetName: selectedAssetName,
                assetId: selectedAsset.assetId,
                categoryId: selectedAsset.categoryId
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
        console.log("Submitting Return Request:", formData);
        try {
            const response = await axios.post('https://localhost:7287/api/ReturnRequests', {
                ...formData // Ensure that formData is correctly populated
            });
            console.log("Return Request Submitted:", response.data);
        } catch (error) {
            console.error("Error submitting return request:", error);
        }

        // Reset form after submission
        setFormData({

            assetId: '',
            userId: '',
            assetName: '',
            returnDate: new Date().toISOString().split('T')[0],
            condition: '',
            reason: '',
            returnStatus: '',
        });
        setShowForm(false);
        setSuccessMessage('Return request sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        window.location.reload();
    };

    // Calculate the index of the last item and the first item of the current page
    const indexOfLastRequest = currentPage * itemsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;

    // Slice the filteredRequests to get the requests for the current page
    const currentRequests = returnRequests.slice(indexOfFirstRequest, indexOfLastRequest);


    // const navigate = useNavigate();
    // const handleDashboardClick = () => {
    //     navigate(-2);
    // };

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
        onClick={handleServiceClick}>
          Services
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
        <h1 className="text-3xl font-bold text-indigo-950">Return Requests</h1>
        <button
          className="bg-red-500 text-white py-2 px-6 rounded hover:bg-red-600"
          onClick={() => setShowForm(true)}
        >
          + New Return Request
        </button>
      </div>

      {/* Content Section */}
      <section className="bg-white p-8 shadow-lg rounded-lg">
        {/* Loading/Error Messages */}
        {loading ? (
          <p>Loading return requests...</p>
        ) : error ? (
          <p className="text-center text-gray-500">No Return Requests Sent.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* Table for Return Requests */}
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr className="text-lg font-medium text-gray-700 border-b">
                  <th className="px-4 py-2">Return Id</th>
                  <th className="px-4 py-2">Asset Id</th>
                  <th className="px-4 py-2">Return Date</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Condition</th>
                  <th className="px-4 py-2">Request Status</th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((request) => (
                  <tr key={request.returnId} className="text-lg border-b text-black">
                    <td className="px-4 py-2">{request.returnId}</td>
                    <td className="px-4 py-2">{request.assetId}</td>
                    <td className="px-4 py-2">
                      {new Date(request.returnDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{request.reason}</td>
                    <td className="px-4 py-2">{request.condition}</td>
                    <td className="px-4 py-2">
                      {request.returnStatus === 0 ? (
                        <span className="text-blue-600 font-semibold">
                          <FontAwesomeIcon icon={faPaperPlane} /> Sent
                        </span>
                      ) : request.returnStatus === 1 ? (
                        <span className="text-yellow-500 font-semibold">
                          <FontAwesomeIcon icon={faThumbsUp} /> Approved
                        </span>
                      ) : request.returnStatus === 2 ? (
                        <span className="text-green-500 font-semibold">
                          <FontAwesomeIcon icon={faCircleCheck} /> Returned
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          <FontAwesomeIcon icon={faCircleXmark} /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center mt-10">
        {/* Custom Pagination Component */}
        <CustomPagination
          currentPage={currentPage}
          totalItems={returnRequests.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white p-3 rounded shadow-lg">
          {successMessage}
        </div>
      )}
    </main>

    {/* Return Request Form (Modal) */}
    {showForm && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <form
          onSubmit={handleFormSubmit}
          className="bg-white p-5 rounded shadow-lg text-center w-1/4"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex-grow text-center">
              <h3 className="text-lg text-indigo-950 font-bold">Return Request</h3>
            </div>
            <FontAwesomeIcon
              icon={faTimes}
              className="text-red-500 cursor-pointer ml-2"
              onClick={() => setShowForm(false)}
            />
          </div>

          <div className="flex flex-col space-y-4 mt-4">
            {/* User ID Field */}
            <div className="relative">
              <label className="absolute -top-3 left-3 px-1 bg-white text-sm font-semibold text-slate-500">
                User ID
              </label>
              <input
                type="text"
                value={formData.userId}
                placeholder="User ID"
                readOnly
                className="p-3 border-2 bg-white border-slate-200 rounded w-full text-indigo-950 focus:outline-none"
              />
            </div>

            {/* Asset Name Dropdown */}
            <div className="relative">
              <label className="absolute -top-3 left-3 px-1 bg-white text-sm font-semibold text-slate-500">
                Asset Name
              </label>
              <select
                value={formData.assetName}
                onChange={handleAssetNameChange}
                className="p-3 border-2 bg-white border-slate-200 rounded w-full text-indigo-950 focus:outline-none"
                required
              >
                <option value="" disabled>
                  Select an Asset
                </option>
                {assetAllocations.map((allocation) => (
                  <option
                    key={allocation.userId}
                    value={allocation.assetName}
                    className="bg-indigo-950 text-slate-200"
                  >
                    {allocation.assetName}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Condition Dropdown */}
            <div className="relative">
              <label className="absolute -top-3 left-3 px-1 bg-white text-sm font-semibold text-slate-500">
                Asset Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="p-3 border-2 bg-white border-slate-200 rounded w-full text-indigo-950 focus:outline-none"
                required
              >
                <option value="" disabled>
                  Select Asset Condition
                </option>
                {Object.keys(ConditionMapping).map((key) => (
                  <option
                    key={key}
                    value={ConditionMapping[key]}
                    className="bg-indigo-950 text-slate-200"
                  >
                    {ConditionMapping[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Return Reason */}
            <div className="relative">
              <label className="absolute -top-3 left-3 px-1 bg-white text-sm font-semibold text-slate-500">
                Return Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Describe the reason"
                className="p-3 border-2 bg-white border-slate-200 rounded w-full text-indigo-950 focus:outline-none"
                rows="4"
              />
            </div>

            <button
              type="submit"
              className="bg-indigo-950 text-white px-4 py-2 rounded mt-4"
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
    
    export default ReturnRequest; 