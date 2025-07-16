import React from 'react';

const TagList = ({ tags = [], tagNames = {}, onTagClick, clickable = false, size = 'medium' }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const handleTagClick = (tagId) => {
    if (clickable && onTagClick) {
      onTagClick(tagId);
    }
  };

  return (
    <div className={`tag-list tag-list--${size}`}>
      {tags.map((tagId) => (
        <span
          key={tagId}
          className={`tag ${clickable ? 'tag--clickable' : ''}`}
          onClick={() => handleTagClick(tagId)}
        >
          {tagNames[tagId] || tagId}
        </span>
      ))}
    </div>
  );
};

export default TagList; 