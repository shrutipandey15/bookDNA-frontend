import { X, BookOpen } from "lucide-react";

export default function BookInfoPanel({ book, onClose, onLogBook }) {
  return (
    <div className="book-info-overlay" onClick={onClose}>
      <div className="book-info" onClick={e => e.stopPropagation()}>
        <button className="book-info__close" onClick={onClose}><X size={16} /></button>
        <div className="book-info__header">
          {book.cover_url && <img src={book.cover_url} alt="" className="book-info__cover" />}
          <div>
            <div className="book-info__title">{book.title}</div>
            <div className="book-info__author">{book.author}</div>
          </div>
        </div>
        <div className="book-info__desc">On your shelf — not yet logged with emotions.</div>
        <button className="book-info__log-btn" onClick={onLogBook}>
          <BookOpen size={14} /> Log This Book
        </button>
      </div>
    </div>
  );
}