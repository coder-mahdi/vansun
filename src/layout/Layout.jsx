import React, { useRef } from 'react';
import Header from './Header';
import Footer from './Footer';



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
