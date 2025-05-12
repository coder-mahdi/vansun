export const API_BASE = 'https://vansunstudio.com/cms/wp-json/wp/v2';

export const fetchPageBySlug = async (slug) => {
  try {
    const res = await fetch(`${API_BASE}/pages?slug=${slug}`);
    const data = await res.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
};

export const fetchMedia = async (mediaId) => {
  try {
    const res = await fetch(`${API_BASE}/media/${mediaId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log('Media data:', data); 
    return data;
  } catch (error) {
    console.error('Error fetching media:', error);
    return null;
  }
};

export const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_BASE}/posts?_embed`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    console.log('Fetched posts:', data); 
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};