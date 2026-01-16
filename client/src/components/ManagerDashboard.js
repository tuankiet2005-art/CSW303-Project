import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import api from '../services/auth';
import './Dashboard.css';

function ManagerDashboard({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('leave-requests');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    username: '',
    password: '',
    name: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    username: ''
  });
  const [editingLeaveRequest, setEditingLeaveRequest] = useState(null);
  const [leaveRequestForm, setLeaveRequestForm] = useState({
    date: '',
    timePeriod: 'all day',
    reason: ''
  });
  const [showCreateLeaveForm, setShowCreateLeaveForm] = useState(false);
  const [createLeaveForm, setCreateLeaveForm] = useState({
    userId: '',
    date: '',
    timePeriod: 'all day',
    reason: ''
  });
  const [leaveRequestFilters, setLeaveRequestFilters] = useState({
    employeeId: '',
    status: '',
    month: ''
  });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyAttendanceDate, setMonthlyAttendanceDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    userId: '',
    amount: '',
    reason: ''
  });
  const [editingAdvanceRequest, setEditingAdvanceRequest] = useState(null);
  const [advanceRequestFilter, setAdvanceRequestFilter] = useState({
    employeeId: ''
  });
  const [editingSalary, setEditingSalary] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    salary: '',
    advanceAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'leave-requests') {
      fetchLeaveRequests();
      fetchEmployees(); // Need to display employee list in the creation form
    } else if (activeTab === 'salary') {
      fetchEmployees();
      fetchAdvanceRequests(); // Need to calculate advanced amount and display list
      fetchLeaveRequests(); // Need to calculate number of days off
    } else if (activeTab === 'advance-salary') {
      fetchAdvanceRequests();
      fetchEmployees();
    } else if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'attendance' || activeTab === 'monthly-attendance') {
      fetchLeaveRequests();
      fetchEmployees();
    }
  }, [activeTab, attendanceDate, monthlyAttendanceDate, salaryMonth]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leave-requests');
      setLeaveRequests(response.data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.filter(u => u.role === 'employee'));
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchAdvanceRequests = async () => {
    try {
      const response = await api.get('/advance-requests');
      setAdvanceRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching advance requests:', err);
      setAdvanceRequests([]);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/users', employeeForm);
      setShowEmployeeForm(false);
      setEmployeeForm({ username: '', password: '', name: '' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEditForm({
      name: employee.name,
      username: employee.username
    });
    setShowEmployeeForm(false);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/users/${editingEmployee.id}`, editForm);
      setEditingEmployee(null);
      setEditForm({ name: '', username: '' });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Reset password for ${name}:\n(Leaving it blank will use the default password: 123456)`);
    if (newPassword === null) return; // User cancelled

    try {
      const response = await api.patch(`/users/${id}/reset-password`, {
        newPassword: newPassword || undefined
      });
      alert(`Password reset successful!\nNew password: ${response.data.defaultPassword || newPassword}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Removing this employee?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.error || 'Error');
      }
    }
  };

  const handleEditLeaveRequest = (request) => {
    setEditingLeaveRequest(request);
    if (request.date) {
      setLeaveRequestForm({
        date: request.date,
        timePeriod: request.timePeriod || 'all day',
        reason: request.reason
      });
    } else {
      // Old format - convert to new format for editing
      setLeaveRequestForm({
        date: request.startDate,
        timePeriod: request.startTimePeriod || 'all day',
        reason: request.reason
      });
    }
  };

  const handleUpdateLeaveRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/leave-requests/${editingLeaveRequest.id}`, leaveRequestForm);
      setEditingLeaveRequest(null);
      setLeaveRequestForm({ date: '', timePeriod: 'all day', reason: '' });
      fetchLeaveRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeaveRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/leave-requests', createLeaveForm);
      setShowCreateLeaveForm(false);
      setCreateLeaveForm({ userId: '', date: '', timePeriod: 'all day', reason: '' });
      fetchLeaveRequests();
      alert('Leave request successfully created!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveRequest = async (id) => {
    if (window.confirm('Deleting this leave request?')) {
      try {
        await api.delete(`/leave-requests/${id}`);
        fetchLeaveRequests();
      } catch (err) {
        alert(err.response?.data?.error || 'Error');
      }
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/leave-requests/${id}/status`, { status });
      fetchLeaveRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleAdvanceStatusChange = async (id, status) => {
    try {
      await api.patch(`/advance-requests/${id}/status`, { status });
      fetchAdvanceRequests();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleDeleteAdvanceRequest = async (id) => {
    if (window.confirm('Deleting this salary advance request?')) {
      try {
        await api.delete(`/advance-requests/${id}`);
        fetchAdvanceRequests();
      } catch (err) {
        alert(err.response?.data?.error || 'Error');
      }
    }
  };

  const handleEditAdvanceRequest = (request) => {
    setEditingAdvanceRequest(request);
    setAdvanceForm({
      userId: request.userId.toString(),
      amount: request.amount.toString(),
      reason: request.reason
    });
    setShowAdvanceForm(false);
  };

  const handleUpdateAdvanceRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/advance-requests/${editingAdvanceRequest.id}`, advanceForm);
      setEditingAdvanceRequest(null);
      setAdvanceForm({ userId: '', amount: '', reason: '' });
      fetchAdvanceRequests();
      alert('Salary advance request successfully updated!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/advance-requests', advanceForm);
      setShowAdvanceForm(false);
      setAdvanceForm({ userId: '', amount: '', reason: '' });
      fetchAdvanceRequests();
      fetchEmployees(); // Refresh để có danh sách nhân viên mới nhất
      alert('Salary advance request successfully created!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Tính số tiền thực còn (giống công thức tính lương hiện tại của nhân viên)
  const calculateRemainingSalaryForForm = (employeeId, totalSalary, advanceAmount) => {
    if (!totalSalary || totalSalary <= 0) {
      return 0;
    }

    const today = new Date();
    const [year, month] = salaryMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getDate();
    
    // Kiểm tra xem tháng được chọn có phải tháng hiện tại không
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
    const daysToCalculate = isCurrentMonth ? currentDay : daysInMonth;

    // Lương 1 ngày = Tổng lương / Tổng ngày trong tháng
    const dailySalary = totalSalary / daysInMonth;

    // Tính số tiền đã ứng (dùng giá trị từ form)
    const advance = parseFloat(advanceAmount) || 0;

    // Tính số ngày nghỉ trong tháng (chỉ tính đến hôm nay nếu là tháng hiện tại)
    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const endDate = isCurrentMonth ? todayStart : monthEnd;

    let leaveShifts = 0; // Tổng số ca nghỉ
    (leaveRequests || []).forEach(req => {
      if (!req || req.status !== 'approved' || !req.date || req.userId !== employeeId) return;
      
      const dateStr = req.date;
      const [reqYear, reqMonth, reqDay] = dateStr.split('-').map(Number);
      const leaveDate = new Date(reqYear, reqMonth - 1, reqDay);
      leaveDate.setHours(0, 0, 0, 0);
      
      // Chỉ tính các ngày nghỉ trong tháng được chọn và <= endDate
      if (leaveDate >= monthStart && leaveDate <= endDate) {
        const timePeriod = (req.timePeriod || 'all day').toLowerCase();
        if (timePeriod === 'all day') {
          leaveShifts += 2; // Nghỉ cả ngày = 2 ca
        } else if (timePeriod === 'morning' || timePeriod === 'afternoon' || 
                   timePeriod === 'morning shift' || timePeriod === 'afternoon shift') {
          leaveShifts += 1; // Nghỉ 1 ca = 1 ca
        }
      }
    });
    
    // Tính số ngày nghỉ: 2 ca = 1 ngày, 1 ca = 0.5 ngày
    const leaveDays = leaveShifts / 2;

    // Lương hiện tại = ((Tổng lương / Tổng ngày trong tháng) × Số ngày từ đầu tháng đến hôm nay) - Số tiền ứng - (Số ngày nghỉ × Lương 1 ngày)
    const leaveDeduction = leaveDays * dailySalary;
    const currentSalary = (dailySalary * daysToCalculate) - advance - leaveDeduction;

    return Math.ceil(Math.max(0, currentSalary));
  };

  const handleEditSalary = async (employee) => {
    try {
      const response = await api.get(`/users/${employee.id}/salary/${salaryMonth}`);
      const salary = response.data.salary || '';
      
      // Tính số tiền đã ứng trong tháng
      let advanceAmount = 0;
      if (advanceRequests && Array.isArray(advanceRequests)) {
        const monthStart = new Date(salaryMonth + '-01');
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        
        advanceAmount = advanceRequests
          .filter(req => {
            if (!req || req.userId !== employee.id || req.status !== 'approved') {
              return false;
            }
            const reqDate = new Date(req.submittedAt);
            reqDate.setHours(0, 0, 0, 0);
            return reqDate >= monthStart && reqDate <= monthEnd;
          })
          .reduce((sum, req) => sum + (req.amount || 0), 0);
      }
      
      setEditingSalary(employee);
      setSalaryForm({ salary, advanceAmount: advanceAmount || '' });
    } catch (err) {
      setEditingSalary(employee);
      setSalaryForm({ salary: '', advanceAmount: '' });
    }
  };

  const handleSetSalary = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!salaryForm.salary) {
    setError("Month and salary are required"); // ✅ ALREADY FIXED
    setLoading(false);
    return;
    }

    try {
      // Set lương
      await api.post(`/users/${editingSalary.id}/salary`, {
        month: salaryMonth,
        salary: parseFloat(salaryForm.salary)
      });

      // Handle salary advance
      const advanceAmount = parseFloat(salaryForm.advanceAmount) || 0;
      
      // Fetch advance requests mới nhất trước khi tính toán
      const latestAdvanceResponse = await api.get('/advance-requests');
      const latestAdvanceRequests = latestAdvanceResponse.data || [];
      
      // Tính số tiền đã ứng hiện tại trong tháng
      const monthStart = new Date(salaryMonth + '-01');
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const currentAdvanceRequests = latestAdvanceRequests.filter(req => {
        if (!req || req.userId !== editingSalary.id || req.status !== 'approved') {
          return false;
        }
        const reqDate = new Date(req.submittedAt);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate >= monthStart && reqDate <= monthEnd;
      });
      
      const currentAdvance = currentAdvanceRequests.reduce((sum, req) => sum + (req.amount || 0), 0);

      // Nếu số tiền mới khác số tiền cũ
      if (Math.abs(advanceAmount - currentAdvance) > 0.01) {
        // Xóa tất cả ứng lương cũ trong tháng
        for (const req of currentAdvanceRequests) {
          try {
            await api.delete(`/advance-requests/${req.id}`);
          } catch (err) {
            console.error('Error deleting advance request:', err);
          }
        }
        
        // Tạo ứng lương mới nếu số tiền > 0
        if (advanceAmount > 0) {
          await api.post('/advance-requests', {
            userId: editingSalary.id,
            amount: advanceAmount,
            reason: 'Monthly salary advance ' + new Date(salaryMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
        }
      }

      // Refresh data TRƯỚC KHI đóng form để đảm bảo state được cập nhật
      await fetchAdvanceRequests();
      await fetchEmployees();
      
      // Đợi một chút để đảm bảo state được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setEditingSalary(null);
      setSalaryForm({ salary: '', advanceAmount: '' });
      
      alert('Salary setting successful!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#ff9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Awaiting approval';
    }
  };

  // Check if employee is on leave for a specific date and shift
  const getEmployeeLeaveStatus = (employeeId, checkDate) => {
    const approvedRequests = leaveRequests.filter(
      req => req.userId === employeeId && req.status === 'approved'
    );

    let morningLeave = false;
    let afternoonLeave = false;

    for (const request of approvedRequests) {
      // New format: single date
      if (request.date) {
        const requestDate = new Date(request.date).toISOString().split('T')[0];
        if (requestDate === checkDate) {
          const timePeriod = request.timePeriod || 'all day';
          if (timePeriod === 'all day' || timePeriod === 'morning') {
            morningLeave = true;
          }
          if (timePeriod === 'all day' || timePeriod === 'afternoon') {
            afternoonLeave = true;
          }
        }
      }
      // Old format: date range
      if (request.startDate && request.endDate) {
        const startDate = new Date(request.startDate).toISOString().split('T')[0];
        const endDate = new Date(request.endDate).toISOString().split('T')[0];
        if (checkDate >= startDate && checkDate <= endDate) {
          // For old format, check startTimePeriod and endTimePeriod
          const startPeriod = request.startTimePeriod || 'all day';
          const endPeriod = request.endTimePeriod || 'all day';
          
          // If it's the start date, use startPeriod
          if (checkDate === startDate) {
            if (startPeriod === 'all day' || startPeriod === 'morning') {
              morningLeave = true;
            }
            if (startPeriod === 'all day' || startPeriod === 'afternoon') {
              afternoonLeave = true;
            }
          }
          // If it's the end date, use endPeriod
          else if (checkDate === endDate) {
            if (endPeriod === 'all day' || endPeriod === 'morning') {
              morningLeave = true;
            }
            if (endPeriod === 'all day' || endPeriod === 'afternoon') {
              afternoonLeave = true;
            }
          }
          // If it's in between, assume all day
          else {
            morningLeave = true;
            afternoonLeave = true;
          }
        }
      }
    }

    return {
      morning: morningLeave ? 'not yet working' : 'working',
      afternoon: afternoonLeave ? 'not yet working' : 'working'
    };
  };

  // Get attendance status for all employees
  const getAttendanceStatus = () => {
    return employees
      .map(employee => {
        const leaveStatus = getEmployeeLeaveStatus(employee.id, attendanceDate);
        return {
          ...employee,
          morningStatus: leaveStatus.morning,
          afternoonStatus: leaveStatus.afternoon
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi')); // Sort by name
  };

  // Group employees by attendance status
  const getGroupedAttendance = () => {
    const statusList = getAttendanceStatus();
    const presentFull = []; // Present for both shifts
    const presentMorning = []; // Present for morning shift only
    const presentAfternoon = []; // Present for afternoon shift only
    const absent = []; // Absent for both shifts

    statusList.forEach(emp => {
      const morningPresent = emp.morningStatus === 'working';
      const afternoonPresent = emp.afternoonStatus === 'working';
      
      if (morningPresent && afternoonPresent) {
       // Present for both shifts
        presentFull.push(emp);
      } else if (morningPresent && !afternoonPresent) {
        // Present for morning shift only
        presentMorning.push(emp);
      } else if (!morningPresent && afternoonPresent) {
        // Present for afternoon shift only
        presentAfternoon.push(emp);
      } else {
        // Absent for both shifts
        absent.push(emp);
      }
    });

    return { presentFull, presentMorning, presentAfternoon, absent };
  };

  // Get monthly attendance data
  const getMonthlyAttendance = () => {
    const [year, month] = monthlyAttendanceDate.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return employees.map(employee => {
      const dailyStatus = days.map(day => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const leaveStatus = getEmployeeLeaveStatus(employee.id, dateStr);
        return {
          day,
          morning: leaveStatus.morning === 'working',
          afternoon: leaveStatus.afternoon === 'working'
        };
      });
      
      return {
        ...employee,
        dailyStatus
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    const statusList = getAttendanceStatus();
    const total = statusList.length;
    let morningPresent = 0;
    let morningAbsent = 0;
    let afternoonPresent = 0;
    let afternoonAbsent = 0;

    statusList.forEach(emp => {
      if (emp.morningStatus === 'working') morningPresent++;
      else morningAbsent++;
      if (emp.afternoonStatus === 'working') afternoonPresent++;
      else afternoonAbsent++;
    });

    return {
      total,
      morningPresent,
      morningAbsent,
      afternoonPresent,
      afternoonAbsent
    };
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Hello, {user.name}</h1>
          <p>Manager</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Log out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={activeTab === 'leave-requests' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('leave-requests')}
          >
            Leave of absence request
          </button>
          <button
            className={activeTab === 'employees' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('employees')}
          >
            Personnel management
          </button>
          <button
            className={activeTab === 'attendance' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={activeTab === 'monthly-attendance' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('monthly-attendance')}
          >
            Monthly attendance
          </button>
          <button
            className={activeTab === 'salary' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('salary')}
          >
            Payroll management
          </button>
          <button
            className={activeTab === 'advance-salary' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('advance-salary')}
          >
            Advance salary
          </button>
        </div>

        {activeTab === 'leave-requests' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>All leave requests</h2>
              <button 
                onClick={() => setShowCreateLeaveForm(!showCreateLeaveForm)} 
                className="primary-button"
              >
                {showCreateLeaveForm ? 'Cancel' : '+ Create leave requests for employees'}
              </button>
            </div>

            {showCreateLeaveForm && (
              <form onSubmit={handleCreateLeaveRequest} className="leave-form" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Create leave requests for employees</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label>Select employees</label>
                  <select
                    value={createLeaveForm.userId}
                    onChange={(e) => setCreateLeaveForm({ ...createLeaveForm, userId: e.target.value })}
                    required
                  >
                    <option value="">-- Select employees --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Day off</label>
                    <input
                      type="date"
                      value={createLeaveForm.date}
                      onChange={(e) => setCreateLeaveForm({ ...createLeaveForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Shift off</label>
                    <select
                      value={createLeaveForm.timePeriod}
                      onChange={(e) => setCreateLeaveForm({ ...createLeaveForm, timePeriod: e.target.value })}
                      required
                    >
                      <option value="all day">All day</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    value={createLeaveForm.reason}
                    onChange={(e) => setCreateLeaveForm({ ...createLeaveForm, reason: e.target.value })}
                    rows="4"
                    placeholder="Enter reason for leave (optional)..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Creating...' : 'Create a leave request'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateLeaveForm(false);
                      setCreateLeaveForm({ userId: '', date: '', timePeriod: 'all day', reason: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {editingLeaveRequest && (
              <form onSubmit={handleUpdateLeaveRequest} className="leave-form" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Editing leave request: {editingLeaveRequest.userName}</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Day off</label>
                    <input
                      type="date"
                      value={leaveRequestForm.date}
                      onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Shift off</label>
                    <select
                      value={leaveRequestForm.timePeriod}
                      onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, timePeriod: e.target.value })}
                      required
                    >
                      <option value="all day">All day</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    value={leaveRequestForm.reason}
                    onChange={(e) => setLeaveRequestForm({ ...leaveRequestForm, reason: e.target.value })}
                    rows="4"
                    placeholder="Enter reason for leave (optional)..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Updating' : 'Update'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingLeaveRequest(null);
                      setLeaveRequestForm({ date: '', timePeriod: 'all day', reason: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Filter */}
            <div style={{ 
              background: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#333' }}>Filter</h3>
              <div className="form-row" style={{ marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Employees</label>
                  <select
                    value={leaveRequestFilters.employeeId}
                    onChange={(e) => setLeaveRequestFilters({ ...leaveRequestFilters, employeeId: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="">All employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>States</label>
                  <select
                    value={leaveRequestFilters.status}
                    onChange={(e) => setLeaveRequestFilters({ ...leaveRequestFilters, status: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="">All states</option>
                    <option value="pending">Awaiting approval</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Month</label>
                  <input
                    type="month"
                    value={leaveRequestFilters.month}
                    onChange={(e) => setLeaveRequestFilters({ ...leaveRequestFilters, month: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setLeaveRequestFilters({ employeeId: '', status: '', month: '' })}
                    className="logout-button"
                    style={{ width: '100%' }}
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            </div>

            <div className="requests-list">
              {(() => {
                // Filter leave request list
                let filteredRequests = leaveRequests;
                
                // Filter by employee
                if (leaveRequestFilters.employeeId) {
                  filteredRequests = filteredRequests.filter(
                    req => req.userId === parseInt(leaveRequestFilters.employeeId)
                  );
                }
                
                // Filter by status
                if (leaveRequestFilters.status) {
                  filteredRequests = filteredRequests.filter(
                    req => req.status === leaveRequestFilters.status
                  );
                }
                
                // Filter by month
                if (leaveRequestFilters.month) {
                  filteredRequests = filteredRequests.filter(req => {
                    const requestDate = req.date || req.startDate;
                    if (!requestDate) return false;
                    const requestMonth = requestDate.substring(0, 7); // YYYY-MM
                    return requestMonth === leaveRequestFilters.month;
                  });
                }
                
                return filteredRequests.length === 0 ? (
                  <p className="empty-message">No leave requests match the filter.</p>
                ) : (
                  <>
                    <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                      Display {filteredRequests.length} / {leaveRequests.length} leave request
                    </p>
                    {filteredRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{request.userName}</h3>
                        <p className="request-date">
                          {request.date ? new Date(request.date).toLocaleDateString('en-US') : 
                           request.startDate ? new Date(request.startDate).toLocaleDateString('en-US') : ''}
                          {request.timePeriod && ` (${request.timePeriod})`}
                          {request.startTimePeriod && !request.timePeriod && ` (${request.startTimePeriod})`}
                          {request.endDate && request.startDate !== request.endDate && 
                           ` - ${new Date(request.endDate).toLocaleDateString('en-US')}`}
                          {request.endTimePeriod && request.startTimePeriod !== request.endTimePeriod && 
                           !request.timePeriod && ` (${request.endTimePeriod})`}
                        </p>
                      </div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <p className="request-reason">{request.reason}</p>
                    <div className="request-footer">
                      <span className="request-time">
                        Submitted at: {new Date(request.submittedAt).toLocaleString('vi-VN')}
                      </span>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditLeaveRequest(request)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLeaveRequest(request.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                        {request.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'approved')}
                            className="approve-button"
                          >
                            Approve
                          </button>
                        )}
                        {request.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            className="reject-button"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                    ))
                  }
                </>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Employee list</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={async () => {
                    try {
                      const response = await api.post('/users/bulk-setup');
                      alert(response.data.message);
                      fetchEmployees();
                    } catch (err) {
                      alert(err.response?.data?.error || 'Error');
                    }
                  }} 
                  className="primary-button"
                  style={{ background: '#4caf50' }}
                >
                  Set up list
                </button>
                <button onClick={() => setShowEmployeeForm(!showEmployeeForm)} className="primary-button">
                  {showEmployeeForm ? 'Cancel' : '+ Create employee accounts'}
                </button>
              </div>
            </div>

            {showEmployeeForm && (
              <form onSubmit={handleCreateEmployee} className="employee-form">
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={employeeForm.username}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, username: e.target.value })}
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={employeeForm.password}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                      required
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <button type="submit" disabled={loading} className="primary-button">
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </form>
            )}

            {editingEmployee && (
              <form onSubmit={handleUpdateEmployee} className="employee-form" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Edit employee: {editingEmployee.name}</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Full name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      required
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingEmployee(null);
                      setEditForm({ name: '', username: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="employees-list">
              {employees.length === 0 ? (
                <p className="empty-message">No staff yet</p>
              ) : (
                <table className="employees-table">
                  <thead>
                    <tr>
                      <th>Full name</th>
                      <th>User name</th>
                      <th>Operation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.username}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleResetPassword(employee.id, employee.name)}
                              className="primary-button"
                              style={{ background: '#FF9800', fontSize: '14px', padding: '8px 16px' }}
                            >
                              Reset password
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="delete-button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Employee attendance</h2>
              <div className="attendance-date-picker">
                <label>Select a date: </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
            
            {employees.length > 0 && (() => {
              const stats = getAttendanceStats();
              return (
                <div className="attendance-stats">
                  <div className="stat-card">
                    <div className="stat-label">Total number of employees</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Morning shift - At work</div>
                    <div className="stat-value present-stat">{stats.morningPresent}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Morning shift - Off</div>
                    <div className="stat-value absent-stat">{stats.morningAbsent}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Afternoon shift - At work</div>
                    <div className="stat-value present-stat">{stats.afternoonPresent}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Afternoon shift - Off</div>
                    <div className="stat-value absent-stat">{stats.afternoonAbsent}</div>
                  </div>
                </div>
              );
            })()}

            <div className="attendance-list">
              {employees.length === 0 ? (
                <p className="empty-message">No staff yet</p>
              ) : (() => {
                const { presentFull, presentMorning, presentAfternoon, absent } = getGroupedAttendance();
                return (
                  <div className="attendance-four-columns">
                    <div className="attendance-column present-full-column">
                      <h3 className="column-title">Present</h3>
                      <div className="employee-name-list">
                        {presentFull.length === 0 ? (
                          <p className="empty-column">No data found</p>
                        ) : (
                          presentFull.map((employee) => (
                            <div key={employee.id} className="employee-name-item">
                              {employee.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="attendance-column present-morning-column">
                      <h3 className="column-title">Morning shift</h3>
                      <div className="employee-name-list">
                        {presentMorning.length === 0 ? (
                          <p className="empty-column">No data found</p>
                        ) : (
                          presentMorning.map((employee) => (
                            <div key={employee.id} className="employee-name-item">
                              {employee.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="attendance-column present-afternoon-column">
                      <h3 className="column-title">Afternoon shift</h3>
                      <div className="employee-name-list">
                        {presentAfternoon.length === 0 ? (
                          <p className="empty-column">No data found</p>
                        ) : (
                          presentAfternoon.map((employee) => (
                            <div key={employee.id} className="employee-name-item">
                              {employee.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="attendance-column absent-column">
                      <h3 className="column-title">Off</h3>
                      <div className="employee-name-list">
                        {absent.length === 0 ? (
                          <p className="empty-column">No data found</p>
                        ) : (
                          absent.map((employee) => (
                            <div key={employee.id} className="employee-name-item">
                              {employee.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'monthly-attendance' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Month attendance</h2>
              <div className="attendance-date-picker">
                <label>Select month: </label>
                <input
                  type="month"
                  value={monthlyAttendanceDate}
                  onChange={(e) => setMonthlyAttendanceDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>
            
            <div className="monthly-attendance-container">
              {employees.length === 0 ? (
                <p className="empty-message">No staff yet.</p>
              ) : (
                <div className="monthly-table-wrapper">
                  <table className="monthly-attendance-table">
                    <thead>
                      <tr>
                        <th className="sticky-col">Employee name</th>
                        {Array.from({ length: new Date(monthlyAttendanceDate.split('-')[0], monthlyAttendanceDate.split('-')[1], 0).getDate() }, (_, i) => i + 1).map(day => (
                          <th key={day} className="day-header">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getMonthlyAttendance().map((employee) => (
                        <tr key={employee.id}>
                          <td className="sticky-col employee-name-cell">{employee.name}</td>
                          {employee.dailyStatus.map((status, idx) => (
                            <td key={idx} className="day-cell">
                              <div className="day-status">
                                <span className={`status-dot ${status.morning ? 'present' : 'absent'}`} title="Ca sáng"></span>
                                <span className={`status-dot ${status.afternoon ? 'present' : 'absent'}`} title="Ca chiều"></span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Payroll Management</h2>
              <div className="attendance-date-picker">
                <label> Select month: </label>
                <input
                  type="month"
                  value={salaryMonth}
                  onChange={(e) => {
                    setSalaryMonth(e.target.value);
                    setEditingSalary(null);
                    setSalaryForm({ salary: '', advanceAmount: '' });
                    setShowAdvanceForm(false);
                  }}
                  className="date-input"
                />
              </div>
            </div>

            {editingSalary && (
              <form onSubmit={handleSetSalary} className="leave-form" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Set salary for {editingSalary.name} - {new Date(salaryMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Total salary (VNĐ)</label>
                    <input
                      type="number"
                      value={salaryForm.salary}
                      onChange={(e) => setSalaryForm({ ...salaryForm, salary: e.target.value })}
                      required
                      min="0"
                      step="1000"
                      placeholder="Enter salary (e.g. 5,000,000)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount advanced (VNĐ)</label>
                    <input
                      type="number"
                      value={salaryForm.advanceAmount}
                      onChange={(e) => setSalaryForm({ ...salaryForm, advanceAmount: e.target.value })}
                      min="0"
                      step="1000"
                      placeholder="Enter the amount advanced (e.g. 2,000,000)"
                    />
                  </div>
                </div>

                {salaryForm.salary && editingSalary && (
                  <div style={{ 
                    padding: '12px', 
                    background: '#e3f2fd', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    border: '1px solid #2196F3'
                  }}>
                    <strong>Net advance balance: </strong>
                    <span style={{ 
                      color: '#2196F3', 
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {new Intl.NumberFormat('vi-VN').format(
                        calculateRemainingSalaryForForm(
                          editingSalary.id, 
                          parseFloat(salaryForm.salary) || 0, 
                          salaryForm.advanceAmount || 0
                        )
                      )} VNĐ
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingSalary(null);
                      setSalaryForm({ salary: '', advanceAmount: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <SalaryTable 
              key={`salary-${salaryMonth}-${Array.isArray(advanceRequests) ? advanceRequests.length : 0}-${Array.isArray(advanceRequests) ? advanceRequests.reduce((sum, r) => sum + (r?.id || 0), 0) : 0}`}
              employees={employees} 
              salaryMonth={salaryMonth} 
              onEditSalary={handleEditSalary}
              advanceRequests={advanceRequests}
              leaveRequests={leaveRequests}
            />
          </div>
        )}

        {activeTab === 'advance-salary' && (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Payroll management</h2>
              <button 
                onClick={() => {
                  setShowAdvanceForm(!showAdvanceForm);
                  setEditingAdvanceRequest(null);
                  setAdvanceForm({ userId: '', amount: '', reason: '' });
                }} 
                className="primary-button"
              >
                {showAdvanceForm ? 'Cancel' : '+ Create salary advance'}
              </button>
            </div>

            {showAdvanceForm && !editingAdvanceRequest && (
              <form onSubmit={handleCreateAdvance} className="leave-form" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Create salary advances for employees.</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label>Choose employee</label>
                  <select
                    value={advanceForm.userId}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, userId: e.target.value })}
                    required
                  >
                    <option value="">-- Select employees --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Advance payment (VNĐ)</label>
                  <input
                    type="number"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    required
                    min="1000"
                    step="1000"
                    placeholder="Enter the amount you wish to borrow (e.g. 1,000,000)"
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    rows="4"
                    placeholder="Enter the reason for the salary request (optional)..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Creating...' : 'Create salary advance'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAdvanceForm(false);
                      setAdvanceForm({ userId: '', amount: '', reason: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {editingAdvanceRequest && (
              <form onSubmit={handleUpdateAdvanceRequest} className="leave-form" style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Adjust salary: {editingAdvanceRequest.userName}</h3>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label>Choose employee</label>
                  <select
                    value={advanceForm.userId}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, userId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Advance payment (VNĐ)</label>
                  <input
                    type="number"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    required
                    min="1000"
                    step="1000"
                    placeholder="Enter the amount you wish to borrow (e.g. 1,000,000)"
                  />
                </div>

                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    rows="4"
                    placeholder="Enter the reason for the salary request (optional)..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={loading} className="primary-button">
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingAdvanceRequest(null);
                      setAdvanceForm({ userId: '', amount: '', reason: '' });
                      setError('');
                    }} 
                    className="logout-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

           {/* Filter */}
            <div style={{ 
              background: '#f9f9f9', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              marginTop: '20px',
              border: '1px solid #e0e0e0'
            }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', color: '#333' }}>Filter</h3>
              <div className="form-row" style={{ marginBottom: '0' }}>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label>Employee</label>
                  <select
                    value={advanceRequestFilter.employeeId}
                    onChange={(e) => setAdvanceRequestFilter({ employeeId: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="">All employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setAdvanceRequestFilter({ employeeId: '' })}
                    className="logout-button"
                    style={{ width: '100%' }}
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Salary advance history</h3>
              {(() => {
                // Filter salary advance requests
                let filteredRequests = advanceRequests;
                
                // Filter by employee
                if (advanceRequestFilter.employeeId) {
                  filteredRequests = filteredRequests.filter(
                    req => req.userId === parseInt(advanceRequestFilter.employeeId)
                  );
                }
                
                return filteredRequests.length === 0 ? (
                  <p className="empty-message">No salary advance requests match the filter.</p>
                ) : (
                  <>
                    <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                      Show {filteredRequests.length} / {advanceRequests.length} request for salary advance
                    </p>
                    <table className="employees-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Employee</th>
                          <th>Amount</th>
                          <th>Reason</th>
                          <th>State</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests
                          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
                          .map((request) => (
                        <tr key={request.id}>
                          <td>{new Date(request.submittedAt).toLocaleString('vi-VN')}</td>
                          <td>{request.userName}</td>
                          <td style={{ fontWeight: '600', color: '#2563eb' }}>
                            {new Intl.NumberFormat('vi-VN').format(request.amount)} VNĐ
                          </td>
                          <td>{request.reason}</td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: getStatusColor(request.status),
                                padding: '4px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: 'white'
                              }}
                            >
                              {getStatusText(request.status)}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleEditAdvanceRequest(request)}
                                className="edit-button"
                              >
                                edit
                              </button>
                              <button
                                onClick={() => handleDeleteAdvanceRequest(request.id)}
                                className="delete-button"
                              >
                                Delete
                              </button>
                              {request.status !== 'approved' && (
                                <button
                                  onClick={() => handleAdvanceStatusChange(request.id, 'approved')}
                                  className="approve-button"
                                >
                                  Approve
                                </button>
                              )}
                              {request.status !== 'rejected' && (
                                <button
                                  onClick={() => handleAdvanceStatusChange(request.id, 'rejected')}
                                  className="reject-button"
                                >
                                  Refuse
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f9f9f9', fontWeight: 'bold' }}>
                          <td colSpan="2">Total amount advanced (approved):</td>
                          <td style={{ color: '#2563eb', fontSize: '16px' }}>
                            {new Intl.NumberFormat('vi-VN').format(
                              filteredRequests
                                .filter(req => req.status === 'approved')
                                .reduce((sum, req) => sum + (req.amount || 0), 0)
                            )} VNĐ
                          </td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Salary Table Component
function SalaryTable({ employees, salaryMonth, onEditSalary, advanceRequests = [], leaveRequests = [] }) {
  const [salaries, setSalaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaries = async () => {
      const salaryData = {};
      for (const employee of employees) {
        try {
          const response = await api.get(`/users/${employee.id}/salary/${salaryMonth}`);
          salaryData[employee.id] = response.data.salary;
        } catch (err) {
          salaryData[employee.id] = null;
        }
      }
      setSalaries(salaryData);
      setLoading(false);
    };

    if (employees.length > 0) {
      fetchSalaries();
    } else {
      setLoading(false);
    }
  }, [employees, salaryMonth, advanceRequests]);

  // Calculate the advanced amount for each employee during the month.
  const getAdvanceAmount = (employeeId) => {
    if (!advanceRequests || !Array.isArray(advanceRequests)) {
      return 0;
    }
    
    const monthStart = new Date(salaryMonth + '-01');
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    
    return advanceRequests
      .filter(req => {
        if (!req || req.userId !== employeeId || req.status !== 'approved') {
          return false;
        }
        const reqDate = new Date(req.submittedAt);
        reqDate.setHours(0, 0, 0, 0);
        return reqDate >= monthStart && reqDate <= monthEnd;
      })
      .reduce((sum, req) => sum + (req.amount || 0), 0);
  };

  // Calculate the net remaining balance (consistent with the employee's current salary formula)
  const calculateRemainingSalary = (employeeId, totalSalary) => {
    if (!totalSalary || totalSalary <= 0) {
      return 0;
    }

    const today = new Date();
    const [year, month] = salaryMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getDate();
    
    // Check if the selected month is the current month
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
    const daysToCalculate = isCurrentMonth ? currentDay : daysInMonth;

    // Daily wage = Total salary / Total days in the month
    const dailySalary = totalSalary / daysInMonth;

    // Calculate the advanced amount for the month
    const advanceAmount = getAdvanceAmount(employeeId);

    // Calculate the number of days off in the month (count up to today only if it is the current month)
    const monthStart = new Date(year, month - 1, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const endDate = isCurrentMonth ? todayStart : monthEnd;

    let leaveShifts = 0; // Total off shifts
    (leaveRequests || []).forEach(req => {
      if (!req || req.status !== 'approved' || !req.date || req.userId !== employeeId) return;
      
      const dateStr = req.date;
      const [reqYear, reqMonth, reqDay] = dateStr.split('-').map(Number);
      const leaveDate = new Date(reqYear, reqMonth - 1, reqDay);
      leaveDate.setHours(0, 0, 0, 0);
      
      // Only count days off within the selected month and <= endDate
      if (leaveDate >= monthStart && leaveDate <= endDate) {
        const timePeriod = (req.timePeriod || 'all day').toLowerCase();
        if (timePeriod === 'all day') {
          leaveShifts += 2; /// Full day off = 2 shifts
        } else if (timePeriod === 'morning' || timePeriod === 'afternoon' || 
                   timePeriod === 'morning shift' || timePeriod === 'afternoon shift') {
          leaveShifts += 1; // 1 shift off = 1 shift
        }
      }
    });
    
    // Calculate the number of days off: 2 shifts = 1 day, 1 shift = 0.5 days
    const leaveDays = leaveShifts / 2;

   // Current salary = ((Total salary / Total days in the month) × Days from the start of the month to today) - Advanced amount - (Number of days off × Daily wage)
    const leaveDeduction = leaveDays * dailySalary;
    const currentSalary = (dailySalary * daysToCalculate) - advanceAmount - leaveDeduction;

    return Math.ceil(Math.max(0, currentSalary));
  };

  if (loading) {
    return <p className="empty-message">Loading...</p>;
  }

  if (employees.length === 0) {
    return <p className="empty-message">No staff yet.</p>;
  }

  return (
    <table className="employees-table">
      <thead>
        <tr>
          <th>Full name</th>
          <th>Username</th>
          <th>Total salary</th>
          <th>Amount advanced</th>
          <th>Net advance balance</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => {
          const salary = salaries[employee.id] || 0;
          const advanceAmount = getAdvanceAmount(employee.id);
          const remaining = calculateRemainingSalary(employee.id, salary);
          
          return (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.username}</td>
              <td>
                {salary > 0 ? (
                  <span style={{ color: '#4caf50', fontWeight: '600' }}>
                    {new Intl.NumberFormat('vi-VN').format(salary)} VNĐ
                  </span>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>Salary not yet set</span>
                )}
              </td>
              <td>
                <span style={{ color: '#ff9800', fontWeight: '600' }}>
                  {new Intl.NumberFormat('vi-VN').format(advanceAmount)} VNĐ
                </span>
              </td>
              <td>
                <span style={{ 
                  color: remaining >= 0 ? '#2196F3' : '#f44336', 
                  fontWeight: '600' 
                }}>
                  {new Intl.NumberFormat('vi-VN').format(remaining)} VNĐ
                </span>
              </td>
              <td>
                <button
                  onClick={() => onEditSalary(employee)}
                  className="edit-button"
                >
                  {salary > 0 ? 'Edit salary' : 'Set salary'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ManagerDashboard;

