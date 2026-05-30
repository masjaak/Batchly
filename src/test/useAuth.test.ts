import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/hooks/useAuth'

const { mockGetSession, mockSignInWithPassword, mockSignOut } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      organization: null,
      isLoading: false,
    })
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  it('starts with no user and no organization', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.organization).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('sets user when sign-in succeeds', async () => {
    const mockUser = { id: 'user-1', email: 'test@batchly.id' }
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    })
    mockGetSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    })

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      const error = await result.current.signIn('test@batchly.id', 'password123')
      expect(error).toBeNull()
    })
    expect(result.current.user).toEqual(mockUser)
  })

  it('clears user on sign-out', async () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@batchly.id' } as any,
      organization: { id: 'org-1', name: 'Test' } as any,
    })

    const { result } = renderHook(() => useAuthStore())
    await act(async () => {
      await result.current.signOut()
    })
    expect(result.current.user).toBeNull()
    expect(result.current.organization).toBeNull()
  })

  it('handles login error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    })

    const { result } = renderHook(() => useAuthStore())
    let error: string | null = null
    await act(async () => {
      error = await result.current.signIn('wrong@email.com', 'wrongpassword')
    })
    expect(error).toBe('Invalid credentials')
    expect(result.current.user).toBeNull()
  })

  it('validates email format before sign-in', async () => {
    const { result } = renderHook(() => useAuthStore())
    let error: string | null = null
    await act(async () => {
      error = await result.current.signIn('not-an-email', 'password123')
    })
    expect(error).toBe('Email tidak valid')
  })

  it('validates password length before sign-in', async () => {
    const { result } = renderHook(() => useAuthStore())
    let error: string | null = null
    await act(async () => {
      error = await result.current.signIn('test@batchly.id', 'ab')
    })
    expect(error).toBe('Password minimal 6 karakter')
  })
})
