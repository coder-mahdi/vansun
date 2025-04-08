import React, { useState, useEffect } from 'react';

function Header() {
    const [headerData, setHeaderData] = useState({ title: "", navLink: [], logo: "" });
    const [localTime, setLocalTime] = useState("");
    


    useEffect(() => {
        fetch('/data/headerData.json') 
            .then(response => response.json())
            .then(data => setHeaderData(data))
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect (() => {
        const updateTime = () => {
            const now = new Date().toLocaleTimeString("en-US", { 
                timeZone:"America/Vancouver",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
            setLocalTime(now);
            };
            
            updateTime();
            const interval = setInterval(updateTime, 1000);

            return () => clearInterval(interval);
    }, []);

    return (
        <header>
            {headerData.logo && (
               <img src={'/data/' + headerData.logo} alt="logo" />

            )}
            <nav>
                {headerData.navLink.map((link, index) => (
                    <a key={index} href={link.link}>
                        {link.name}
                    </a>
                ))}
            </nav>
        </header>
    );
}

export default Header;
