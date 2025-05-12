import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { fetchPosts } from '../../utils/api';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getPost = async () => {
      try {
        const posts = await fetchPosts();
        const currentPost = posts.find(p => p.slug === slug);
        if (currentPost) {
          setPost(currentPost);
          
          // Fetch image URL if exists
          if (currentPost.acf?.blog_post?.image) {
            try {
              const response = await fetch(`https://vansunstudio.com/cms/wp-json/wp/v2/media/${currentPost.acf.blog_post.image}`);
              const imageData = await response.json();
              setImageUrl(imageData.source_url);
            } catch (err) {
              console.error('Error fetching image:', err);
            }
          }
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error loading blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    getPost();
  }, [slug]);

  if (loading) return <Layout><div className="blog-post-container">Loading...</div></Layout>;
  if (error) return <Layout><div className="blog-post-container">{error}</div></Layout>;
  if (!post) return <Layout><div className="blog-post-container">Post not found</div></Layout>;

  return (
    <Layout>
      <div className="blog-post-container">
        <Link to="/blog" className="back-link">← Back to Blog</Link>
        
        <article className="blog-post">
          <div className="post-header">
            <h1>{post.acf?.blog_post?.title || post.title.rendered}</h1>
            <div className="post-meta">
              <span className="date">{new Date(post.date).toLocaleDateString()}</span>
              <span className="category">
                {post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Uncategorized'}
              </span>
            </div>
          </div>

          {imageUrl && (
            <div className="post-image">
              <img 
                src={imageUrl}
                alt={post.acf?.blog_post?.title || post.title.rendered} 
              />
            </div>
          )}
          
          <div className="post-content">
            {post.acf?.blog_post?.text || post.content.rendered}
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;
