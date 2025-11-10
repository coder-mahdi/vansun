import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import Hero from '../components/Hero';
import MyWork from '../components/MyWork';
import About from '../components/About';

const SITE_URL = 'https://vansunstudio.com';

function Home() {
    const pageTitle = 'Vansun Studio | Piercing and Tattoo Specialists in Vancouver';
    const description = 'Discover Vansun Studio in Downtown Vancouver. Professional piercing and tattoo services, custom designs, and safe experiences for every client.';
    const businessSchema = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'TattooParlor',
        name: 'Vansun Studio',
        url: SITE_URL,
        image: `${SITE_URL}/logo/logo.png`,
        logo: `${SITE_URL}/logo/logo.png`,
        description,
        priceRange: '$$',
        sameAs: [
            'https://www.instagram.com/vansunstudio'
        ]
    }), [description]);

    const websiteSchema = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Vansun Studio',
        url: SITE_URL
    }), []);

    return (
        <Layout> 
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={SITE_URL} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={SITE_URL} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={description} />
                <script type="application/ld+json">
                    {JSON.stringify(businessSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(websiteSchema)}
                </script>
            </Helmet>
            <div className="main-content">
                <Hero />
                <MyWork />
                <About />
            </div>
        </Layout>
    );
}

export default Home;
