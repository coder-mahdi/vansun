const API_BASE = 'http://localhost:8888/vansun/wp-json/wp/v2';

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

export const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_BASE}/posts`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};