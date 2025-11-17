import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { fetchPageBySlug } from '../utils/api';
import Layout from '../layout/Layout';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';
const SITE_URL = 'https://vansunstudio.com';

// Helper function to convert image URL for local development
const getImageUrl = (url) => {
  if (!url) return url;
  // In local development, use proxy for wp-content images
  if (import.meta.env.DEV && url.includes('/wp-content/')) {
    const path = url.split('/wp-content/')[1];
    return `/wp-content/${path}`;
  }
  return url;
};

const GalleryPage = () => {
  const { id } = useParams();
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workTitle, setWorkTitle] = useState('');

  const fetchImageUrl = async (imageId) => {
    try {
      if (!imageId || imageId === '') {
        console.warn('Empty image ID provided');
        return null;
      }
      
      const res = await fetch(`${API_BASE}/media/${imageId}`, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!res.ok) {
        console.error(`HTTP error! status: ${res.status} for image ID ${imageId}`);
        return null;
      }
      
      const imageData = await res.json();
      
      if (!imageData || !imageData.source_url) {
        console.error(`Invalid image data for ID ${imageId}:`, imageData);
        return null;
      }
      
      // Return the source URL directly - let the browser handle CORS
      return imageData.source_url;
    } catch (error) {
      console.error(`Error fetching image with ID ${imageId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const getGalleryData = async () => {
      try {
        // Validate id parameter
        if (id === undefined || id === null) {
          console.error('Gallery ID is missing from URL');
          setLoading(false);
          return;
        }

        const page = await fetchPageBySlug('mywork-data');
        console.log('Gallery ID from URL:', id);
        console.log('MyWork Data:', page?.acf?.mywork);
        
        if (!page || !page.acf || !page.acf.mywork) {
          console.error('MyWork data not found');
          setLoading(false);
          return;
        }

        const workIndex = parseInt(id);
        if (isNaN(workIndex) || workIndex < 0 || workIndex >= page.acf.mywork.length) {
          console.error(`Invalid gallery index: ${id}. Available indices: 0-${page.acf.mywork.length - 1}`);
          setLoading(false);
          return;
        }

        const selectedWork = page.acf.mywork[workIndex];
        console.log('Selected Work:', selectedWork);
        console.log('Selected Work Keys:', Object.keys(selectedWork || {}));
        console.log('Gallery Field:', selectedWork?.gallery);
        console.log('Gallery Type:', typeof selectedWork?.gallery);
        console.log('Is Array:', Array.isArray(selectedWork?.gallery));
        
        if (!selectedWork) {
          console.error('Selected work item not found');
          setLoading(false);
          return;
        }

        setWorkTitle(selectedWork.title || '');
        
        // Handle different gallery data formats
        let galleryImageIds = [];
        
        if (selectedWork.gallery) {
          // Case 1: Array of IDs (numbers or strings)
          if (Array.isArray(selectedWork.gallery)) {
            // Check if array contains objects with ID property or just IDs
            galleryImageIds = selectedWork.gallery.map(item => {
              if (typeof item === 'object' && item !== null) {
                // Try different possible ID field names
                return item.ID || item.id || item.media_id || item.image_id || item;
              }
              return item;
            }).filter(id => id !== null && id !== undefined && id !== '');
          }
          // Case 2: String with comma-separated IDs
          else if (typeof selectedWork.gallery === 'string') {
            galleryImageIds = selectedWork.gallery.split(',').map(id => id.trim()).filter(id => id);
          }
          // Case 3: Object with IDs array
          else if (selectedWork.gallery.ids && Array.isArray(selectedWork.gallery.ids)) {
            galleryImageIds = selectedWork.gallery.ids;
          }
          // Case 4: Single ID (number or string)
          else if (typeof selectedWork.gallery === 'number' || (typeof selectedWork.gallery === 'string' && !isNaN(selectedWork.gallery))) {
            galleryImageIds = [selectedWork.gallery];
          }
        }
        
        console.log('Processed Gallery Image IDs:', galleryImageIds);
        
        if (galleryImageIds.length > 0) {
          // Check if the IDs are actually URLs (ACF sometimes returns full URLs)
          const firstItem = galleryImageIds[0];
          if (typeof firstItem === 'string' && (firstItem.startsWith('http://') || firstItem.startsWith('https://'))) {
            // These are already URLs, use them directly
            console.log('Gallery contains direct URLs, using them');
            setGalleryImages(galleryImageIds.filter(url => url && (url.startsWith('http://') || url.startsWith('https://'))));
          } else {
            // Convert image IDs to URLs
            const imageUrls = await Promise.all(
              galleryImageIds.map(async (imageId) => {
                // Handle both numeric IDs and string IDs
                const id = typeof imageId === 'object' && imageId.id ? imageId.id : imageId;
                console.log('Fetching image for ID:', id);
                const url = await fetchImageUrl(id);
                console.log('Fetched URL:', url);
                return url;
              })
            );
            // Remove null URLs
            const validUrls = imageUrls.filter(url => url !== null);
            console.log('Valid Image URLs:', validUrls);
            setGalleryImages(validUrls);
          }
        } else {
          console.warn('No gallery images found for this work item. Gallery field:', selectedWork.gallery);
          setGalleryImages([]);
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };
    getGalleryData();
  }, [id]);

  // All hooks must be called before any conditional returns
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

  if (loading) {
    return (
      <Layout>
        <section className="gallery-page dark-mode">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading gallery...</p>
          </div>
        </section>
      </Layout>
    );
  }

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
        <h2>{workTitle} - Gallery</h2>
        <div className="gallery-grid">
          {galleryImages && galleryImages.length > 0 ? (
            galleryImages.map((imageUrl, idx) => {
              const proxiedUrl = getImageUrl(imageUrl);
              // Create SEO-friendly alt text
              const altText = workTitle 
                ? `${workTitle} gallery - Professional ${workTitle.toLowerCase()} work by Vansun Studio in Vancouver - Image ${idx + 1}`
                : `Vansun Studio gallery - Professional piercing and tattoo work in Downtown Vancouver - Image ${idx + 1}`;
              
              return (
                <img 
                  key={idx} 
                  src={proxiedUrl} 
                  alt={altText}
                  className="gallery-image"
                  loading="lazy"
                  crossOrigin={import.meta.env.DEV ? undefined : "anonymous"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error(`Failed to load image: ${proxiedUrl}`);
                    e.target.style.display = 'none';
                  }}
                />
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No images found in gallery.</p>
              <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '1rem' }}>
                Gallery ID: {id} | Images loaded: {galleryImages.length}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                Please check the browser console for detailed error messages.
              </p>
              <Link to="/" className="btn-book" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default GalleryPage;
