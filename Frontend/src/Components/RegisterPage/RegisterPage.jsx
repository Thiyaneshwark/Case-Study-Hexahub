import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification, { showToast } from '../Utils/ToastNotification';
import axios from 'axios';

const RegisterPage = () => {
  const [registerData, setRegisterData] = useState({
    userName: '',
    userMail: '',
    gender: '',
    phoneNumber: '',
    password: '',
    user_Type: '',
    branch: '',
    dept: '',
    designation: '',
    address: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:7287/api/Auth/register', registerData);
      showToast('Registration Successful!', 'success');
      navigate('/signin'); // Navigate to sign-in page after successful registration
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      console.error('Error during registration:', err);
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 h-400 bg-cover bg-center" style={{ backgroundImage: "url(https://cdn.mos.cms.futurecdn.net/5fz9SMYxWbv44jFVcD4vmd.jpg)" }}>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-8 h-1/2">
        <div className="w-full max-w-md mx-auto">
          <h2 className="mt-6 text-center text-2xl font-extrabold text-indigo-950">
            Register
          </h2>

          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-4" onSubmit={handleRegister}>
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="userName"
                placeholder="Username"
                value={registerData.userName}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="email"
                name="userMail"
                placeholder="Email"
                value={registerData.userMail}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="gender"
                placeholder="Gender"
                value={registerData.gender}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={registerData.phoneNumber}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="password"
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="user_Type"
                placeholder="User Type (Admin/Employee)"
                value={registerData.user_Type}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="branch"
                placeholder="Branch"
                value={registerData.branch}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="dept"
                placeholder="Department"
                value={registerData.dept}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="designation"
                placeholder="Designation"
                value={registerData.designation}
                onChange={handleChange}
              />
              <input
                className="text-black bg-white w-full px-3 py-2 border border-gray-300 rounded-md"
                type="text"
                name="address"
                placeholder="Address"
                value={registerData.address}
                onChange={handleChange}
              />
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-indigo-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Register
                </button>
              </div>
            </form>
            <ToastNotification />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;