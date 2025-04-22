import React, { useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';



function Layout({ children }) {
   



    return (
        <>
        <div className="site-main">

            <Header />
            
            <main>{children}</main> 

            <Footer />
        </div>
        </>
    );
}

export default Layout;
