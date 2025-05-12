import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, fetchMedia } from '../../utils/api';
import Layout from '../../layout/Layout';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPosts();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        // Filter out default posts and empty posts
        const validPosts = data.filter(post => {
          // Skip default WordPress post
          if (post.slug === 'hello-world' || post.title.rendered === 'Hello world!') {
            return false;
          }
          
          // Skip posts without ACF data
          if (!post.acf?.blog_post?.title || !post.acf?.blog_post?.text) {
            return false;
          }
          
          return true;
        });

        // Fetch image URLs for each post
        const imageUrlPromises = validPosts.map(async post => {
          const imageId = post.acf?.blog_post?.image;
          if (imageId) {
            try {
              const mediaData = await fetchMedia(imageId);
              return { postId: post.id, url: mediaData?.source_url };
            } catch (err) {
              console.error(`Error fetching media for post ${post.id}:`, err);
              return { postId: post.id, url: null };
            }
          }
          return { postId: post.id, url: null };
        });

        const imageUrls = await Promise.all(imageUrlPromises);
        const imageUrlMap = imageUrls.reduce((acc, { postId, url }) => {
          acc[postId] = url;
          return acc;
        }, {});
        
        setImageUrls(imageUrlMap);
        setPosts(validPosts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'tattoo', name: 'Tattoo' },
    { id: 'piercing', name: 'Piercing' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => {
        const category = post._embedded?.['wp:term']?.[0]?.[0];
        return category?.slug === selectedCategory;
      });

  if (loading) {
    return (
      <Layout>
        <div className="blog-container">
          <div className="loading">Loading posts...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="blog-container">
          <div className="error">
            <h2>Error Loading Posts</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="blog-container">
        <div className="blog-header">
          <h1>Blog</h1>
          <div className="category-filter">
            {categories.map(category => (
              <Link
                key={category.id}
                to={category.id === 'all' ? '/blog' : `/blog/${category.id}`}
                className={selectedCategory === category.id ? 'active' : ''}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found in this category.</p>
          </div>
        ) : (
          <div className="blog-posts">
            {filteredPosts.map(post => {
              const featuredImage = imageUrls[post.id];
              
              return (
                <article key={post.id} className="blog-post-card">
                  {featuredImage && (
                    <div className="post-image">
                      <img 
                        src={featuredImage} 
                        alt={post.acf.blog_post.title}
                        onError={(e) => {
                          console.error('Image failed to load:', featuredImage);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h2>{post.acf.blog_post.title}</h2>
                  <p>{post.acf.blog_post.text.split('\n')[0]}</p>
                  <Link to={`/blog/post/${post.slug}`}>Read More</Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
