import { BarChart3, FileText, GitCompare, Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { activityService } from '../services/activity.service'
import { metricsService } from '../services/metrics.service'
import type { Activity } from '../types/activity.types'
import type { DashboardMetrics } from '../types/metrics.types'

const HomePage: React.FC = () => {
  // Metrics state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  // Activity state
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  // Fetch metrics on component mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true)
        setMetricsError(null)
        const data = await metricsService.getAllMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to load metrics:', error)
        setMetricsError(
          error instanceof Error ? error.message : 'Failed to load metrics'
        )
      } finally {
        setMetricsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true)
        setActivitiesError(null)
        const response = await activityService.getRecentActivities({ limit: 10 })
        setActivities(response.items)
      } catch (error) {
        console.error('Failed to load activities:', error)
        setActivitiesError(
          error instanceof Error ? error.message : 'Failed to load recent activities'
        )
      } finally {
        setActivitiesLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to SEPE Templates Comparator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Efficiently compare and manage SEPE PDF templates with automated analysis and tracking.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Templates
              </p>
              {metricsLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse mt-1"></div>
              ) : metricsError ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1" title={metricsError}>
                  Error
                </p>
              ) : metrics ? (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics.templates.total_versions} <span className="text-sm text-gray-500">versions of</span> {metrics.templates.total_templates} <span className="text-sm text-gray-500">templates</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Active Comparisons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <GitCompare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Comparisons
              </p>
              {metricsLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mt-1"></div>
              ) : metricsError ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1" title={metricsError}>
                  Error
                </p>
              ) : metrics ? (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics.comparisons.total_comparisons}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Month
              </p>
              {metricsLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mt-1"></div>
              ) : metricsError ? (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1" title={metricsError}>
                  Error
                </p>
              ) : metrics ? (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metrics.activity.activities_this_month}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/analyze"
            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Upload Template
            </span>
          </Link>
          
          <Link
            to="/comparisons/create"
            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <GitCompare className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              New Comparison
            </span>
          </Link>
          
          <Link
            to="/templates"
            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Browse Templates
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>

        {/* Loading State */}
        {activitiesLoading && (
          <div className="space-y-3" role="status" aria-label="Loading activities">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2 animate-pulse">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!activitiesLoading && activitiesError && (
          <div 
            className="flex items-center justify-center py-8 text-center"
            role="alert"
            aria-live="polite"
          >
            <div className="text-sm text-red-600 dark:text-red-400">
              <p className="font-medium mb-1">Unable to load recent activities</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activitiesError}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!activitiesLoading && !activitiesError && activities.length === 0 && (
          <div 
            className="flex items-center justify-center py-8 text-center"
            role="status"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity to display
            </p>
          </div>
        )}

        {/* Activities List */}
        {!activitiesLoading && !activitiesError && activities.length > 0 && (
          <div className="space-y-3" role="list" aria-label="Recent activities">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between py-2"
                role="listitem"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-2 h-2 ${activityService.getActivityColor(activity.activity_type)} rounded-full`}
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {activity.description}
                  </span>
                </div>
                <span className="text-xs text-gray-400" title={activity.timestamp}>
                  {activityService.formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
