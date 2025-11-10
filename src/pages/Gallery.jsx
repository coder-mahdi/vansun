import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { fetchPageBySlug } from '../utils/api';
import Layout from '../layout/Layout';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';
const SITE_URL = 'https://vansunstudio.com';

const GalleryPage = () => {
  const { id } = useParams();
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workTitle, setWorkTitle] = useState('');

  const fetchImageUrl = async (imageId) => {
    try {
      const res = await fetch(`${API_BASE}/media/${imageId}`);
      const imageData = await res.json();
      return imageData.source_url;
    } catch (error) {
      console.error(`Error fetching image with ID ${imageId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const getGalleryData = async () => {
      try {
        const page = await fetchPageBySlug('mywork-data');
        console.log('Gallery ID from URL:', id);
        console.log('MyWork Data:', page.acf.mywork);
        
        if (page && page.acf && page.acf.mywork) {
          const selectedWork = page.acf.mywork[parseInt(id)];
          console.log('Selected Work:', selectedWork);
          
          if (selectedWork) {
            setWorkTitle(selectedWork.title || '');
            if (selectedWork.gallery && Array.isArray(selectedWork.gallery)) {
              console.log('Gallery Images:', selectedWork.gallery);
              // تبدیل ID های تصاویر به URL
              const imageUrls = await Promise.all(
                selectedWork.gallery.map(async (imageId) => {
                  const url = await fetchImageUrl(imageId);
                  return url;
                })
              );
              // حذف URL های null
              const validUrls = imageUrls.filter(url => url !== null);
              setGalleryImages(validUrls);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      }
      setLoading(false);
    };
    getGalleryData();
  }, [id]);

  if (loading) {
    return null;
  }

  const pageTitle = workTitle
    ? `${workTitle} Gallery | Vansun Studio`
    : 'Gallery | Vansun Studio';
  const description = workTitle
    ? `Browse the Vansun Studio gallery for ${workTitle}. View high-quality images showcasing our artistry and technique.`
    : 'Explore Vansun Studio gallery selections featuring our piercing and tattoo work.';
  const canonicalUrl = `${SITE_URL}/gallery/${id}`;
  const gallerySchema = useMemo(() => {
    if (!galleryImages || galleryImages.length === 0) {
      return null;
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description,
      url: canonicalUrl,
      hasPart: galleryImages.map((imageUrl, index) => ({
        '@type': 'ImageObject',
        contentUrl: imageUrl,
        name: `${workTitle || 'Gallery'} Image ${index + 1}`
      }))
    };
  }, [galleryImages, pageTitle, description, canonicalUrl, workTitle]);

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
        {gallerySchema && (
          <script type="application/ld+json">
            {JSON.stringify(gallerySchema)}
          </script>
        )}
      </Helmet>
      <section className="gallery-page dark-mode">
        <h1 className="sr-only">{workTitle ? `${workTitle} Gallery` : 'Gallery'}</h1>
        <h2>{workTitle} - Gallery</h2>
        <p className="gallery-intro">
          Take a closer look at detailed line work, color blending, and jewelry placement from recent Vansun Studio
          projects. We document every piece to highlight the artistry and meticulous aftercare that defines our studio.
          When you are ready to start your own project, <Link to="/booknow">book a consultation</Link> or review our latest{' '}
          <Link to="/blog">aftercare advice</Link>.
        </p>
        <div className="gallery-grid">
          {galleryImages && galleryImages.length > 0 ? (
            galleryImages.map((imageUrl, idx) => (
              <img 
                key={idx} 
                src={imageUrl} 
                alt={`${workTitle} - Image ${idx + 1}`}
                className="gallery-image"
                loading="lazy"
              />
            ))
          ) : (
            <p>No images found in gallery.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default GalleryPage;
