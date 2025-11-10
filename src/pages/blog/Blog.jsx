import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchPosts, fetchMedia } from '../../utils/api';
import Layout from '../../layout/Layout';

const SITE_URL = 'https://vansunstudio.com';

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'tattoo', name: 'Tattoo' },
  { id: 'piercing', name: 'Piercing' }
];

const getPlainText = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const buildExcerpt = (post) => {
  if (post?.acf?.blog_post?.text) {
    const clean = getPlainText(post.acf.blog_post.text);
    return clean.length > 155 ? `${clean.slice(0, 152)}...` : clean;
  }
  if (post?.excerpt?.rendered) {
    const clean = getPlainText(post.excerpt.rendered);
    return clean.length > 155 ? `${clean.slice(0, 152)}...` : clean;
  }
  return 'Latest updates and stories from Vansun Studio.';
};

const Blog = () => {
  const { category } = useParams();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(
    category && CATEGORIES.some(cat => cat.id === category) ? category : 'all'
  );
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
          
          // Skip posts without any content (either ACF or regular title)
          if (!post.acf?.blog_post?.title && !post.title?.rendered) {
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

  useEffect(() => {
    if (category && CATEGORIES.some(cat => cat.id === category)) {
      setSelectedCategory(category);
    } else if (!category && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }
  }, [category, selectedCategory]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') {
      return posts;
    }
    return posts.filter(post => {
      const postCategory = post._embedded?.['wp:term']?.[0]?.[0];
      return postCategory?.slug === selectedCategory;
    });
  }, [posts, selectedCategory]);

  const pageTitle = selectedCategory === 'all'
    ? 'Blog | Vansun Studio'
    : `${CATEGORIES.find(cat => cat.id === selectedCategory)?.name || 'Blog'} Articles | Vansun Studio`;

  const metaDescription = filteredPosts.length > 0
    ? buildExcerpt(filteredPosts[0])
    : 'Explore insights, stories, and updates from Vansun Studio.';

  const canonicalPath = selectedCategory === 'all' ? '/blog' : `/blog/${selectedCategory}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const ogUrl = `${SITE_URL}${location.pathname}${location.search || ''}`;

  const blogStructuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Vansun Studio Blog',
    description: metaDescription,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    blogPost: filteredPosts.slice(0, 10).map(post => {
      const title = post.acf?.blog_post?.title || post.title?.rendered || 'Vansun Studio Blog Post';
      const excerpt = buildExcerpt(post);
      const image = imageUrls[post.id];
      const postUrl = `${SITE_URL}/blog/post/${post.slug}`;

      const structuredPost = {
        '@type': 'BlogPosting',
        headline: title,
        description: excerpt,
        url: postUrl,
        mainEntityOfPage: postUrl,
        datePublished: post.date,
        dateModified: post.modified || post.date
      };

      if (image) {
        structuredPost.image = image;
      }

      const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name;
      if (categoryName) {
        structuredPost.articleSection = categoryName;
      }

      return structuredPost;
    })
  }), [filteredPosts, imageUrls, canonicalUrl, metaDescription]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <Layout>
        <div className="blog-container">
          <h1 className="sr-only">Blog</h1>
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
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:site_name" content="Vansun Studio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <script type="application/ld+json">
          {JSON.stringify(blogStructuredData)}
        </script>
      </Helmet>
      <div className="blog-container">
        <div className="blog-header">
          <h1>Blog</h1>
          <div className="category-filter">
            {CATEGORIES.map(categoryItem => (
              <Link
                key={categoryItem.id}
                to={categoryItem.id === 'all' ? '/blog' : `/blog/${categoryItem.id}`}
                className={selectedCategory === categoryItem.id ? 'active' : ''}
                onClick={() => setSelectedCategory(categoryItem.id)}
              >
                {categoryItem.name}
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
                        alt={post.acf?.blog_post?.title || post.title?.rendered}
                            loading="lazy"
                            decoding="async"
                        onError={(e) => {
                          console.error('Image failed to load:', featuredImage);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h2>{post.acf?.blog_post?.title || post.title?.rendered}</h2>
                  <p>
                    {(() => {
                      if (post.acf?.blog_post?.text) {
                        const cleanText = post.acf.blog_post.text.replace(/<[^>]*>/g, '').trim();
                        const firstLine = cleanText.split('\n')[0];
                        return firstLine && firstLine.length > 0 ? firstLine : 'No preview available';
                      } else if (post.excerpt?.rendered) {
                        const cleanText = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
                        return cleanText || 'No preview available';
                      } else {
                        return 'No preview available';
                      }
                    })()}
                  </p>
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
