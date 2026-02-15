import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicStream, getPublicEchoes } from "../services/api"; 
import { useAuth } from "../contexts/AuthContext";
import { Echoes } from "../components/Panels";
import ShareModal from "../components/ShareModal";
import "./AuthPage.css"; 

export default function EchoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("community"); 
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [shareConfig, setShareConfig] = useState(null); 

  useEffect(() => {
    fetchEchoes();
  }, [activeTab]);

  const fetchEchoes = async () => {
    setLoading(true);
    try {
      let data;
      
      if (activeTab === "mine") {
        if (!user) return; 
        data = await getPublicEchoes(user.username);
      } else {
        data = await getPublicStream();
      }

      setEntries(data.echoes || []);
    } catch (err) {
      console.error("Failed to load echoes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = (entry) => {
    if (activeTab === "mine") {
      setShareConfig({
        endpoint: `/public/echo/${entry.entry_id}/story`,
        filename: `story-${entry.title.slice(0, 10).replace(/\s+/g, '-')}.png`
      });
    }
  };

  return (
    <div className="page-container" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header className="echo-header" style={{ marginBottom: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#888', 
              fontSize: '1.2rem', 
              cursor: 'pointer', 
              padding: '5px'
            }}
            title="Back to Dashboard"
          >
            ←
          </button>
          <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>Echoes</h1>
        </div>

        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === "community" ? "active" : ""}`}
            onClick={() => setActiveTab("community")}
          >
            Community
          </button>
          <button 
            className={`tab-btn ${activeTab === "mine" ? "active" : ""}`}
            onClick={() => setActiveTab("mine")}
          >
            My Echoes
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-state">Listening for echoes...</div>
      ) : (
        <Echoes 
          entries={entries} 
          onShare={activeTab === "mine" ? handleShareClick : null} 
        />
      )}

      <ShareModal
        isOpen={!!shareConfig}
        onClose={() => setShareConfig(null)}
        endpoint={shareConfig?.endpoint}
        filename={shareConfig?.filename}
      />

      <style>{`
        .tab-switcher {
          display: flex;
          gap: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }
        .tab-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 1rem;
          cursor: pointer;
          padding: 5px 0;
          transition: color 0.2s;
        }
        .tab-btn.active {
          color: white;
          border-bottom: 2px solid white;
        }
        .tab-btn:hover { color: #ccc; }
      `}</style>
    </div>
  );
}