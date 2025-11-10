import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const About = () => {
  const pageTitle = 'About Vansun Studio | Our Piercing and Tattoo Philosophy';
  const description = 'Learn about the Vansun Studio team, our commitment to hygiene, artistry, and personalized piercing and tattoo experiences in Vancouver.';
  const canonicalUrl = `${SITE_URL}/about`;
  const aboutSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Vansun Studio',
    url: canonicalUrl,
    description
  }), [canonicalUrl, description]);

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">
          {JSON.stringify(aboutSchema)}
        </script>
      </Helmet>
      <div className="about-page">
        <div className="container">
          <h1>About Us</h1>
          <p>
            Vansun Studio is a Vancouver-based team of tattoo artists and piercing specialists dedicated to
            clean procedures, curated jewelry, and creative collaboration. We approach every appointment as a
            partnership, listening carefully to your ideas before shaping a design and aftercare plan that fits
            your lifestyle.
          </p>
          <p>
            Our studio is equipped with hospital-grade sterilization, single-use needles, and high-quality inks
            sourced from trusted suppliers. Each artist continues professional development to ensure our techniques
            stay current, safe, and aligned with industry best practices.
          </p>
          <p>
            Whether you are visiting for a first piercing or adding a new chapter to your tattoo collection, we look
            forward to welcoming you into a calm, professional environment where artistry meets precision.
            Get inspired in our <Link to="/gallery/0">visual gallery</Link> and reserve time with your preferred
            artist through the <Link to="/booknow">online booking portal</Link>.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About; 