// src/components/DataTable.tsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit2Icon,
  Trash2Icon,
  SearchIcon,
  Loader2Icon,
} from 'lucide-react'
import { PaginatedResponse } from '@/types/academic'

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
}

interface DataTableProps<T extends { id: React.Key }> {
  data: PaginatedResponse<T>
  columns: Column<T>[]
  onPageChange: (page: number) => void
  onSearch: (term: string) => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  searchTerm: string
  actions?: boolean
  loading?: boolean
}

export function DataTable<T extends { id: React.Key }>({
  data,
  columns,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  searchTerm,
  actions = true,
  loading = false,
}: DataTableProps<T>) {
  const { pagination } = data

  // Local search state prevents focus loss on every keystroke
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchTerm.length >= 3 || localSearchTerm.length === 0) {
        onSearch(localSearchTerm)
      }
    }, 600)

    return () => clearTimeout(timeoutId)
  }, [localSearchTerm, onSearch])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white disabled:opacity-50"
          />
        </div>

        <div className="text-sm text-slate-500 whitespace-nowrap">
          Showing {(pagination.current_page - 1) * pagination.page_size + 1} to{' '}
          {Math.min(
            pagination.current_page * pagination.page_size,
            pagination.total_count,
          )}{' '}
          of {pagination.total_count} entries
        </div>
      </div>

      {/* DESKTOP TABLE - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 font-medium tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 font-medium tracking-wider text-right whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2Icon className="w-8 h-8 animate-spin text-orange-500" />
                    <span className="text-slate-500 text-sm font-medium">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No results found.
                </td>
              </tr>
            ) : (
              data.data.map((item, rowIndex) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap text-slate-700"
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2Icon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW - shown only on mobile */}
      <div className="md:hidden flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2Icon className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-slate-500 text-sm font-medium mt-3">Loading...</span>
          </div>
        ) : data.data.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No results found.</div>
        ) : (
          data.data.map((item, rowIndex) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow transition-all"
            >
              <div className="space-y-3">
                {columns.map((col, i) => {
                  const value =
                    typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : (item[col.accessor] as React.ReactNode)

                  return (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium text-slate-500">{col.header}</span>
                      <span className="text-slate-700 text-right">{value}</span>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-orange-100"
                  >
                    <Edit2Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                  >
                    <Trash2Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={!pagination.has_previous || loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              let pageNum = i + 1
              if (pagination.total_pages > 5 && pagination.current_page > 3) {
                pageNum = pagination.current_page - 2 + i
                if (pageNum > pagination.total_pages) {
                  pageNum = pagination.total_pages - (4 - i)
                }
              }
              if (pageNum > pagination.total_pages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pagination.current_page === pageNum
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  } disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={!pagination.has_next || loading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}