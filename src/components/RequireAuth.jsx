import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import supabase from '../supabase'
import useAuth from '../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="py-8 text-center">Cargando...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}
