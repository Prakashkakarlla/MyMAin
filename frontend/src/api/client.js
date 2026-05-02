import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`,
  timeout: 10000,
})

// Attach JWT for admin requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle errors globally
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('jf_token')
      window.location.href = '/admin/login'
    }
    // Let the component handle 404, 422 etc with the error body
    return Promise.reject(err)
  }
)

export default api
