import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Layout({ children }) {
    return (
        <>
        <Helmet>
            <title>Vansun Studio</title>
            <meta name="description" content="Professional piercing and tattoo services in Downtown Vancouver. Clean studio, expert artists, and tailored designs." />
            <meta property="og:site_name" content="Vansun Studio" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="Vansun Studio" />
            <meta property="og:description" content="Professional piercing and tattoo services in Downtown Vancouver. Clean studio, expert artists, and tailored designs." />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Vansun Studio" />
            <meta name="twitter:description" content="Professional piercing and tattoo services in Downtown Vancouver. Clean studio, expert artists, and tailored designs." />
        </Helmet>
        <div className="site-main">

            <Header />
            
            <main>{children}</main> 

            <Footer />
        </div>
        </>
    );
}

export default Layout;
