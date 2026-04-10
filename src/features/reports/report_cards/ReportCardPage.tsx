import React from 'react'
import { motion } from 'framer-motion'
import { FileTextIcon, ListIcon, ClipboardListIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GenerateReportTab } from './pages/GenerateReportTab'
import { GeneratedReportsTab } from './pages/GeneratedReportsTab'


export function ReportCardPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <ClipboardListIcon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Report Cards
              </h1>
              <p className="text-sm text-slate-500">
                Generate and manage student report cards
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: 0.1,
          }}
        >
          <Tabs defaultValue="generate">
            <TabsList className="mb-6">
              <TabsTrigger
                value="generate"
                className="flex items-center gap-1.5"
              >
                <FileTextIcon className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center gap-1.5"
              >
                <ListIcon className="w-4 h-4" />
                Generated Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <GenerateReportTab />
            </TabsContent>

            <TabsContent value="history">
              <GeneratedReportsTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
