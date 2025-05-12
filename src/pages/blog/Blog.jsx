import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { fetchPosts } from '../../utils/api';

const Blog = () => {
  const { category } = useParams();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPosts = async () => {
      try {
        const posts = await fetchPosts();
        // Fetch image URLs for each post
        const postsWithImages = await Promise.all(
          posts.map(async (post) => {
            if (post.acf?.blog_post?.image) {
              try {
                const response = await fetch(`https://vansunstudio.com/cms/wp-json/wp/v2/media/${post.acf.blog_post.image}`);
                const imageData = await response.json();
                return {
                  ...post,
                  imageUrl: imageData.source_url
                };
              } catch (err) {
                console.error('Error fetching image:', err);
                return post;
              }
            }
            return post;
          })
        );
        setBlogPosts(postsWithImages);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error loading blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  const filteredPosts = category 
    ? blogPosts.filter(post => {
        const postCategory = post._embedded?.['wp:term']?.[0]?.[0]?.slug;
        return postCategory === category;
      })
    : blogPosts;

  if (loading) return <Layout><div className="blog-container">Loading...</div></Layout>;
  if (error) return <Layout><div className="blog-container">{error}</div></Layout>;

  return (
    <Layout>
      <div className="blog-container">
        <div className="blog-header">
          <h1>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Posts` : 'All Blog Posts'}</h1>
          <div className="category-filter">
            <Link to="/blog" className={!category ? 'active' : ''}>All</Link>
            <Link to="/blog/tattoo" className={category === 'tattoo' ? 'active' : ''}>Tattoo</Link>
            <Link to="/blog/piercing" className={category === 'piercing' ? 'active' : ''}>Piercing</Link>
          </div>
        </div>

        <div className="blog-posts">
          {filteredPosts.map(post => (
            <article key={post.id} className="blog-post-card">
              {post.imageUrl && (
                <div className="post-image">
                  <img 
                    src={post.imageUrl}
                    alt={post.acf?.blog_post?.title || post.title.rendered} 
                  />
                </div>
              )}
              <h2>{post.acf?.blog_post?.title || post.title.rendered}</h2>
              <p>{post.acf?.blog_post?.text?.split('\n')[0] || post.excerpt.rendered}</p>
              <Link to={`/blog/post/${post.slug}`}>Read More</Link>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
