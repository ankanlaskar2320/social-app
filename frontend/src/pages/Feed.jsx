import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import EmojiPicker from "emoji-picker-react";

function Feed() {
  const [showModalEmoji, setShowModalEmoji] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [search, setSearch] = useState("");
  const [postModal, setPostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [imageKey, setImageKey] = useState(Date.now());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [name, setName] = useState(localStorage.getItem("name"));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPosts = useCallback(async (pageNum, reset) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts?page=${pageNum}&limit=5`
      );
      if (reset) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPosts(page + 1, false);
    setLoadingMore(false);
  }, [page, hasMore, loadingMore, fetchPosts]);

  const handlePost = async () => {
    if (!text && !image) {
      setError("Please add some text or an image");
      return false;
    }

    const formData = new FormData();
    if (text) formData.append("text", text);
    if (image) formData.append("image", image);

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          authorization: token,
          "Content-Type": "multipart/form-data"
        }
      });
      setText("");
      setImage(null);
      setImageKey(Date.now());
      setError("");
      fetchPosts(1, true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const handleEditProfile = async () => {
    if (!editName && !editEmail && !editPassword) {
      setEditError("Fill at least one field to update");
      return;
    }
    try {
      const body = {};
      if (editName) body.name = editName;
      if (editEmail) body.email = editEmail;
      if (editPassword) body.password = editPassword;

      const res = await axios.put("http://localhost:5000/api/auth/update", body, {
        headers: { authorization: token }
      });

      if (res.data.token) localStorage.setItem("token", res.data.token);
      if (editName) {
        localStorage.setItem("name", editName);
        setName(editName);
      }

      setEditError("");
      setEditSuccess("Profile updated successfully");
      setEditName("");
      setEditEmail("");
      setEditPassword("");
      fetchPosts(1, true);
    } catch (err) {
      setEditError(err.response?.data?.message || "Update failed");
    }
  };

  const getFilteredPosts = () => {
    let filtered = posts;
  
    if (search.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.text?.toLowerCase().includes(search.toLowerCase()) ||
          p.username?.toLowerCase().includes(search.toLowerCase())
      );
    }
  
    if (filter === "mostLiked") {
      return [...filtered].sort((a, b) => b.likes.length - a.likes.length);
    }
    if (filter === "mostCommented") {
      return [...filtered].sort((a, b) => b.comments.length - a.comments.length);
    }
    return filtered;
  };

  const myPosts = posts.filter((p) => p.username === name);
  const myLikes = myPosts.reduce((acc, p) => acc + p.likes.length, 0);
  const myComments = myPosts.reduce((acc, p) => acc + p.comments.length, 0);

  return (
    <div style={styles.page}>
      {modal && (
        <div style={styles.modalOverlay} onClick={() => setModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setModal(null)}>✕</button>

            {modal === "profile" && (
              <div style={styles.modalContent}>
                <div style={styles.modalAvatar}>{name && name[0].toUpperCase()}</div>
                <p style={styles.modalName}>{name}</p>
                <p style={styles.modalSub}>Member</p>
                <div style={styles.modalDivider} />
                <input style={styles.modalInput} placeholder="New username" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input style={styles.modalInput} placeholder="New email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                <input style={styles.modalInput} type="password" placeholder="New password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
                {editError && <p style={styles.editError}>{editError}</p>}
                {editSuccess && <p style={styles.editSuccess}>{editSuccess}</p>}
                <button style={styles.saveBtn} onClick={handleEditProfile}>Save Changes</button>
              </div>
            )}

            {modal === "stats" && (
              <div style={styles.modalContent}>
                <p style={styles.modalTitle}>Your Stats</p>
                <div style={styles.modalDivider} />
                <div style={styles.statCard}>
                  <p style={styles.statNumber}>{myPosts.length}</p>
                  <p style={styles.statLabel}>Posts</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statNumber}>{myLikes}</p>
                  <p style={styles.statLabel}>Likes Received</p>
                </div>
                <div style={styles.statCard}>
                  <p style={styles.statNumber}>{myComments}</p>
                  <p style={styles.statLabel}>Comments Received</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div style={styles.navbar}>
        <div style={styles.navInner}>
          <h2 style={styles.logo}>Social</h2>

          <div style={styles.searchWrapper}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Search posts, users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={styles.navRight}>
            <div
              ref={dropdownRef}
              style={styles.profileWrapper}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div style={styles.navAvatar}>
                {name && name[0].toUpperCase()}
              </div>
              <span style={styles.nameText}>{name}</span>
              <span style={styles.chevron}>{dropdownOpen ? "▲" : "▼"}</span>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <button
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal("profile");
                      setDropdownOpen(false);
                    }}
                  >
                    My Profile
                  </button>
                  <button
                    style={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModal("stats");
                      setDropdownOpen(false);
                    }}
                  >
                    My Stats
                  </button>
                  <div style={styles.dropdownDivider} />
                  <button
                    style={{ ...styles.dropdownItem, color: "#ff4d4d" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.feed}>
          <div style={styles.createBox}>
            <p style={styles.createTitle}>Create Post</p>
            <textarea
              style={styles.textarea}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onClick={() => setPostModal(true)}
              readOnly
            />
            <div style={styles.createActions}>
              <div style={styles.createIcons}>
              <button style={styles.iconBtn} onClick={() => setPostModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <div style={{ position: "relative" }}>
                <button style={styles.iconBtn} onClick={() => setShowEmoji(!showEmoji)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </button>

                {showEmoji && (
                  <>
                    <div
                      style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 399
                      }}
                      onClick={() => setShowEmoji(false)}
                    />
                    <div style={{ position: "absolute", top: "40px", left: 0, zIndex: 400 }}>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setText((prev) => prev + emojiData.emoji);
                        }}
                        height={350}
                        width={300}
                        previewConfig={{showPreview: false}}
                      />
                    </div>
                  </>
                )}
              </div>
              </div>
              <button
                style={{
                  ...styles.postBtn,
                  opacity: !text ? 0.5 : 1,
                  cursor: !text ? "default" : "pointer"
                }}
                onClick={() => setPostModal(true)}
              >
                Post
              </button>
            </div>
          </div>

          {postModal && (
            <div style={styles.modalOverlay} onClick={() => setPostModal(false)}>
              <div style={styles.postModalBox} onClick={(e) => e.stopPropagation()}>
                <div style={styles.postModalHeader}>
                  <p style={styles.postModalTitle}>Create Post</p>
                  <button style={styles.modalClose} onClick={() => setPostModal(false)}>✕</button>
                </div>

                <div style={styles.postModalUser}>
                  <div style={styles.postModalAvatar}>
                    {name && name[0].toUpperCase()}
                  </div>
                  <span style={styles.postModalName}>{name}</span>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <textarea
                  style={styles.postModalTextarea}
                  placeholder="What's on your mind?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                
                <div style={styles.postModalBottom}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>

                    <button style={styles.iconBtn} onClick={() => document.getElementById("modalFileInput").click()}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </button>
                    <input
                      id="modalFileInput"
                      key={imageKey}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      style={{ display: "none" }}
                    />

                    <button style={styles.emojiBtn} onClick={() => setShowModalEmoji(!showModalEmoji)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1877f2" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </button>

                    {showModalEmoji && (
                      <>
                      <div
                        style={{
                          position: "fixed",
                          top: 0, left: 0, right: 0, bottom: 0,
                          zIndex: 399
                        }}
                        onClick={() => setShowModalEmoji(false)}
                      />
                      <div style={{ position: "absolute", bottom: "40px", left: 0, zIndex: 400 }}>                
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setText((prev) => prev + emojiData.emoji);
                            setShowEmoji(false);
                          }}
                          height={350}
                          width={300}
                          previewConfig={{showPreview: false}}
                        />
                      </div>
                      </>
                    )}
                  </div>
                  
                  <button
                    style={{
                      ...styles.postBtn,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                    onClick={async () => {
                      const success = await handlePost();
                      if (success) setPostModal(false);
                    }}
                    disabled={loading}
                  >
                    {loading ? "Posting..." : "Post"}
                  </button>
                </div>                
              </div>
            </div>
          )}

          <div style={styles.filters}>
            {[
              { label: "All Posts", value: "all" },
              { label: "Most Liked", value: "mostLiked" },
              { label: "Most Commented", value: "mostCommented" }
            ].map((f) => (
              <button
                key={f.value}
                style={{
                  ...styles.filterBtn,
                  backgroundColor: filter === f.value ? "#1877f2" : "#fff",
                  color: filter === f.value ? "#fff" : "#555",
                  border: filter === f.value ? "1px solid #1877f2" : "1px solid #ddd"
                }}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {getFilteredPosts().length === 0 ? (
            <div style={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p style={styles.emptyText}>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            getFilteredPosts().map((post) => (
              <PostCard key={post._id} post={post} onUpdate={handleUpdate} onDelete={() => fetchPosts(1, true)} />
            ))
          )}

          {/* Load More Button */}

          {hasMore && (
            <div style={styles.loadMoreWrapper}>
              <button
                style={{ ...styles.loadMoreBtn, opacity: loadingMore ? 0.6 : 1 }}
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "More posts"}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p style={styles.noMore}>You've seen all posts</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 },
  modalBox: { backgroundColor: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "360px", position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" },
  modalClose: { position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#888" },
  modalContent: { display: "flex", flexDirection: "column", alignItems: "center" },
  modalAvatar: { width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#1877f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "26px", marginBottom: "12px" },
  modalName: { fontWeight: "700", fontSize: "18px", color: "#1a1a1a", margin: "0 0 4px 0" },
  modalSub: { fontSize: "13px", color: "#888", margin: 0 },
  modalTitle: { fontWeight: "700", fontSize: "18px", color: "#1a1a1a", margin: "0 0 4px 0", textAlign: "center", width: "100%" },
  modalDivider: { height: "1px", backgroundColor: "#f0f0f0", width: "100%", margin: "16px 0" },
  modalInput: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e0e0e0", fontSize: "14px", marginBottom: "10px", boxSizing: "border-box", outline: "none", fontFamily: "inherit" },
  saveBtn: { width: "100%", padding: "10px", backgroundColor: "#1877f2", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  editError: { color: "#e53935", fontSize: "13px", marginBottom: "8px" },
  editSuccess: { color: "#43a047", fontSize: "13px", marginBottom: "8px" },
  statCard: { width: "100%", backgroundColor: "#f8f9fa", borderRadius: "10px", padding: "16px", marginBottom: "10px", textAlign: "center" },
  statNumber: { fontSize: "28px", fontWeight: "700", color: "#1877f2", margin: "0 0 4px 0" },
  statLabel: { fontSize: "13px", color: "#777", margin: 0 },
  navbar: { backgroundColor: "#fff", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  navInner: { maxWidth: "680px", margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo: { margin: 0, fontSize: "24px", color: "#1877f2", fontWeight: "700" },
  navRight: { display: "flex", alignItems: "center", gap: "12px", position: "relative" },
  profileWrapper: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "6px 10px", borderRadius: "8px", position: "relative", userSelect: "none" },
  navAvatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#1877f2", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  nameText: { fontSize: "14px", color: "#333", fontWeight: "500" },
  chevron: { fontSize: "10px", color: "#888" },
  dropdown: { position: "absolute", top: "48px", right: 0, backgroundColor: "#fff", borderRadius: "12px", padding: "8px", width: "180px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #e8e8e8", zIndex: 200 },
  dropdownItem: { width: "100%", padding: "10px 14px", background: "none", border: "none", borderRadius: "8px", fontSize: "14px", color: "#333", cursor: "pointer", textAlign: "left", fontWeight: "500" },
  dropdownDivider: { height: "1px", backgroundColor: "#f0f0f0", margin: "6px 0" },
  layout: { maxWidth: "680px", margin: "24px auto", padding: "0 24px" },
  feed: { 
    flex: 1, 
    minWidth: 0 
  },
  createBox: { 
    backgroundColor: "#fff", 
    borderRadius: "12px", 
    padding: "20px", 
    marginBottom: "16px", 
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)" 
  },
  createBottom: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    flexWrap: "wrap", 
    gap: "10px" 
  },
  fileInput: { 
    fontSize: "13px" 
  },
  postBtn: { 
    padding: "9px 24px", 
    backgroundColor: "#1877f2", 
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    fontSize: "14px", 
    fontWeight: "600" 
  },
  error: { 
    color: "#e53935", 
    fontSize: "13px", 
    marginBottom: "10px" 
  },
  filters: { 
    display: "flex", 
    gap: "10px", 
    marginBottom: "16px", 
    flexWrap: "wrap" 
  },
  filterBtn: { 
    padding: "8px 18px", 
    borderRadius: "20px", 
    fontSize: "13px", 
    cursor: "pointer", 
    fontWeight: "500" 
  },
  emptyState: { 
    textAlign: "center", 
    marginTop: "60px", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    gap: "12px" 
  },
  emptyText: {
    color: "#888",
    fontSize: "15px"
  },
  loadMoreWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "24px 0 8px 0"
  },
  loadMoreBtn: {
    padding: "9px 28px",
    backgroundColor: "#f8f9fa",
    color: "#1a73e8",
    border: "1px solid #dadce0",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.2px",
    transition: "background 0.15s, box-shadow 0.15s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
  },
  noMore: { 
    textAlign: "center",
    color: "#bbb", 
    fontSize: "13px", 
    padding: "16px 0"
  },
  createBox: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
  },
  createTrigger: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer"
  },
  triggerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#1877f2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0
  },
  triggerInput: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "24px",
    border: "1.5px solid #d0d0d0",
    fontSize: "14px",
    color: "#666",
    backgroundColor: "#fff",
    fontWeight: "500",
    transition: "border 0.2s"
  },
  postModalBox: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    width: "100%",
    maxWidth: "520px",
    position: "relative",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)"
  },
  postModalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid #f0f0f0",
    paddingBottom: "12px"
  },
  postModalTitle: {
    fontWeight: "700",
    fontSize: "16px",
    color: "#1a1a1a",
    margin: 0
  },
  postModalUser: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px"
  },
  postModalAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#1877f2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px"
  },
  postModalName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#1a1a1a"
  },
  postModalTextarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    resize: "none",
    height: "120px",
    boxSizing: "border-box",
    marginBottom: "16px",
    fontFamily: "inherit",
    outline: "none",
    color: "#333"
  },
  postModalBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "12px",
    flexWrap: "wrap",
    gap: "10px"
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f0f2f5",
    borderRadius: "20px",
    padding: "8px 16px",
    flex: 1,
    maxWidth: "300px"
  },
  searchInput: {
    border: "none",
    background: "none",
    outline: "none",
    fontSize: "14px",
    color: "#333",
    width: "100%",
    fontFamily: "inherit"
  },
  createTitle: {
    margin: "0 0 12px 0",
    fontWeight: "700",
    fontSize: "16px",
    color: "#1a1a1a"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    resize: "none",
    height: "80px",
    boxSizing: "border-box",
    marginBottom: "12px",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
    color: "#aaa"
  },
  createActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "10px"
  },
  createIcons: {
    display: "flex",
    gap: "8px"
  },
  iconBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "#1877f2",
    fontSize: "13px",
    fontWeight: "600"
  },
  iconLabel: {
    fontSize: "13px",
    color: "#1877f2",
    fontWeight: "600"
  },
  emojiBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center"
  },
};

export default Feed;