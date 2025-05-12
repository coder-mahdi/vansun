import React from 'react';
import Layout from '../layout/Layout';
import ConsentForm from '../components/ConsentForm';
import './ConsentFormPage.scss';

const ConsentFormPage = () => {
  return (
    <Layout>
      <div className="consent-form-page">
        <ConsentForm />
      </div>
    </Layout>
  );
};

export default ConsentFormPage; 