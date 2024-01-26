import React, { useState } from 'react';

const PostFormModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content, writer });
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <label>
          제목:
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <br />
        <label>
          내용:
          <textarea value={content} onChange={e => setContent(e.target.value)} />
        </label>
        <br />
        <label>
          작성자:
          <input type="text" value={writer} onChange={e => setWriter(e.target.value)} />
        </label>
        <br />
        <button type="submit">저장</button>
        <button onClick={onClose}>닫기</button>
      </form>
    </div>
  );
};

export default PostFormModal;
