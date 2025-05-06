import React from 'react';
import Layout from '../layout/Layout';
import Hero from '../components/Hero';
import MyWork from '../components/MyWork';
import About from '../components/About';


function Home() {
    return (
        <Layout> 
            <div className="main-content">
                <Hero />
                <MyWork />
                <About />
            </div>
        </Layout>
    );
}

export default Home;
