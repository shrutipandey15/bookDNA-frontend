import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, Plus } from "lucide-react";
import { searchBooks } from "../../services/api";

export default function ShelfBookSearch({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback((q) => {
    if (q.length < 2) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchBooks(q);
        setResults(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  return (
    <div className="shelf-search-overlay" onClick={onClose}>
      <div className="shelf-search" onClick={e => e.stopPropagation()}>
        <div className="shelf-search__header">
          <Search size={16} />
          <input
            ref={inputRef}
            className="shelf-search__input"
            placeholder="Search any book to add to your shelf..."
            value={query}
            onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }}
          />
          <button className="shelf-search__close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="shelf-search__results">
          {searching && <div className="shelf-search__loading">Searching...</div>}
          {!searching && results.length === 0 && query.length >= 2 && (
            <div className="shelf-search__empty">No books found</div>
          )}
          {results.map((book, i) => (
            <button key={`${book.isbn || book.title}-${i}`} className="shelf-search__result" onClick={() => onSelect(book)}>
              {book.cover_url && <img src={book.cover_url} alt="" className="shelf-search__cover" />}
              <div className="shelf-search__info">
                <div className="shelf-search__title">{book.title}</div>
                <div className="shelf-search__author">{book.author}</div>
              </div>
              <Plus size={16} className="shelf-search__add-icon" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}