import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../../layout/Layout';
import { fetchPosts, fetchTags } from '../../utils/api';
import TagList from '../../components/TagList';

const SITE_URL = 'https://vansunstudio.com';

const getPlainText = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const BlogPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [tagNames, setTagNames] = useState({});

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

          // Fetch tag names if post has tags
          if (currentPost.tags && currentPost.tags.length > 0) {
            try {
              const tagNamesMap = await fetchTags(currentPost.tags);
              setTagNames(tagNamesMap);
            } catch (err) {
              console.error('Error fetching tag names:', err);
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

  const title = post?.acf?.blog_post?.title || post?.title?.rendered || 'Blog Post';
  const plainContent = post ? getPlainText(post.acf?.blog_post?.text || post.content?.rendered || '') : '';
  const metaDescription = plainContent
    ? (plainContent.length > 160 ? `${plainContent.slice(0, 157)}...` : plainContent)
    : 'Read the latest story from Vansun Studio.';
  const canonicalUrl = `${SITE_URL}/blog/post/${slug}`;
  const ogUrl = `${SITE_URL}${location.pathname}${location.search || ''}`;

  const articleStructuredData = useMemo(() => {
    if (!post) {
      return null;
    }

    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: metaDescription,
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      datePublished: post.date,
      dateModified: post.modified || post.date,
      author: {
        '@type': 'Organization',
        name: 'Vansun Studio'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Vansun Studio',
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/favicon-96x96.png`
        }
      }
    };

    if (imageUrl) {
      baseData.image = imageUrl;
    }

    if (post._embedded?.['wp:term']?.[0]?.[0]?.name) {
      baseData.articleSection = post._embedded['wp:term'][0][0].name;
    }

    if (post.tags && post.tags.length > 0) {
      baseData.keywords = post.tags
        .map(tagId => tagNames[tagId])
        .filter(Boolean)
        .join(', ');
    }

    return baseData;
  }, [post, title, metaDescription, canonicalUrl, imageUrl, tagNames]);

  if (loading) {
    return null;
  }
  if (error) {
    return (
      <Layout>
        <div className="blog-post-container">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }
  if (!post) {
    return (
      <Layout>
        <div className="blog-post-container">
          <p>Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${title} | Vansun Studio`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} | Vansun Studio`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={ogUrl} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={`${title} | Vansun Studio`} />
        <meta name="twitter:description" content={metaDescription} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        {articleStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(articleStructuredData)}
          </script>
        )}
      </Helmet>
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
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          
          <div 
            className="post-content"
            dangerouslySetInnerHTML={{
              __html: post.acf?.blog_post?.text || post.content.rendered
            }}
          />
          
          {(post.tags && post.tags.length > 0) && (
            <div className="post-tags">
              <h3>Tags</h3>
              <TagList tags={post.tags || []} tagNames={tagNames} />
            </div>
          )}
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;
