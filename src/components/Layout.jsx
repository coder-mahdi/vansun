import React, { useRef } from 'react';
import Header from './Header';
import { useLocation } from 'react-router-dom';


function Layout({ children }) {
   



    return (
        <>
            <Header />
            
            <main>{children}</main> 
        </>
    );
}

export default Layout;
