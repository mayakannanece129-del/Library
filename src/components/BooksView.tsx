import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  CheckCircle,
  XCircle,
  Hash,
  Building,
  ArrowUpRight,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { Book, User } from '../types';

interface BooksViewProps {
  books: Book[];
  currentUser: User;
  onAddBook: (book: Partial<Book>) => Promise<void>;
  onEditBook: (id: string, book: Partial<Book>) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
  onShowQRCode: (book: Book) => void;
  onIssueBookDirect: (book: Book) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  currentUser,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onShowQRCode,
  onIssueBookDirect,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    quantity: 5,
    shelf_location: 'CS-A1-01',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories list
  const categories = [
    'All',
    'Computer Science',
    'Artificial Intelligence',
    'Mathematics',
    'Physics',
    'Engineering',
    'Medicine',
    'Business',
    'Literature',
  ];

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn.toLowerCase().includes(search.toLowerCase()) ||
      (book.publisher && book.publisher.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || book.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvailability =
      availabilityFilter === 'All' ||
      (availabilityFilter === 'available' && book.available_quantity > 0) ||
      (availabilityFilter === 'out_of_stock' && book.available_quantity === 0);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Computer Science',
      publisher: '',
      quantity: 5,
      shelf_location: 'General Stacks',
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher,
      quantity: book.quantity,
      shelf_location: book.shelf_location || 'General Stacks',
      description: book.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim() || !formData.publisher.trim()) {
      setFormError('Title, Author, ISBN, and Publisher are required fields.');
      return;
    }

    if (formData.quantity < 1) {
      setFormError('Quantity must be at least 1 copy.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBook) {
        await onEditBook(editingBook.id, formData);
      } else {
        await onAddBook(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (book.quantity !== book.available_quantity) {
      alert(`Cannot delete "${book.title}": ${book.quantity - book.available_quantity} copy is currently checked out to a student.`);
      return;
    }

    if (window.confirm(`Are you sure you want to remove "${book.title}" (ISBN: ${book.isbn}) from the library catalog?`)) {
      try {
        await onDeleteBook(book.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete book');
      }
    }
  };

  return (
    <div id="books-view" className="space-y-6">
      {/* Module Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Book Catalog Management
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Search, catalog, accession, and manage library volumes and availability status.
          </p>
        </div>

        {currentUser.role !== 'student' && (
          <button
            id="add-book-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="book-search-input"
              type="text"
              placeholder="Search by title, author, ISBN number, or publisher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              id="book-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-2">
            <select
              id="book-availability-filter"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 transition-colors"
            >
              <option value="All">All Stock Status</option>
              <option value="available">In Stock &gt; 0</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Grid vs Table Toggle */}
          <div className="md:col-span-1 flex items-center justify-end gap-1">
            <button
              id="view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredBooks.length}</strong> of {books.length} titles
          </span>
          {(search || selectedCategory !== 'All' || availabilityFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setAvailabilityFilter('All');
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title & Author</th>
                  <th className="py-3.5 px-4 font-semibold">ISBN & Category</th>
                  <th className="py-3.5 px-4 font-semibold">Publisher</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Availability</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No books matched your search criteria. Try a different query or add a new title.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const isAvailable = book.available_quantity > 0;
                    return (
                      <tr
                        key={book.id}
                        id={`book-row-${book.id}`}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Title & Author */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {book.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {book.author}
                          </p>
                        </td>

                        {/* ISBN & Category */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                            {book.isbn}
                          </span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                            {book.category}
                          </span>
                        </td>

                        {/* Publisher */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                          {book.publisher}
                        </td>

                        {/* Shelf Location */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {book.shelf_location || 'General Stacks'}
                          </span>
                        </td>

                        {/* Availability Pill */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                              }`}
                            >
                              {isAvailable ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>
                                {book.available_quantity} / {book.quantity} Available
                              </span>
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* QR Code */}
                            <button
                              id={`book-qr-${book.id}`}
                              onClick={() => onShowQRCode(book)}
                              title="Generate Book Accession QR Code"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Direct Issue shortcut */}
                            {currentUser.role !== 'student' && isAvailable && (
                              <button
                                id={`book-issue-${book.id}`}
                                onClick={() => onIssueBookDirect(book)}
                                title="Issue this book to a member"
                                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit */}
                            {currentUser.role !== 'student' && (
                              <button
                                id={`book-edit-${book.id}`}
                                onClick={() => handleOpenEdit(book)}
                                title="Edit Catalog Details"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete (Admin only) */}
                            {currentUser.role === 'admin' && (
                              <button
                                id={`book-delete-${book.id}`}
                                onClick={() => handleDelete(book)}
                                title="Delete from Catalog"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.available_quantity > 0;
            return (
              <div
                key={book.id}
                id={`book-card-${book.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                      {book.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                      }`}
                    >
                      {book.available_quantity} / {book.quantity} Available
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    By {book.author}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>ISBN:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {book.isbn}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Publisher:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                        {book.publisher}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {book.shelf_location || 'General Stacks'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onShowQRCode(book)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Label</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {currentUser.role !== 'student' && isAvailable && (
                      <button
                        onClick={() => onIssueBookDirect(book)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Issue
                      </button>
                    )}
                    {currentUser.role !== 'student' && (
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(book)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div
          id="book-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200 border border-rose-200 dark:border-rose-900">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Book Title *
                </label>
                <input
                  id="book-title-field"
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author(s) *
                  </label>
                  <input
                    id="book-author-field"
                    type="text"
                    required
                    placeholder="e.g. Thomas H. Cormen"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ISBN Number *
                  </label>
                  <input
                    id="book-isbn-field"
                    type="text"
                    required
                    placeholder="978-0262046305"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    id="book-category-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Publisher *
                  </label>
                  <input
                    id="book-publisher-field"
                    type="text"
                    required
                    placeholder="MIT Press"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Copies *
                  </label>
                  <input
                    id="book-quantity-field"
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shelf Location
                  </label>
                  <input
                    id="book-shelf-field"
                    type="text"
                    placeholder="CS-A1-04"
                    value={formData.shelf_location}
                    onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Book Description / Syllabus Notes
                </label>
                <textarea
                  id="book-desc-field"
                  rows={2}
                  placeholder="Brief synopsis, edition highlights, or recommended reading courses..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-book-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingBook ? 'Update Book' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
