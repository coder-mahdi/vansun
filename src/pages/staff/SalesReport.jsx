import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { 
  getServiceNames, 
  getJewelryNames, 
  calculateServicePrice, 
  calculateJewelryPrice, 
  calculateTotalPrice,
  calculateEmployeeIncome,
  PAYMENT_METHODS
} from '../../utils/salesData';
import Layout from '../../layout/Layout';

const SalesReport = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    services: [{ name: '', quantity: 1 }],
    jewelry: [{ name: '', quantity: 1 }],
    customPrice: 0,
    tip: 0,
    customerName: '',
    customerPhone: '',
    paymentMethod: 'Cash',
    notes: ''
  });
  const [pricing, setPricing] = useState({
    servicePrice: 0,
    jewelryPrice: 0,
    beforeTax: 0,
    afterTax: 0,
    taxAmount: 0
  });

  const serviceNames = getServiceNames();
  const jewelryNames = getJewelryNames();

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setFormData({ ...formData, services: updatedServices });
  };

  const handleJewelryChange = (index, field, value) => {
    const updatedJewelry = [...formData.jewelry];
    updatedJewelry[index] = { ...updatedJewelry[index], [field]: value };
    setFormData({ ...formData, jewelry: updatedJewelry });
  };

  const addService = () => {
    if (formData.services.length < 3) {
      setFormData({
        ...formData,
        services: [...formData.services, { name: '', quantity: 1 }]
      });
    }
  };

  const removeService = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData({ ...formData, services: updatedServices });
    }
  };

  const addJewelry = () => {
    setFormData({
      ...formData,
      jewelry: [...formData.jewelry, { name: '', quantity: 1 }]
    });
  };

  const removeJewelry = (index) => {
    if (formData.jewelry.length > 1) {
      const updatedJewelry = formData.jewelry.filter((_, i) => i !== index);
      setFormData({ ...formData, jewelry: updatedJewelry });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate services
      const hasValidServices = formData.services.some(service => service.name);
      if (!hasValidServices) {
        alert('Please select at least one service');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate jewelry
      const hasValidJewelry = formData.jewelry.some(jewelry => jewelry.name);
      if (!hasValidJewelry) {
        alert('Please select at least one jewelry type');
        return;
      }
      calculatePricing();
      setStep(3);
    }
  };

  const calculatePricing = () => {
    const servicePrice = calculateServicePrice(formData.services);
    const jewelryPrice = calculateJewelryPrice(formData.jewelry);
    const total = calculateTotalPrice(servicePrice, jewelryPrice, formData.customPrice, formData.tip);
    
    setPricing({
      servicePrice,
      jewelryPrice,
      ...total
    });
  };

  const handleSubmit = () => {
    // Save report to localStorage (in a real app, this would go to a database)
    const report = {
      id: Date.now(),
      date: new Date().toISOString(),
      staffMember: currentUser?.full_name || currentUser?.username || 'Unknown',
      staffRole: currentUser?.role || 'Staff',
      staffId: currentUser?.id,
      ...formData,
      ...pricing
    };

    const existingReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
    existingReports.push(report);
    localStorage.setItem('salesReports', JSON.stringify(existingReports));

    alert('Sales report submitted successfully!');
    navigate('/staff/dashboard');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Layout>
      <div className="sales-report-container">
        <div className="report-header">
          <div className="header-content">
            <h1>Sales Report</h1>
            <p>Create a new sales report</p>
          </div>
          <Link to="/staff/dashboard" className="back-to-dashboard">
            ← Back to Staff Dashboard
          </Link>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Services</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Jewelry</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Pricing</div>
          </div>
        </div>

        <div className="report-form">
          {step === 1 && (
            <div className="step-content">
              <h2>Select Services</h2>
              <p>Choose the services provided to the customer</p>
              
              {formData.services.map((service, index) => (
                <div key={index} className="service-row">
                  <div className="form-group">
                    <label>Service {index + 1}</label>
                    <select
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    >
                      <option value="">Select a service</option>
                      {serviceNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  {formData.services.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeService(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              {formData.services.length < 3 && (
                <button type="button" className="add-btn" onClick={addService}>
                  + Add Another Service
                </button>
              )}
              
              <div className="form-actions">
                <button type="button" className="next-btn" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2>Select Jewelry</h2>
              <p>Choose the jewelry types for the customer</p>
              
              {formData.jewelry.map((jewelry, index) => (
                <div key={index} className="jewelry-row">
                  <div className="form-group">
                    <label>Jewelry {index + 1}</label>
                    <select
                      value={jewelry.name}
                      onChange={(e) => handleJewelryChange(index, 'name', e.target.value)}
                    >
                      <option value="">Select jewelry type</option>
                      {jewelryNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={jewelry.quantity}
                      onChange={(e) => handleJewelryChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  {formData.jewelry.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeJewelry(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" className="add-btn" onClick={addJewelry}>
                + Add Another Jewelry
              </button>
              
              <div className="form-actions">
                <button type="button" className="back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="button" className="next-btn" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2>Pricing & Customer Details</h2>
              <p>Review pricing and enter customer information</p>
              
              <div className="pricing-summary">
                <h3>Pricing Summary</h3>
                <div className="price-breakdown">
                  <div className="price-item">
                    <span>Services:</span>
                    <span>${pricing.servicePrice.toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Jewelry:</span>
                    <span>${pricing.jewelryPrice.toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Before Tax:</span>
                    <span>${pricing.beforeTax.toFixed(2)}</span>
                  </div>
                  <div className="price-item total">
                    <span>After Tax (12%):</span>
                    <span>${pricing.afterTax.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Staff Income Preview */}
              <div className="staff-income-preview">
                <h3>Your Income from this Sale</h3>
                {(() => {
                  const tempReport = {
                    servicePrice: pricing.servicePrice,
                    jewelryPrice: pricing.jewelryPrice,
                    tip: formData.tip,
                    jewelry: formData.jewelry
                  };
                  const userRole = currentUser?.role || 'staff';
                  const staffIncome = calculateEmployeeIncome(tempReport, userRole);
                  
                  if (userRole === 'manager') {
                    return (
                      <div className="income-breakdown">
                        <div className="income-item">
                          <span>Service Income (50%):</span>
                          <span>${staffIncome.serviceIncome.toFixed(2)}</span>
                        </div>
                        <div className="income-item">
                          <span>Jewelry Income (After Reductions & Cuts):</span>
                          <span>${staffIncome.jewelryIncome.toFixed(2)}</span>
                        </div>
                        {staffIncome.tipIncome > 0 && (
                          <div className="income-item">
                            <span>Tips:</span>
                            <span>${staffIncome.tipIncome.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="income-item total">
                          <span>Total Your Income (Vansun):</span>
                          <span>${staffIncome.totalIncome.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="income-breakdown">
                        <div className="income-item">
                          <span>Service Income (50%):</span>
                          <span>${staffIncome.serviceIncome.toFixed(2)}</span>
                        </div>
                        <div className="income-item">
                          <span>Jewelry Income (3%):</span>
                          <span>${staffIncome.jewelryIncome.toFixed(2)}</span>
                        </div>
                        {staffIncome.tipIncome > 0 && (
                          <div className="income-item">
                            <span>Tips:</span>
                            <span>${staffIncome.tipIncome.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="income-item total">
                          <span>Total Your Income:</span>
                          <span>${staffIncome.totalIncome.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Custom Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.customPrice}
                    onChange={(e) => {
                      setFormData({ ...formData, customPrice: parseFloat(e.target.value) || 0 });
                      calculatePricing();
                    }}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tip</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tip}
                    onChange={(e) => {
                      setFormData({ ...formData, tip: parseFloat(e.target.value) || 0 });
                      calculatePricing();
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Customer Phone</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="button" className="submit-btn" onClick={handleSubmit}>
                  Submit Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SalesReport; 