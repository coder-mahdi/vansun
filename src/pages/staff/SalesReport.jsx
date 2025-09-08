import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import { 
  getServiceNames, 
  getJewelryNames, 
  calculateServicePrice, 
  calculateJewelryPrice, 
  calculateAfterCarePrice,
  calculateTotalPrice,
  calculateEmployeeIncome,
  calculateVansunIncome,
  PAYMENT_METHODS
} from '../../utils/salesData';
import { saveSalesReport } from '../../utils/wordpressApi';
import Layout from '../../layout/Layout';

const SalesReport = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    services: [{ name: '', quantity: 1 }],
    jewelry: [{ name: '', quantity: 1 }],
    afterCare: [{ quantity: 0 }],
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
    afterCarePrice: 0,
    beforeTax: 0,
    afterTax: 0,
    taxAmount: 0
  });

  const serviceNames = getServiceNames();
  const jewelryNames = getJewelryNames();

  // Calculate pricing whenever formData changes
  useEffect(() => {
    if (step >= 2) {
      calculatePricing();
    }
  }, [formData.services, formData.jewelry, formData.afterCare, formData.customPrice, formData.tip, step]);

  // Force calculate pricing when entering step 4
  useEffect(() => {
    if (step === 4) {
      calculatePricing();
    }
  }, [step]);

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

  const handleAfterCareChange = (index, field, value) => {
    const updatedAfterCare = [...formData.afterCare];
    updatedAfterCare[index] = { ...updatedAfterCare[index], [field]: value };

    setFormData({ ...formData, afterCare: updatedAfterCare });
    
    // Force recalculation when aftercare quantity changes
    if (field === 'quantity') {
      setTimeout(() => calculatePricing(), 0);
    }
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

  const addAfterCare = () => {
    setFormData({
      ...formData,
      afterCare: [...formData.afterCare, { quantity: 0 }]
    });
  };

  const removeAfterCare = (index) => {
    if (formData.afterCare.length > 1) {
      const updatedAfterCare = formData.afterCare.filter((_, i) => i !== index);
      setFormData({ ...formData, afterCare: updatedAfterCare });
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
      setStep(3);
    } else if (step === 3) {
      // After Care is optional, so no validation needed
      calculatePricing();
      setStep(4);
    }
  };

  const calculatePricing = () => {
    const servicePrice = calculateServicePrice(formData.services);
    const jewelryPrice = calculateJewelryPrice(formData.jewelry);
    const afterCarePrice = calculateAfterCarePrice(formData.afterCare);
    const customPrice = parseFloat(formData.customPrice) || 0;
    const tip = parseFloat(formData.tip) || 0;
    const total = calculateTotalPrice(servicePrice, jewelryPrice, afterCarePrice, customPrice, tip);
    

    
    setPricing({
      servicePrice: servicePrice || 0,
      jewelryPrice: jewelryPrice || 0,
      afterCarePrice: afterCarePrice || 0,
      ...total
    });
  };

  // Function to calculate after care price from report data
  const calculateAfterCarePriceFromReport = (report) => {
    if (!report.afterCare || report.afterCare.length === 0) return 0;
    
    let totalPrice = 0;
    report.afterCare.forEach(afterCare => {
      const quantity = parseInt(afterCare.quantity) || 0;
      if (quantity > 0) {
        totalPrice += 15 * quantity; // $15 per item
      }
    });
    return totalPrice;
  };

  const handleSubmit = async () => {
    // Calculate final pricing
    const servicePrice = calculateServicePrice(formData.services);
    const jewelryPrice = calculateJewelryPrice(formData.jewelry);
    const afterCarePrice = calculateAfterCarePrice(formData.afterCare);
    const customPrice = parseFloat(formData.customPrice) || 0;
    const tip = parseFloat(formData.tip) || 0;
    
    // Validate custom price
    if (customPrice > 0 && customPrice < servicePrice) {
      alert('Custom price cannot be less than service price. Please enter a valid amount.');
      return;
    }
    
    const total = calculateTotalPrice(servicePrice, jewelryPrice, afterCarePrice, customPrice, tip);
    

    
    // Create report object
    const report = {
      id: Date.now(),
      date: new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" }),
      staffMember: currentUser?.full_name || currentUser?.username || 'Unknown',
      staffRole: currentUser?.role || 'Staff',
      staffId: currentUser?.id,
      services: formData.services,
      jewelry: formData.jewelry,
      afterCare: formData.afterCare,
      customPrice: customPrice,
      tip: tip,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      servicePrice: servicePrice || 0,
      jewelryPrice: jewelryPrice || 0,
      afterCarePrice: afterCarePrice || 0,
      adjustedServicePrice: total.adjustedServicePrice || servicePrice || 0,
      adjustedJewelryPrice: total.adjustedJewelryPrice || jewelryPrice || 0,
      adjustedAfterCarePrice: total.adjustedAfterCarePrice || afterCarePrice || 0,
      ...total
    };
    

    
    

    try {
      // Save to WordPress API
      await saveSalesReport(report);
      
      // Also save to localStorage as backup
      const existingReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
      existingReports.push(report);
      localStorage.setItem('salesReports', JSON.stringify(existingReports));

      alert('Sales report submitted successfully!');
      navigate('/staff/dashboard');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving report. Please try again.');
    }
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
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. After Care</div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Pricing</div>
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
              <h2>After Care (Optional)</h2>
              <p>Add after care products ($15 each) - Optional</p>
              

              
              {formData.afterCare.map((afterCare, index) => (
                <div key={index} className="after-care-row">
                  <div className="form-group">
                    <label>After Care {index + 1}</label>
                    <div className="after-care-info">
                      <span>Price: $15.00 each</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={afterCare.quantity}
                      onChange={(e) => handleAfterCareChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  {formData.afterCare.length > 1 && (
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeAfterCare(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" className="add-btn" onClick={addAfterCare}>
                + Add Another After Care
              </button>
              
              <div className="after-care-note">
                <p><strong>Note:</strong> Set quantity to 0 if you don't want to include After Care in this sale.</p>
              </div>
              
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

          {step === 4 && (
            <div className="step-content">
              <h2>Pricing & Customer Details</h2>
              <p>Review pricing and enter customer information</p>
              
              <div className="pricing-summary">
                <h3>Pricing Summary</h3>
                

                <div className="price-breakdown">
                  <div className="price-item">
                    <span>Services:</span>
                    <span>${(pricing.servicePrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>Jewelry:</span>
                    <span>${(pricing.jewelryPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="price-item">
                    <span>After Care:</span>
                    <span>
                      ${(pricing.afterCarePrice || 0).toFixed(2)}
                      {formData.afterCare && formData.afterCare.length > 0 && (
                        <span className="after-care-details">
                          ({formData.afterCare.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0)} items × $15.00)
                        </span>
                      )}
                    </span>
                  </div>
                  {formData.customPrice > 0 ? (
                    <>
                      <div className="price-item custom-price">
                        <span>Custom Price (No Tax):</span>
                        <span>${(formData.customPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="price-item">
                        <span>Service Amount:</span>
                        <span>${(pricing.servicePrice || 0).toFixed(2)}</span>
                      </div>
                      {formData.customPrice > pricing.servicePrice ? (
                        <div className="price-item">
                          <span>Jewelry Amount:</span>
                          <span>${((formData.customPrice - pricing.servicePrice) || 0).toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="price-item">
                          <span>Jewelry Amount:</span>
                          <span>$0.00</span>
                        </div>
                      )}
                      {formData.tip > 0 && (
                        <div className="price-item">
                          <span>Tip:</span>
                          <span>${(formData.tip || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-item total custom-total">
                        <span>Total Amount:</span>
                        <span>${(pricing.afterTax || 0).toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="price-item">
                        <span>Before Tax:</span>
                        <span>${(pricing.beforeTax || 0).toFixed(2)}</span>
                      </div>
                      <div className="price-item">
                        <span>Tax Amount (12%):</span>
                        <span>${(pricing.taxAmount || 0).toFixed(2)}</span>
                      </div>
                      {formData.tip > 0 && (
                        <div className="price-item">
                          <span>Tip (Not Taxed):</span>
                          <span>${(formData.tip || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-item total">
                        <span>Total Amount:</span>
                        <span>${(pricing.afterTax || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Staff Income Preview */}
              <div className="staff-income-preview">
                <h3>Your Income from this Sale</h3>
                {formData.customPrice > 0 && (
                  <div className="custom-price-note">
                    <p>Income calculated based on Custom Price distribution</p>
                  </div>
                )}
                {(() => {
                  // Calculate current pricing for preview
                  const servicePrice = calculateServicePrice(formData.services);
                  const jewelryPrice = calculateJewelryPrice(formData.jewelry);
                  const afterCarePrice = calculateAfterCarePrice(formData.afterCare);
                  const customPrice = parseFloat(formData.customPrice) || 0;
                  const tip = parseFloat(formData.tip) || 0;
                  
                  const tempReport = {
                    servicePrice: servicePrice || 0,
                    jewelryPrice: jewelryPrice || 0,
                    afterCarePrice: afterCarePrice || 0,
                    adjustedServicePrice: formData.customPrice > 0 ? (formData.customPrice * (servicePrice / (servicePrice + jewelryPrice + afterCarePrice))) : servicePrice || 0,
                    adjustedJewelryPrice: formData.customPrice > 0 ? (formData.customPrice * (jewelryPrice / (servicePrice + jewelryPrice + afterCarePrice))) : jewelryPrice || 0,
                    adjustedAfterCarePrice: formData.customPrice > 0 ? (formData.customPrice * (afterCarePrice / (servicePrice + jewelryPrice + afterCarePrice))) : afterCarePrice || 0,
                    tip: tip,
                    jewelry: formData.jewelry,
                    afterCare: formData.afterCare
                  };
                  const userRole = currentUser?.role || 'staff';
                  

                  
                  if (userRole === 'manager' || userRole === 'Manager') {
                    // For managers, show Vansun income
                    const vansunIncome = calculateVansunIncome(tempReport);
                    return (
                      <div className="income-breakdown">
                        <div className="income-item">
                          <span>Service Income (50%):</span>
                          <span>${(vansunIncome.serviceIncome || 0).toFixed(2)}</span>
                        </div>
                        <div className="income-item">
                          <span>Jewelry Income (After Reductions & Cuts):</span>
                          <span>${(vansunIncome.jewelryIncome || 0).toFixed(2)}</span>
                        </div>
                        {(vansunIncome.afterCareIncome || 0) > 0 && (
                          <div className="income-item">
                            <span>After Care Income (Full profit):</span>
                            <span>${(vansunIncome.afterCareIncome || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {afterCarePrice > 0 && (vansunIncome.afterCareIncome || 0) === 0 && (
                          <div className="income-item">
                            <span>After Care Income (Full profit):</span>
                            <span>$0.00 (No profit after $7 cost)</span>
                          </div>
                        )}
                        {(vansunIncome.tipIncome || 0) > 0 && (
                          <div className="income-item">
                            <span>Tips:</span>
                            <span>${(vansunIncome.tipIncome || 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="income-item total">
                          <span>Total Your Income (Vansun):</span>
                          <span>${(vansunIncome.totalIncome || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  } else {
                    // For staff, show staff income
                    const staffIncome = calculateEmployeeIncome(tempReport, 'staff');
                    return (
                      <div className="income-breakdown">
                        <div className="income-item">
                          <span>Service Income (50%):</span>
                          <span>${(staffIncome.serviceIncome || 0).toFixed(2)}</span>
                        </div>
                        <div className="income-item">
                          <span>Jewelry Income (Fixed per type):</span>
                          <span>${(staffIncome.jewelryIncome || 0).toFixed(2)}</span>
                        </div>
                        {(staffIncome.afterCareIncome || 0) > 0 && (
                          <div className="income-item">
                            <span>After Care Income (3% of profit):</span>
                            <span>${(staffIncome.afterCareIncome || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {afterCarePrice > 0 && (staffIncome.afterCareIncome || 0) === 0 && (
                          <div className="income-item">
                            <span>After Care Income (3% of profit):</span>
                            <span>$0.00 (No profit after $7 cost)</span>
                          </div>
                        )}
                        {(staffIncome.tipIncome || 0) > 0 && (
                          <div className="income-item">
                            <span>Tips:</span>
                            <span>${(staffIncome.tipIncome || 0).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="income-item total">
                          <span>Total Your Income:</span>
                          <span>${(staffIncome.totalIncome || 0).toFixed(2)}</span>
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