import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../utils/api';
import Layout from '../layout/Layout';

const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';

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

  if (loading) return <p>Loading gallery...</p>;

  return (
    <Layout>
      <section className="gallery-page dark-mode">
        <h2>{workTitle} - Gallery</h2>
        <div className="gallery-grid">
          {galleryImages && galleryImages.length > 0 ? (
            galleryImages.map((imageUrl, idx) => (
              <img 
                key={idx} 
                src={imageUrl} 
                alt={`${workTitle} - Image ${idx + 1}`}
                className="gallery-image"
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
