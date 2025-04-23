import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPageBySlug } from '../utils/api';

const GalleryPage = () => {
  const { id } = useParams();
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGalleryData = async () => {
      const page = await fetchPageBySlug('mywork-data');
      console.log('Gallery ID from URL:', id);
      console.log('WordPress Data:', page.acf.mywork);
      if (page && page.acf && page.acf.mywork) {
        const selectedWork = page.acf.mywork[parseInt(id)];
        console.log('Selected Work:', selectedWork);
        if (selectedWork && selectedWork.gallery) {
          const images = selectedWork.gallery.map((img) => {
            if (typeof img === 'string') return img;
            return img.url || img.sizes?.medium || img.sizes?.thumbnail || img;
          });
          setGalleryImages(images);
        }
      }
      setLoading(false);
    };
    getGalleryData();
  }, [id]);

  if (loading) return <p>Loading gallery...</p>;

  return (
    <section className="gallery-page">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((src, idx) => (
          <img key={idx} src={src} alt={`Gallery ${idx}`} />
        ))}
      </div>
    </section>
  );
};

export default GalleryPage;
