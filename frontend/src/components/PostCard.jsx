import { useState } from "react";
import axios from "axios";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const avatarColors = [
  "#4f8ef7", "#e53935", "#43a047", "#fb8c00",
  "#00acc1", "#8e24aa", "#f4511e", "#039be5"
];

function getAvatarColor(name) {
  let total = 0;
  for (let i = 0; i < name.length; i++) {
    total += name.charCodeAt(i);
  }
  return avatarColors[total % avatarColors.length];
}

function timeAgo(dateStr) {
  const now = new Date();
  const past = new Date(dateStr);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return past.toLocaleDateString();
}

function PostCard({ post, onUpdate, onDelete }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentError, setCommentError] = useState("");
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");

  const handleLike = async () => {
    try {
      const res = await axios.put(
        `https://social-app-backend-qulo.onrender.com/api/posts/${post._id}/like`,
        {},
        { headers: { authorization: token } }
      );
      onUpdate(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    try {
      const res = await axios.post(
        `https://social-app-backend-qulo.onrender.com/api/posts/${post._id}/comment`,
        { text: comment },
        { headers: { authorization: token } }
      );
      setComment("");
      setCommentError("");
      onUpdate(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`https://social-app-backend-qulo.onrender.com/api/posts/${post._id}`, {
        headers: { authorization: token }
      });
      onDelete();
    } catch (err) {
      console.log(err);
    }
  };

  const alreadyLiked = post.likes.includes(name);
  const avatarColor = getAvatarColor(post.username);

  const getLikedByText = () => {
    if (post.likes.length === 0) return null;
    if (post.likes.length === 1) return `Liked by ${post.likes[0]}`;
    if (post.likes.length === 2) return `Liked by ${post.likes[0]} and ${post.likes[1]}`;
    return `Liked by ${post.likes[0]}, ${post.likes[1]} and ${post.likes.length - 2} others`;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ ...styles.avatar, backgroundColor: avatarColor }}>
          {post.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={styles.username}>{post.username}</p>
          <p style={styles.date}>{timeAgo(post.createdAt)}</p>
        </div>
        {post.username === name && (
          <button style={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      {post.text && <p style={styles.text}>{post.text}</p>}

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="post"
          style={styles.image}
        />
      )}

      <div style={styles.actions}>
        <button
          style={{
            ...styles.actionBtn,
            color: alreadyLiked ? "#e0245e" : "#555"
          }}
          onClick={handleLike}
        >
          {alreadyLiked
            ? <AiFillHeart size={18} color="#e0245e" />
            : <AiOutlineHeart size={18} />}
          <span style={styles.actionCount}>{post.likes.length}</span>
        </button>

        <button
          style={styles.actionBtn}
          onClick={() => setShowComments(!showComments)}
        >
          <FaRegComment size={16} />
          <span style={styles.actionCount}>{post.comments.length}</span>
        </button>
      </div>

      {getLikedByText() && (
        <p style={styles.likedBy}>{getLikedByText()}</p>
      )}

      {showComments && (
        <div style={styles.commentSection}>
          {post.comments.length === 0 && (
            <p style={styles.noComments}>No comments yet. Be the first!</p>
          )}

          {post.comments.map((c, i) => (
            <div key={i} style={styles.comment}>
              <div
                style={{
                  ...styles.commentAvatar,
                  backgroundColor: getAvatarColor(c.username)
                }}
              >
                {c.username[0].toUpperCase()}
              </div>
              <div style={styles.commentBubble}>
                <span style={styles.commentUser}>{c.username}</span>
                <span style={styles.commentText}> {c.text}</span>
              </div>
            </div>
          ))}

          {commentError && (
            <p style={styles.commentError}>{commentError}</p>
          )}

          <div style={styles.commentInput}>
            <input
              style={styles.input}
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button style={styles.postBtn} onClick={handleComment}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "10px"
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0
  },
  username: {
    margin: 0,
    fontWeight: "600",
    fontSize: "14px",
    color: "#1a1a1a"
  },
  date: {
    margin: 0,
    fontSize: "12px",
    color: "#999"
  },
  text: {
    fontSize: "15px",
    color: "#333",
    marginBottom: "12px",
    lineHeight: "1.6"
  },
  image: {
    width: "100%",
    borderRadius: "10px",
    marginBottom: "12px",
    maxHeight: "400px",
    objectFit: "cover"
  },
  actions: {
    display: "flex",
    gap: "16px",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "10px",
    marginTop: "4px"
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px",
    borderRadius: "6px"
  },
  actionCount: {
    fontSize: "13px",
    color: "#555"
  },
  likedBy: {
    fontSize: "12px",
    color: "#888",
    margin: "6px 0 0 0"
  },
  commentSection: {
    marginTop: "14px",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "12px"
  },
  noComments: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "10px"
  },
  comment: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "10px"
  },
  commentAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0
  },
  commentBubble: {
    backgroundColor: "#f4f4fb",
    borderRadius: "10px",
    padding: "7px 12px",
    fontSize: "13px",
    flex: 1
  },
  commentUser: {
    fontWeight: "600",
    color: "#1a1a1a"
  },
  commentText: {
    color: "#444"
  },
  commentError: {
    color: "#e53935",
    fontSize: "12px",
    marginBottom: "6px"
  },
  commentInput: {
    display: "flex",
    gap: "8px",
    marginTop: "10px"
  },
  input: {
    flex: 1,
    padding: "8px 14px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none"
  },
  postBtn: {
    padding: "8px 18px",
    backgroundColor: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600"
  },
  deleteBtn: {
    background: "none",
    border: "1px solid #ffcdd2",
    color: "#e53935",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "500"
  }
};

export default PostCard;