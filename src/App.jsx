import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  UserCircle,
  X,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useEffect, useRef, useState } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import api from './services/api';

const chartColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

function AppShell({ children, role = 'student' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = role === 'faculty'
    ? [
        { label: 'Dashboard', to: '/faculty/dashboard', icon: LayoutDashboard },
        { label: 'Create Quiz', to: '/faculty/create-quiz', icon: ClipboardList },
        { label: 'Results', to: '/faculty/results', icon: ShieldCheck },
        { label: 'My Profile', to: '/faculty/profile', icon: UserCircle },
      ]
    : role === 'admin'
      ? [
          { label: 'User Management', to: '/admin', icon: UserCircle },
        ]
      : [
        { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Available Quizzes', to: '/student/quizzes', icon: BookOpen },
        { label: 'My Results', to: '/student/results', icon: CheckCircle2 },
        { label: 'My Profile', to: '/student/profile', icon: UserCircle },
      ];

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
      navigate('/auth');
    } catch {
      toast.error('Unable to log out.');
    }
  };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Academic</p>
            <h1 className="text-lg font-semibold">Quiz Dashboard</h1>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav id="app-navigation" aria-label="Main navigation" className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mx-4 mb-4 rounded-xl border border-slate-700 bg-slate-800/80 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
              {user?.profileImage
                ? <img src={user.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                : <span className="text-sm font-semibold">{user?.name?.charAt(0)?.toUpperCase() || <UserCircle className="h-5 w-5" />}</span>}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400">{user?.role || role}</p>
            </div>
            <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-slate-300 hover:bg-slate-700">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen p-3 pt-4 sm:p-6 lg:ml-72">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:mb-6 sm:px-5 sm:py-4">
          <div>
            <p className="text-xs text-slate-500 sm:text-sm">{role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty workspace' : 'Student workspace'}</p>
            <h2 className="text-lg font-bold text-slate-900 sm:text-2xl">{role === 'admin' ? 'Admin Dashboard' : role === 'faculty' ? 'Faculty Dashboard' : 'Student Dashboard'}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="app-navigation"
              onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => navigate(role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard')}
              className="min-h-11 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:px-4"
            >
              Overview
            </button>
          </div>
        </div>
        <div className="page-enter">{children}</div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent = 'indigo' }) {
  const accentClasses = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${accentClasses[accent]}`}>
        {label}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StudentDashboardPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('/student/quizzes/available');
      setQuizzes(data.quizzes || []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    const timer = setInterval(fetchQuizzes, 30000);
    return () => clearInterval(timer);
  }, []);

  const statusClasses = {
    upcoming: 'bg-amber-100 text-amber-700',
    available: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-sky-100 text-sky-700',
    expired: 'bg-rose-100 text-rose-700',
  };

  const statusLabel = {
    upcoming: 'Upcoming',
    available: 'Available',
    in_progress: 'In Progress',
    completed: 'Completed',
    expired: 'Expired',
  };

  return (
    <AppShell role="student">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Available" value={String(quizzes.filter((item) => item.status === 'available').length)} accent="indigo" />
        <StatCard label="Upcoming" value={String(quizzes.filter((item) => item.status === 'upcoming').length)} accent="amber" />
        <StatCard label="Completed" value={String(quizzes.filter((item) => item.status === 'completed').length)} accent="green" />
        <StatCard label="In Progress" value={String(quizzes.filter((item) => item.status === 'in_progress').length)} accent="indigo" />
        <StatCard label="Expired" value={String(quizzes.filter((item) => item.status === 'expired').length)} accent="red" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Available quizzes</h3>
          <button type="button" onClick={fetchQuizzes} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading quizzes...
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No quizzes are currently available for your department and course.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {quizzes.map((quiz) => {
              const actionLabel = quiz.status === 'upcoming'
                ? 'Not Available Yet'
                : quiz.status === 'expired'
                  ? 'Quiz Closed'
                  : quiz.status === 'completed'
                    ? 'Completed'
                    : quiz.status === 'in_progress'
                      ? 'Resume Quiz'
                      : 'Start Quiz';
              const isActionDisabled = ['upcoming', 'expired', 'completed'].includes(quiz.status);

              return (
                <div key={quiz._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900">{quiz.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{quiz.subject} • {quiz.course}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[quiz.status] || 'bg-slate-100 text-slate-700'}`}>
                      {statusLabel[quiz.status] || 'Available'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-700">Questions:</span> {quiz.totalQuestions || 0}</p>
                    <p><span className="font-medium text-slate-700">Total Marks:</span> {quiz.totalMarks || 0}</p>
                    <p><span className="font-medium text-slate-700">Starts:</span> {new Date(quiz.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p><span className="font-medium text-slate-700">Ends:</span> {new Date(quiz.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setSelectedQuiz(quiz)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => (isActionDisabled ? null : navigate(`/student/quiz/${quiz._id}`))}
                      disabled={isActionDisabled}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold text-white ${isActionDisabled ? 'cursor-not-allowed bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                    >
                      {actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quiz Details</p>
                <h3 className="text-2xl font-bold text-slate-900">{selectedQuiz.title}</h3>
              </div>
              <button type="button" onClick={() => setSelectedQuiz(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Description:</span> {selectedQuiz.description || 'No description provided.'}</p>
              <p><span className="font-semibold text-slate-900">Questions:</span> {selectedQuiz.totalQuestions || 0}</p>
              <p><span className="font-semibold text-slate-900">Total Marks:</span> {selectedQuiz.totalMarks || 0}</p>
              <p><span className="font-semibold text-slate-900">Start Time:</span> {new Date(selectedQuiz.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p><span className="font-semibold text-slate-900">End Time:</span> {new Date(selectedQuiz.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p><span className="font-semibold text-slate-900">Duration:</span> {selectedQuiz.duration} Minutes</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedQuiz(null);
                  navigate(`/student/quiz/${selectedQuiz._id}`);
                }}
                disabled={selectedQuiz.status === 'upcoming' || selectedQuiz.status === 'expired'}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${selectedQuiz.status === 'upcoming' || selectedQuiz.status === 'expired' ? 'cursor-not-allowed bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function FacultyDashboardPage() {
  const participation = [
    { name: 'Quiz A', attempts: 12 },
    { name: 'Quiz B', attempts: 21 },
    { name: 'Quiz C', attempts: 15 },
    { name: 'Quiz D', attempts: 28 },
  ];

  const scoreBreakdown = [
    { name: 'A grade', value: 18 },
    { name: 'B grade', value: 31 },
    { name: 'C grade', value: 28 },
    { name: 'Below average', value: 13 },
  ];

  return (
    <AppShell role="faculty">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Quizzes" value="24" accent="indigo" />
        <StatCard label="Scheduled" value="08" accent="amber" />
        <StatCard label="Active" value="06" accent="green" />
        <StatCard label="Completed" value="10" accent="red" />
        <StatCard label="Attempts" value="148" accent="indigo" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Participation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participation}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Score distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={scoreBreakdown} dataKey="value" nameKey="name" outerRadius={90} fill="#10b981">
                  {scoreBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data.profile);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || 'Unable to load student profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const details = [
    { label: 'Name', value: profile?.name },
    { label: 'Student ID', value: profile?.studentId },
    { label: 'Email', value: profile?.email },
    { label: 'Phone number', value: profile?.phoneNumber },
    { label: 'Department', value: profile?.department },
    { label: 'Course', value: profile?.course },
    { label: 'Semester', value: profile?.semester ? `Semester ${profile.semester}` : null },
    { label: 'Parent contact', value: profile?.parentContactNumber },
    { label: 'Account status', value: profile?.isActive === false ? 'Inactive' : 'Active' },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/30">
                {profile?.name?.charAt(0)?.toUpperCase() || <UserCircle className="h-8 w-8" />}
              </div>
              <div>
                <p className="text-sm text-indigo-100">Student account</p>
                <h3 className="mt-1 text-2xl font-bold">{profile?.name || 'Student profile'}</h3>
                <p className="mt-1 text-sm text-indigo-100">{profile?.studentId || 'Student ID unavailable'}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-5">
              <h4 className="text-lg font-semibold text-slate-900">Profile details</h4>
              <p className="mt-1 text-sm text-slate-500">Your academic and contact information associated with this account.</p>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500">Loading profile…</p>
            ) : error ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-2">
                {details.map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4 transition-colors hover:bg-indigo-50/70">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-slate-900">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function FacultyResultsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResults = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/faculty/results');
      const loadedQuizzes = data.quizzes || [];
      setQuizzes(loadedQuizzes);
      setResults(data.results || []);
      setSelectedQuizId((currentId) => (
        loadedQuizzes.some((quiz) => quiz._id === currentId)
          ? currentId
          : loadedQuizzes[0]?._id || ''
      ));
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Unable to load quiz results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const selectedQuiz = quizzes.find((quiz) => quiz._id === selectedQuizId);
  const quizResults = results.filter((result) => {
    const resultQuizId = typeof result.quizId === 'object' ? result.quizId?._id : result.quizId;
    return resultQuizId === selectedQuizId;
  });
  const completedResults = quizResults.filter((result) => (
    ['submitted', 'auto_submitted', 'expired', 'terminated'].includes(result.status)
  ));
  const averageMarks = completedResults.length
    ? completedResults.reduce((sum, result) => sum + (Number(result.obtainedMarks) || 0), 0) / completedResults.length
    : null;
  const durations = completedResults
    .filter((result) => result.startedAt && result.submittedAt)
    .map((result) => new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime())
    .filter((duration) => Number.isFinite(duration) && duration >= 0);
  const averageDuration = durations.length
    ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length
    : null;
  const screenSwitchers = quizResults.filter((result) => (
    (result.tabSwitchCount || 0) > 0
    || result.securityEvents?.some((event) => event.eventType === 'tab_switch')
  ));
  const formatDuration = (duration) => {
    if (duration === null) return '—';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };
  const formatDate = (date) => (
    date ? new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'
  );

  return (
    <AppShell role="faculty">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Quiz Results</h3>
            <p className="mt-1 text-sm text-slate-500">Select a quiz to review student scores and security activity.</p>
          </div>
          <button
            type="button"
            onClick={loadResults}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={loadResults} className="font-semibold underline">Try again</button>
          </div>
        )}

        {!error && !loading && quizzes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No quizzes found. Create and publish a quiz to see its results here.
          </div>
        )}

        {quizzes.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-[minmax(250px,0.8fr)_minmax(0,2fr)]">
            <section className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Your quizzes ({quizzes.length})</h4>
              {quizzes.map((quiz) => {
                const attemptCount = results.filter((result) => {
                  const resultQuizId = typeof result.quizId === 'object' ? result.quizId?._id : result.quizId;
                  return resultQuizId === quiz._id;
                }).length;
                const selected = quiz._id === selectedQuizId;
                return (
                  <button
                    type="button"
                    key={quiz._id}
                    onClick={() => setSelectedQuizId(quiz._id)}
                    aria-pressed={selected}
                    className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${selected ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <span className="block font-semibold text-slate-900">{quiz.title}</span>
                    <span className="mt-1 block text-sm text-slate-500">{quiz.subject} · {quiz.course} · Semester {quiz.semester}</span>
                    <span className="mt-3 flex justify-between text-xs text-slate-500">
                      <span>{attemptCount} {attemptCount === 1 ? 'attempt' : 'attempts'}</span>
                      <span>{quiz.totalMarks || 0} total marks</span>
                    </span>
                  </button>
                );
              })}
            </section>

            {selectedQuiz && (
              <section className="min-w-0 space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{selectedQuiz.subject} · {selectedQuiz.course}</p>
                      <h4 className="mt-1 text-xl font-bold text-slate-900">{selectedQuiz.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">Semester {selectedQuiz.semester} · {selectedQuiz.status}</p>
                    </div>
                    <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {quizResults.length} {quizResults.length === 1 ? 'attempt' : 'attempts'}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Total marks</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{selectedQuiz.totalMarks || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-sm text-slate-500"><CheckCircle2 className="h-4 w-4" /> Average marks</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{averageMarks === null ? '—' : `${averageMarks.toFixed(2)} / ${selectedQuiz.totalMarks || 0}`}</p>
                      <p className="mt-1 text-xs text-slate-500">Across {completedResults.length} completed attempts</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-sm text-slate-500"><Clock3 className="h-4 w-4" /> Average time</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{formatDuration(averageDuration)}</p>
                      <p className="mt-1 text-xs text-slate-500">Across {durations.length} completed attempts</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-amber-950">Screen-switch security activity</h4>
                      <p className="mt-1 text-sm text-amber-800">Students recorded as switching away from the quiz while it was active.</p>
                      {screenSwitchers.length === 0 ? (
                        <p className="mt-3 text-sm text-amber-900">No screen-switch events recorded for this quiz.</p>
                      ) : (
                        <ul className="mt-3 divide-y divide-amber-200">
                          {screenSwitchers.map((attempt) => (
                            <li key={attempt._id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                              <span className="font-medium text-amber-950">
                                {attempt.studentId?.name || 'Unknown student'}
                                {attempt.studentId?.studentId && <span className="ml-2 font-normal text-amber-800">({attempt.studentId.studentId})</span>}
                              </span>
                              <span className="text-amber-800">
                                {attempt.tabSwitchCount || attempt.securityEvents?.filter((event) => event.eventType === 'tab_switch').length || 0} screen switch(es)
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h4 className="font-semibold text-slate-900">Student results</h4>
                  </div>
                  {quizResults.length === 0 ? (
                    <p className="p-6 text-sm text-slate-500">No students have attempted this quiz yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Marks</th>
                            <th className="px-4 py-3">Percentage</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Screen switches</th>
                            <th className="px-4 py-3">Submitted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {quizResults.map((attempt) => (
                            <tr key={attempt._id}>
                              <td className="px-4 py-3">
                                <span className="block font-medium text-slate-900">{attempt.studentId?.name || 'Unknown student'}</span>
                                <span className="block text-xs text-slate-500">{attempt.studentId?.studentId || attempt.studentId?.email || 'Student ID unavailable'}</span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{attempt.obtainedMarks || 0} / {attempt.totalMarks ?? selectedQuiz.totalMarks ?? 0}</td>
                              <td className="px-4 py-3">{Number(attempt.percentage || 0).toFixed(1)}%</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{(attempt.status || 'unknown').replaceAll('_', ' ')}</span>
                              </td>
                              <td className="px-4 py-3">{attempt.tabSwitchCount || 0}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(attempt.submittedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function FacultyProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/faculty/profile');
        setProfile(data.profile);
        setUser(data.profile);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load faculty profile.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setUser]);

  const updateProfileImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Profile pictures must be 1 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => toast.error('Unable to read the selected image.');
    reader.onload = async () => {
      setSaving(true);
      try {
        const { data } = await api.patch('/faculty/profile', { profileImage: reader.result });
        setProfile(data.profile);
        setUser(data.profile);
        toast.success('Profile picture updated.');
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to update profile picture.');
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearProfileImage = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/faculty/profile', { profileImage: null });
      setProfile(data.profile);
      setUser(data.profile);
      toast.success('Profile picture removed.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to remove profile picture.');
    } finally {
      setSaving(false);
    }
  };

  const details = [
    { label: 'Name', value: profile?.name || '—' },
    { label: 'Emp_ID', value: profile?.employeeId || '—' },
    { label: 'Courses', value: profile?.courses?.join(', ') || '—' },
    { label: 'Semesters', value: profile?.semesters?.map((semester) => `Semester ${semester}`).join(', ') || '—' },
    { label: 'Account status', value: profile?.isActive === false ? 'Inactive' : 'Active' },
  ];

  return (
    <AppShell role="faculty">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-3xl font-bold text-indigo-700 ring-4 ring-indigo-50">
              {profile?.profileImage
                ? <img src={profile.profileImage} alt={`${profile.name || 'Faculty'} profile`} className="h-full w-full object-cover" />
                : profile?.name?.charAt(0)?.toUpperCase() || <UserCircle className="h-14 w-14" />}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold text-slate-900">{profile?.name || 'Faculty profile'}</h3>
              <p className="mt-1 text-sm text-slate-500">Update your profile picture and review your faculty details.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={updateProfileImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : profile?.profileImage ? 'Change picture' : 'Upload picture'}
                </button>
                {profile?.profileImage && (
                  <button
                    type="button"
                    onClick={clearProfileImage}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove picture
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">PNG, JPG, or WebP; up to 1 MB.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-slate-900">Profile details</h3>
          {loading ? (
            <p className="text-sm text-slate-500">Loading profile…</p>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function QuizBuilderPage() {
  const { user } = useAuth();

  const buildQuestion = (index = 0) => ({
    id: `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    questionText: '',
    marks: 1,
    options: ['A', 'B', 'C', 'D'].map((optionId) => ({ id: optionId, text: '' })),
    correctAnswer: 'A',
    explanation: '',
  });

  const createEmptyQuiz = () => {
    const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

    return {
      title: '',
      description: '',
      instructions: '',
      subject: 'Computer Science',
      department: 'BCA',
      semester: user?.semesters?.[0] || 1,
      course: 'AIML',
      duration: 30,
      passingMarks: 1,
      startTime,
      endTime,
      showQuestionNumber: true,
      showMarksToStudents: false,
      questions: [buildQuestion(0)],
    };
  };

  const [quiz, setQuiz] = useState(createEmptyQuiz);
  const [errors, setErrors] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState(null);

  const totalMarks = quiz.questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0);

  const updateQuizField = (field, value) => {
    setQuiz((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateQuestion = (index, patch) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)),
    }));
    setErrors((current) => ({ ...current, [`question-${index}`]: undefined }));
  };

  const addQuestion = () => {
    setQuiz((current) => ({
      ...current,
      questions: [...current.questions, buildQuestion(current.questions.length)],
    }));
  };

  const duplicateQuestion = (index) => {
    setQuiz((current) => {
      const question = current.questions[index];
      const duplicate = {
        ...question,
        id: `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        options: question.options.map((option) => ({ ...option })),
      };

      return {
        ...current,
        questions: [...current.questions.slice(0, index + 1), duplicate, ...current.questions.slice(index + 1)],
      };
    });
  };

  const removeQuestion = (index) => {
    setQuiz((current) => {
      if (current.questions.length === 1) {
        return { ...current, questions: [buildQuestion(0)] };
      }

      return {
        ...current,
        questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
      };
    });
  };

  const moveQuestion = (index, direction) => {
    setQuiz((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.questions.length) {
        return current;
      }

      const nextQuestions = [...current.questions];
      [nextQuestions[index], nextQuestions[nextIndex]] = [nextQuestions[nextIndex], nextQuestions[index]];
      return { ...current, questions: nextQuestions };
    });
  };

  const setOptionCount = (questionIndex, optionCount) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        const nextOptions = Array.from({ length: optionCount }, (_, optionIndex) => {
          const existing = question.options[optionIndex];
          return existing || { id: ['A', 'B', 'C', 'D', 'E'][optionIndex], text: '' };
        });

        const nextCorrectAnswer = nextOptions.some((option) => option.id === question.correctAnswer)
          ? question.correctAnswer
          : nextOptions[0]?.id || 'A';

        return {
          ...question,
          options: nextOptions,
          correctAnswer: nextCorrectAnswer,
        };
      }),
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setQuiz((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, currentOptionIndex) => (
            currentOptionIndex === optionIndex ? { ...option, text: value } : option
          )),
        };
      }),
    }));
  };

  const validateQuiz = () => {
    const nextErrors = {};

    if (!quiz.title.trim()) {
      nextErrors.title = 'Quiz title is required.';
    }

    if (!Number.isFinite(Number(quiz.duration)) || Number(quiz.duration) <= 0) {
      nextErrors.duration = 'Quiz duration must be greater than 0.';
    }

    if (!quiz.startTime) {
      nextErrors.startTime = 'Start date and time are required.';
    }

    if (!quiz.endTime) {
      nextErrors.endTime = 'End date and time are required.';
    }

    if (quiz.startTime && quiz.endTime && new Date(quiz.endTime) <= new Date(quiz.startTime)) {
      nextErrors.endTime = 'End time must be after the quiz start time.';
    }

    if (!Number.isFinite(Number(quiz.passingMarks)) || Number(quiz.passingMarks) < 0 || Number(quiz.passingMarks) > totalMarks) {
      nextErrors.passingMarks = 'Passing marks must be between 0 and total marks.';
    }

    if (!quiz.questions.length) {
      nextErrors.questions = 'At least one question is required.';
    }

    quiz.questions.forEach((question, questionIndex) => {
      const questionErrors = {};

      if (!question.questionText.trim()) {
        questionErrors.questionText = 'Question text is required.';
      }

      if (!Number.isFinite(Number(question.marks)) || Number(question.marks) <= 0) {
        questionErrors.marks = 'Marks must be greater than 0.';
      }

      if (question.options.length < 4) {
        questionErrors.options = 'Each question needs at least 4 options.';
      }

      question.options.forEach((option, optionIndex) => {
        if (!option.text.trim()) {
          questionErrors[`option-${optionIndex}`] = 'Option text cannot be empty.';
        }
      });

      if (!question.correctAnswer || !question.options.some((option) => option.id === question.correctAnswer)) {
        questionErrors.correctAnswer = 'Select a correct answer.';
      }

      if (Object.keys(questionErrors).length) {
        nextErrors[`question-${questionIndex}`] = questionErrors;
      }
    });

    return nextErrors;
  };

  const submitQuiz = async (publish = false) => {
    const nextErrors = validateQuiz();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the highlighted quiz errors before saving.');
      return;
    }

    setSaving(true);

    const payload = {
      title: quiz.title.trim(),
      description: quiz.description.trim(),
      instructions: quiz.instructions.trim(),
      subject: quiz.subject.trim() || 'General',
      department: quiz.department,
      semester: Number(quiz.semester) || 1,
      course: quiz.course.trim() || 'General',
      duration: Number(quiz.duration),
      passingMarks: Number(quiz.passingMarks),
      totalQuestions: quiz.questions.length,
      totalMarks,
      showQuestionNumber: quiz.showQuestionNumber,
      showMarksToStudents: quiz.showMarksToStudents,
      status: publish ? 'scheduled' : 'draft',
      startTime: new Date(quiz.startTime).toISOString(),
      endTime: new Date(quiz.endTime).toISOString(),
      resultVisibility: 'after_end',
      questions: quiz.questions.map((question, index) => ({
        id: question.id,
        questionType: 'mcq',
        questionText: question.questionText.trim(),
        marks: Number(question.marks),
        correctAnswer: question.correctAnswer,
        options: question.options.map((option) => ({ id: option.id, text: option.text.trim() })),
        order: index + 1,
        explanation: question.explanation || '',
      })),
    };

    try {
      const endpoint = quizId ? `/quizzes/${quizId}` : '/quizzes';
      const method = quizId ? 'patch' : 'post';
      const { data } = await api[method](endpoint, payload);
      const savedQuiz = data.quiz || data.data?.quiz;

      if (savedQuiz?._id) {
        setQuizId(savedQuiz._id);
      }

      toast.success(publish ? 'Quiz published successfully.' : 'Quiz draft saved successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell role="faculty">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Quiz authoring</p>
            <h3 className="text-2xl font-bold text-slate-900">Create Quiz</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setPreviewOpen(true)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
              Preview Quiz
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Quiz Title
            <input
              name="title"
              value={quiz.title}
              onChange={(event) => updateQuizField('title', event.target.value)}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 ${errors.title ? 'border-red-400' : 'border-slate-200'}`}
              placeholder="e.g. Mid Semester Assessment"
            />
            {errors.title && <span className="text-xs font-medium text-red-600">{errors.title}</span>}
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Subject
            <input
              name="subject"
              value={quiz.subject}
              onChange={(event) => updateQuizField('subject', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Department
            <select
              name="department"
              value={quiz.department}
              onChange={(event) => updateQuizField('department', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              <option value="BCA">BCA</option>
              <option value="B.Tech">B.Tech</option>
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Semester
            <select
              name="semester"
              value={quiz.semester}
              onChange={(event) => updateQuizField('semester', Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Course (must match students' course)
            <input
              name="course"
              value={quiz.course}
              onChange={(event) => updateQuizField('course', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            />
            <span className="block text-xs font-normal text-slate-500">
              Published quizzes appear only for students with the same department, semester, and course.
            </span>
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Duration (minutes)
            <input
              name="duration"
              type="number"
              min="1"
              value={quiz.duration}
              onChange={(event) => updateQuizField('duration', Number(event.target.value))}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 ${errors.duration ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.duration && <span className="text-xs font-medium text-red-600">{errors.duration}</span>}
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Passing Marks
            <input
              type="number"
              min="0"
              value={quiz.passingMarks}
              onChange={(event) => updateQuizField('passingMarks', Number(event.target.value))}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 ${errors.passingMarks ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.passingMarks && <span className="text-xs font-medium text-red-600">{errors.passingMarks}</span>}
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Start Date & Time
            <input
              type="datetime-local"
              value={quiz.startTime}
              onChange={(event) => updateQuizField('startTime', event.target.value)}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 ${errors.startTime ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.startTime && <span className="text-xs font-medium text-red-600">{errors.startTime}</span>}
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            End Date & Time
            <input
              type="datetime-local"
              value={quiz.endTime}
              onChange={(event) => updateQuizField('endTime', event.target.value)}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 ${errors.endTime ? 'border-red-400' : 'border-slate-200'}`}
            />
            {errors.endTime && <span className="text-xs font-medium text-red-600">{errors.endTime}</span>}
          </label>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Number of Questions</span>
            <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700">
              {quiz.questions.length}
            </div>
          </div>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Total Marks</span>
            <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700">
              {totalMarks}
            </div>
          </div>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Show Question Number</span>
            <button
              type="button"
              onClick={() => updateQuizField('showQuestionNumber', !quiz.showQuestionNumber)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 ${quiz.showQuestionNumber ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <span>{quiz.showQuestionNumber ? 'ON' : 'OFF'}</span>
              <span className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${quiz.showQuestionNumber ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <span className={`h-4 w-4 rounded-full bg-white transition ${quiz.showQuestionNumber ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>

          <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Show Marks to Students</span>
            <button
              type="button"
              onClick={() => updateQuizField('showMarksToStudents', !quiz.showMarksToStudents)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 ${quiz.showMarksToStudents ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
            >
              <span>{quiz.showMarksToStudents ? 'ON' : 'OFF'}</span>
              <span className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${quiz.showMarksToStudents ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                <span className={`h-4 w-4 rounded-full bg-white transition ${quiz.showMarksToStudents ? 'translate-x-5' : 'translate-x-0'}`} />
              </span>
            </button>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            Quiz Description / Instructions
            <textarea
              rows="4"
              value={quiz.description}
              onChange={(event) => updateQuizField('description', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              placeholder="Add instructions, context, or assessment details"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            Student Instructions
            <textarea
              rows="3"
              value={quiz.instructions}
              onChange={(event) => updateQuizField('instructions', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              placeholder="Read the question carefully..."
            />
          </label>
        </div>

        <div className="mt-8 space-y-5">
          {quiz.questions.map((question, questionIndex) => {
            const questionErrors = errors[`question-${questionIndex}`] || {};
            const optionLetters = ['A', 'B', 'C', 'D', 'E'];

            return (
              <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h4 className="text-xl font-semibold text-slate-900">
                    {quiz.showQuestionNumber ? `Question ${questionIndex + 1}` : `Question ${questionIndex + 1}`}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => duplicateQuestion(questionIndex)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                      Duplicate
                    </button>
                    <button type="button" onClick={() => moveQuestion(questionIndex, -1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                      Move Up
                    </button>
                    <button type="button" onClick={() => moveQuestion(questionIndex, 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                      Move Down
                    </button>
                    <button type="button" onClick={() => removeQuestion(questionIndex)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                      Delete Question
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[1fr_220px_220px]">
                  <label className="space-y-2 text-sm font-medium text-slate-700 lg:col-span-2">
                    Question Heading / Question Text
                    <textarea
                      rows="3"
                      value={question.questionText}
                      onChange={(event) => updateQuestion(questionIndex, { questionText: event.target.value })}
                      className={`w-full rounded-xl border bg-white px-3 py-2.5 ${questionErrors.questionText ? 'border-red-400' : 'border-slate-200'}`}
                      placeholder="What is the purpose of MongoDB?"
                    />
                    {questionErrors.questionText && <span className="text-xs font-medium text-red-600">{questionErrors.questionText}</span>}
                  </label>

                  <div className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Marks</span>
                    <input
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(event) => updateQuestion(questionIndex, { marks: Number(event.target.value) || 0 })}
                      className={`w-full rounded-xl border bg-white px-3 py-2.5 ${questionErrors.marks ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {questionErrors.marks && <span className="text-xs font-medium text-red-600">{questionErrors.marks}</span>}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Number of Options</span>
                    <select
                      value={question.options.length}
                      onChange={(event) => setOptionCount(questionIndex, Number(event.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Correct Answer</span>
                    <select
                      value={question.correctAnswer}
                      onChange={(event) => updateQuestion(questionIndex, { correctAnswer: event.target.value })}
                      className={`w-full rounded-xl border bg-white px-3 py-2.5 ${questionErrors.correctAnswer ? 'border-red-400' : 'border-slate-200'}`}
                    >
                      {question.options.map((option) => (
                        <option key={option.id} value={option.id}>{option.id}</option>
                      ))}
                    </select>
                    {questionErrors.correctAnswer && <span className="text-xs font-medium text-red-600">{questionErrors.correctAnswer}</span>}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question.id}-${option.id}`} className="grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                        {optionLetters[optionIndex]}
                      </div>
                      <div>
                        <input
                          value={option.text}
                          onChange={(event) => updateQuestionOption(questionIndex, optionIndex, event.target.value)}
                          className={`w-full rounded-xl border bg-white px-3 py-2.5 ${questionErrors[`option-${optionIndex}`] ? 'border-red-400' : 'border-slate-200'}`}
                          placeholder={`Option ${optionLetters[optionIndex]}`}
                        />
                        {questionErrors[`option-${optionIndex}`] && (
                          <span className="mt-1 block text-xs font-medium text-red-600">{questionErrors[`option-${optionIndex}`]}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {questionErrors.options && <span className="text-xs font-medium text-red-600">{questionErrors.options}</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button type="button" onClick={addQuestion} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
            + Add Question
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-slate-600">
              Total Questions: <span className="font-semibold text-slate-900">{quiz.questions.length}</span>
            </div>
            <div className="text-sm text-slate-600">
              Total Marks: <span className="font-semibold text-slate-900">{totalMarks}</span>
            </div>
          </div>
        </div>

        {errors.questions && <p className="mt-4 text-sm font-medium text-red-600">{errors.questions}</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => submitQuiz(false)} disabled={saving} className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={() => submitQuiz(true)} disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Publishing...' : 'Publish Quiz'}
          </button>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Preview</p>
                <h3 className="text-2xl font-bold text-slate-900">{quiz.title || 'Untitled Quiz'}</h3>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                Close
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">{quiz.description || 'No description provided.'}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                <span>Duration: {quiz.duration} min</span>
                <span>Passing Marks: {quiz.passingMarks}</span>
                <span>Total Marks: {totalMarks}</span>
              </div>
            </div>

            <div className="space-y-5">
              {quiz.questions.map((question, questionIndex) => (
                <div key={`${question.id}-preview`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-lg font-semibold text-slate-900">
                      {quiz.showQuestionNumber ? `Q.${questionIndex + 1}` : `Question ${questionIndex + 1}`}
                    </h4>
                    {quiz.showMarksToStudents && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {question.marks} Marks
                      </span>
                    )}
                  </div>

                  <p className="text-base leading-7 text-slate-700">{question.questionText || 'Question text preview...'}</p>

                  <div className="mt-4 space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={`${question.id}-option-${option.id}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <input type="radio" disabled className="h-4 w-4" name={`preview-${question.id}`} />
                        <span className="text-sm text-slate-700">{String.fromCharCode(65 + optionIndex)}. {option.text || `Option ${String.fromCharCode(65 + optionIndex)}`}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function QuizAttemptPage() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [phase, setPhase] = useState('details');
  const [answers, setAnswers] = useState({});
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [warningCount, setWarningCount] = useState(0);

  const loadQuiz = async () => {
    try {
      const { data } = await api.get(`/student/quizzes/${quizId}/instructions`);
      setQuiz(data.quiz);
    } catch {
      toast.error('Unable to load quiz details.');
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  const startAttempt = async () => {
    try {
      setStatusMessage('Preparing quiz environment...');
      const { data } = await api.post(`/student/quizzes/${quizId}/start`);
      setAttempt(data.attempt);
      setWarningCount(data.attempt.warningCount || 0);
      setPhase('attempt');
      setStatusMessage('Attempt started successfully.');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to start the quiz.');
    }
  };

  useEffect(() => {
    if (!attempt) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, new Date(attempt.deadline).getTime() - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setStatusMessage("Time's up. Submitting your quiz automatically.");
        api.post(`/student/attempts/${attempt._id}/submit`, { obtainedMarks: 0, percentage: 0 }).catch(() => {});
        navigate('/student/dashboard');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt, navigate]);

  useEffect(() => {
    if (phase !== 'attempt' || !attempt || !quiz) return;

    const saveAnswers = async () => {
      if (!attempt || !attempt._id) return;
      const payload = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
        answeredAt: new Date().toISOString(),
      }));

      setStatusMessage('Saving...');
      try {
        await api.patch(`/student/attempts/${attempt._id}/answers`, { answers: payload });
        setStatusMessage('✓ Answer saved');
      } catch {
        setStatusMessage('Unable to save your answer.');
      }
    };

    const timeout = setTimeout(saveAnswers, 500);
    return () => clearTimeout(timeout);
  }, [answers, attempt, phase, quiz]);

  useEffect(() => {
    if (phase !== 'attempt' || !attempt) return;

    const handleWarning = async (eventType) => {
      const nextWarningCount = warningCount + 1;
      if (warningCount >= 5) return;
      setWarningCount(nextWarningCount);
      try {
        await api.patch(`/student/attempts/${attempt._id}/warning`, { eventType });
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to record quiz security activity.');
      }
      if (nextWarningCount >= 5) {
        try {
          await api.post(`/student/attempts/${attempt._id}/terminate`, { reason: 'maximum_warnings_reached' });
        } catch {
          // ignore background termination errors
        }
        toast.error('Quiz terminated for exceeding the allowed warning limit.');
        navigate('/student/dashboard');
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleWarning('tab_switch');
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        handleWarning('fullscreen_exit');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, [attempt, phase, warningCount, navigate]);

  const questionList = quiz?.questions || [];
  const currentQuestion = questionList[selectedQuestionIndex] || null;
  const currentQuestionId = currentQuestion?._id || currentQuestion?.id;
  const minutes = String(Math.floor(timeLeft / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0');

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers((current) => ({ ...current, [questionId]: selectedAnswer }));
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;
    try {
      await api.post(`/student/attempts/${attempt._id}/submit`, { obtainedMarks: 0, percentage: 0 });
      toast.success('Quiz submitted successfully.');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to submit the quiz.');
    }
  };

  if (!quiz) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">Loading quiz...</div>;
  }

  if (phase === 'details') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quiz Details</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="mt-4 text-slate-600">{quiz.description || 'This quiz is designed to assess your understanding of the subject.'}</p>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-900">Questions:</span> {quiz.totalQuestions || questionList.length}</div>
            <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-900">Total Marks:</span> {quiz.totalMarks || 0}</div>
            <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-900">Start Time:</span> {new Date(quiz.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
            <div className="rounded-xl bg-slate-50 p-3"><span className="font-semibold text-slate-900">End Time:</span> {new Date(quiz.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2"><span className="font-semibold text-slate-900">Duration:</span> {quiz.duration} Minutes</div>
          </div>
          <button type="button" onClick={startAttempt} className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 hover:shadow-lg">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Assessment</p>
              <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {minutes}:{seconds}
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, ((questionList.length - (questionList.length - selectedQuestionIndex)) / questionList.length) * 100)}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>Started: {attempt ? new Date(attempt.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            <span>Question {selectedQuestionIndex + 1} of {questionList.length}</span>
            <span>Warnings {warningCount} / 5</span>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_260px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            {currentQuestion && (
              <>
                <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                  <span className="font-semibold">Q.{selectedQuestionIndex + 1}</span>
                  <span>{currentQuestion.marks || 1} Marks</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">{currentQuestion.questionText}</h2>

                <div className="mt-6 space-y-3">
                  {(currentQuestion.options || []).map((option, index) => (
                    <label key={option.id || index} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <input
                        type="radio"
                        name={currentQuestionId}
                        checked={answers[currentQuestionId] === option.id}
                        onChange={() => handleAnswerChange(currentQuestionId, option.id)}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span className="text-sm text-slate-700">{String.fromCharCode(65 + index)}. {option.text}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setSelectedQuestionIndex((index) => Math.max(0, index - 1))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    Previous
                  </button>
                  <button type="button" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                    Mark for Review
                  </button>
                  <button type="button" onClick={() => setSelectedQuestionIndex((index) => Math.min(questionList.length - 1, index + 1))} className="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questionList.map((question, index) => (
                <button
                  key={question._id || question.id || index}
                  type="button"
                  onClick={() => setSelectedQuestionIndex(index)}
                  className={`flex h-10 items-center justify-center rounded-lg border text-xs font-semibold ${selectedQuestionIndex === index ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="font-semibold">Warning {warningCount} of 5</div>
              <p className="mt-1">Leave fullscreen or switch tabs may trigger a warning.</p>
            </div>

            <div className="mt-4 text-sm text-slate-600">{statusMessage}</div>

            <button type="button" onClick={handleSubmitQuiz} className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
              Submit Quiz
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login('admin', credentials);
      toast.success('Signed in to administration');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700"><ShieldCheck className="h-6 w-6" /></div>
        <h1 className="text-2xl font-bold text-slate-900">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Manage student and faculty accounts.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">Username
          <input required type="email" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">Password
          <input required type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </label>
        <button disabled={submitting} className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}</button>
        <Link to="/auth" className="mt-5 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-800">Return to student / faculty sign in</Link>
      </form>
    </div>
  );
}

function AdminDashboardPage() {
  const [users, setUsers] = useState({ students: [], faculties: [] });
  const [passwordHelpRequests, setPasswordHelpRequests] = useState([]);
  const [activeType, setActiveType] = useState('students');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [editingPasswordRequestId, setEditingPasswordRequestId] = useState(null);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [passwordHelpError, setPasswordHelpError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers({ students: data.students || [], faculties: data.faculties || [] });
      setLoadError('');
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    api.get('/admin/users')
      .then(({ data }) => {
        if (active) {
          setUsers({ students: data.students || [], faculties: data.faculties || [] });
          setLoadError('');
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || 'Unable to load accounts.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    api.get('/admin/password-help-requests')
      .then(({ data }) => {
        if (active) {
          setPasswordHelpRequests(data.requests || []);
          setPasswordHelpError('');
        }
      })
      .catch((error) => {
        if (active) setPasswordHelpError(error.response?.data?.message || 'Unable to load password help requests.');
      });
    return () => { active = false; };
  }, []);

  const loadPasswordHelpRequests = async () => {
    try {
      const { data } = await api.get('/admin/password-help-requests');
      setPasswordHelpRequests(data.requests || []);
      setPasswordHelpError('');
    } catch (error) {
      setPasswordHelpError(error.response?.data?.message || 'Unable to load password help requests.');
    }
  };

  const activeUsers = users[activeType];
  const filteredUsers = activeUsers.filter((person) => {
    const searchText = `${person.name} ${person.email || ''} ${person.studentId || ''} ${person.employeeId || ''} ${person.phoneNumber || ''}`.toLowerCase();
    return searchText.includes(search.toLowerCase());
  });

  const beginEdit = (person) => {
    setEditingPasswordRequestId(null);
    setEditing(person);
    setDraft({
      ...person,
      courses: person.courses || [],
      semesters: person.semesters || [],
      password: '',
    });
  };

  const beginPasswordHelpReset = (request) => {
    const isStudent = request.role === 'student';
    const account = (isStudent ? users.students : users.faculties).find((person) => (
      (isStudent ? person.studentId : person.employeeId)?.toUpperCase() === request.accountId
    ));
    if (!account) {
      toast.error('No matching account was found. Verify the account ID before resetting its password.');
      return;
    }

    setActiveType(isStudent ? 'students' : 'faculties');
    setEditingPasswordRequestId(request._id);
    setEditing(account);
    setDraft({
      ...account,
      courses: account.courses || [],
      semesters: account.semesters || [],
      password: '',
    });
  };

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const toggleListValue = (field, value) => {
    const current = draft[field] || [];
    updateDraft(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const allowedFields = activeType === 'students'
        ? ['name', 'email', 'studentId', 'phoneNumber', 'department', 'semester', 'course', 'parentContactNumber', 'isActive', 'password']
        : ['name', 'employeeId', 'phoneNumber', 'courses', 'semesters', 'isActive', 'password'];
      const payload = Object.fromEntries(allowedFields
        .filter((key) => key !== 'password' || draft[key])
        .filter((key) => draft[key] !== undefined)
        .map((key) => [key, draft[key]]));
      if (activeType === 'students' && payload.semester !== undefined) payload.semester = Number(payload.semester);
      const userType = activeType === 'students' ? 'students' : 'faculty';
      const { data } = await api.patch(`/admin/users/${userType}/${editing._id}`, payload);
      if (editingPasswordRequestId) {
        await api.patch(`/admin/password-help-requests/${editingPasswordRequestId}/resolve`);
        setPasswordHelpRequests((current) => current.map((request) => (
          request._id === editingPasswordRequestId
            ? { ...request, status: 'resolved', resolvedAt: new Date().toISOString() }
            : request
        )));
      }
      setUsers((current) => ({
        ...current,
        [activeType]: current[activeType].map((person) => person._id === editing._id ? data.user : person),
      }));
      setEditing(null);
      setEditingPasswordRequestId(null);
      toast.success(editingPasswordRequestId ? 'Password reset and request resolved.' : 'User details updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || (editingPasswordRequestId
        ? 'Password was updated, but the request could not be resolved. Save again to retry.'
        : 'Unable to update user.'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  return (
    <AppShell role="admin">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-slate-900">User management</h1><p className="mt-1 text-sm text-slate-500">Update student and faculty account details.</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setActiveType('students')} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeType === 'students' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Students ({users.students.length})</button>
            <button type="button" onClick={() => setActiveType('faculties')} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeType === 'faculties' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>Faculty ({users.faculties.length})</button>
          </div>
        </div>
        <section aria-labelledby="password-help-heading" className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 px-4 py-3 sm:px-5">
            <div>
              <h2 id="password-help-heading" className="font-semibold text-slate-900">Password help requests</h2>
              <p className="text-sm text-slate-600">Set a new password for the matching account to resolve a request.</p>
            </div>
            <button type="button" onClick={loadPasswordHelpRequests} className="min-h-10 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-amber-50">Refresh</button>
          </div>
          {passwordHelpError ? (
            <div role="alert" className="p-4 text-sm text-rose-700">{passwordHelpError}</div>
          ) : passwordHelpRequests.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">There are no password help requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Requested</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordHelpRequests.map((request) => (
                    <tr key={request._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{request.accountId}</td>
                      <td className="px-4 py-3 capitalize text-slate-600">{request.role}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(request.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                          {request.status === 'pending' ? 'Pending' : 'Resolved'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {request.status === 'pending' && (
                          <button type="button" onClick={() => beginPasswordHelpReset(request)} className="min-h-10 rounded-lg bg-indigo-50 px-3 py-2 font-semibold text-indigo-700 transition hover:bg-indigo-100">
                            Reset password
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <div className="mb-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, ID, email, or phone" className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        {loadError && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError} <button type="button" onClick={loadUsers} className="ml-2 font-semibold underline">Retry</button></div>}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading accounts...</p> : filteredUsers.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No matching accounts found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">{activeType === 'students' ? 'Student ID' : 'Employee ID'}</th><th className="px-5 py-3 font-semibold">{activeType === 'students' ? 'Email' : 'Courses'}</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
                <tbody>
                  {filteredUsers.map((person) => <tr key={person._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">{person.name}</td>
                    <td className="px-5 py-4 text-slate-600">{activeType === 'students' ? person.studentId : person.employeeId}</td>
                    <td className="px-5 py-4 text-slate-600">{activeType === 'students' ? person.email : (person.courses || []).join(', ')}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${person.isActive === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{person.isActive === false ? 'Inactive' : 'Active'}</span></td>
                    <td className="px-5 py-4 text-right"><button type="button" onClick={() => beginEdit(person)} className="rounded-lg bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-700 transition hover:bg-indigo-100">Edit</button></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {editing && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <form onSubmit={saveUser} className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-slate-900">{editingPasswordRequestId ? 'Reset account password' : `Edit ${activeType === 'students' ? 'student' : 'faculty'}`}</h2><p className="mt-1 text-sm text-slate-500">{editing.name}</p></div><button type="button" onClick={() => { setEditing(null); setEditingPasswordRequestId(null); }} className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100">Close</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Full name<input required value={draft.name || ''} onChange={(event) => updateDraft('name', event.target.value)} className={inputClass} /></label>
              {activeType === 'students' ? <>
                <label className="text-sm font-medium text-slate-700">Email<input required type="email" value={draft.email || ''} onChange={(event) => updateDraft('email', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Student ID<input required value={draft.studentId || ''} onChange={(event) => updateDraft('studentId', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Department<select value={draft.department || 'BCA'} onChange={(event) => updateDraft('department', event.target.value)} className={inputClass}><option>BCA</option><option>B.Tech</option></select></label>
                <label className="text-sm font-medium text-slate-700">Semester<input required type="number" min="1" max="8" value={draft.semester || ''} onChange={(event) => updateDraft('semester', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Course<input required value={draft.course || ''} onChange={(event) => updateDraft('course', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Phone number<input required value={draft.phoneNumber || ''} onChange={(event) => updateDraft('phoneNumber', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Parent contact<input required value={draft.parentContactNumber || ''} onChange={(event) => updateDraft('parentContactNumber', event.target.value)} className={inputClass} /></label>
              </> : <>
                <label className="text-sm font-medium text-slate-700">Employee ID<input required value={draft.employeeId || ''} onChange={(event) => updateDraft('employeeId', event.target.value)} className={inputClass} /></label>
                <label className="text-sm font-medium text-slate-700">Phone number<input value={draft.phoneNumber || ''} onChange={(event) => updateDraft('phoneNumber', event.target.value)} className={inputClass} /></label>
                <fieldset className="text-sm font-medium text-slate-700"><legend>Courses</legend><div className="mt-2 flex gap-4">{['BCA', 'B.Tech'].map((course) => <label key={course} className="flex items-center gap-2"><input type="checkbox" checked={(draft.courses || []).includes(course)} onChange={() => toggleListValue('courses', course)} />{course}</label>)}</div></fieldset>
                <fieldset className="text-sm font-medium text-slate-700 sm:col-span-2"><legend>Semesters</legend><div className="mt-2 flex flex-wrap gap-3">{[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <label key={semester} className="flex items-center gap-1.5"><input type="checkbox" checked={(draft.semesters || []).includes(semester)} onChange={() => toggleListValue('semesters', semester)} />{semester}</label>)}</div></fieldset>
              </>}
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">New password <span className="font-normal text-slate-400">{editingPasswordRequestId ? '(required; 8+ characters, uppercase, lowercase, and number)' : '(leave blank to keep current; 8+ characters, uppercase, lowercase, and number)'}</span><input type="password" minLength="8" required={Boolean(editingPasswordRequestId)} autoComplete="new-password" value={draft.password || ''} onChange={(event) => updateDraft('password', event.target.value)} className={inputClass} /></label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" checked={draft.isActive !== false} onChange={(event) => updateDraft('isActive', event.target.checked)} />Account active</label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setEditing(null); setEditingPasswordRequestId(null); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving...' : editingPasswordRequestId ? 'Reset password' : 'Save changes'}</button></div>
          </form>
        </div>}
      </div>
    </AppShell>
  );
}

function AuthPage() {
  const [selectedRole, setSelectedRole] = useState('student');
  const [mode, setMode] = useState('login');
  const [passwordHelpOpen, setPasswordHelpOpen] = useState(false);
  const [passwordHelpAccountId, setPasswordHelpAccountId] = useState('');
  const [passwordHelpSubmitting, setPasswordHelpSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    phoneNumber: '',
    employeeId: '',
    password: '',
    department: 'BCA',
    semester: '1',
    courses: [],
    semesters: [],
    course: 'AIML',
    parentContactNumber: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (mode === 'login') {
        const credentials = selectedRole === 'faculty'
          ? { employeeId: form.employeeId, password: form.password }
          : { studentId: form.studentId, password: form.password };
        await login(selectedRole, credentials);
        toast.success('Signed in successfully');
        navigate(selectedRole === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
      } else {
        if (selectedRole === 'faculty' && (!form.courses.length || !form.semesters.length)) {
          toast.error('Select at least one course and semester.');
          return;
        }

        await register(selectedRole, selectedRole === 'student'
          ? {
              name: form.name,
              email: form.email,
              studentId: form.studentId,
              phoneNumber: form.phoneNumber,
              password: form.password,
              department: form.department,
              semester: Number(form.semester),
              course: form.course,
              parentContactNumber: form.parentContactNumber,
            }
          : {
              name: form.name,
              employeeId: form.employeeId,
              password: form.password,
              courses: form.courses,
              semesters: form.semesters,
            });
        toast.success('Account created successfully');
        navigate(selectedRole === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Authentication failed.');
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleFacultySelection = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const submitPasswordHelpRequest = async (event) => {
    event.preventDefault();
    setPasswordHelpSubmitting(true);
    try {
      await api.post('/auth/password-help', {
        role: selectedRole,
        accountId: passwordHelpAccountId,
      });
      toast.success('If the account exists, an administrator will review your request.');
      setPasswordHelpAccountId('');
      setPasswordHelpOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send your request. Please try again.');
    } finally {
      setPasswordHelpSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-slate-100 p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="grid md:grid-cols-2">
          <div className="bg-slate-900 p-10 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Academic platform</p>
            <h1 className="mt-4 text-4xl font-bold">Manage quizzes with confidence.</h1>
            <p className="mt-4 text-slate-300">
              Faculty can create assessments, track participation, and publish secure exams while students can take assessments and review their results.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-200">
              <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-indigo-300" /> Secure exam workflows</div>
              <div className="flex items-center gap-3"><TimerReset className="h-5 w-5 text-indigo-300" /> Server-side timing and submissions</div>
              <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-indigo-300" /> Question builder and analytics</div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-100 p-1">
              {['student', 'faculty'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setPasswordHelpOpen(false);
                    setPasswordHelpAccountId('');
                  }}
                  aria-pressed={selectedRole === role}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${selectedRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'}`}
                >
                  {role === 'student' ? 'Student' : 'Faculty'}
                </button>
              ))}
            </div>

            <div className="mb-6 flex gap-2">
              <button type="button" onClick={() => setMode('login')} aria-pressed={mode === 'login'} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Login
              </button>
              <button type="button" onClick={() => setMode('register')} aria-pressed={mode === 'register'} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 ${mode === 'register' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Register
              </button>
            </div>

            <form key={`${selectedRole}-${mode}`} className="auth-form-enter space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && selectedRole === 'student' && (
                <>
                  <input name="name" placeholder="Student Name" value={form.name} onChange={handleChange} required minLength={2} autoComplete="name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <input name="email" type="email" placeholder="Student Email" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <input name="studentId" placeholder="Student ID" value={form.studentId} onChange={handleChange} required autoComplete="username" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <input name="phoneNumber" type="tel" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} required minLength={10} maxLength={15} autoComplete="tel" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <select name="department" value={form.department} onChange={handleChange} required className="rounded-xl border border-slate-200 px-3 py-2.5">
                      <option>BCA</option>
                      <option>B.Tech</option>
                    </select>
                    <select name="semester" value={form.semester} onChange={handleChange} required className="rounded-xl border border-slate-200 px-3 py-2.5">
                      <option value="1">Semester 1</option>
                      <option value="3">Semester 3</option>
                      <option value="5">Semester 5</option>
                    </select>
                  </div>
                  <input name="course" placeholder="Course" value={form.course} onChange={handleChange} required minLength={2} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <input name="parentContactNumber" type="tel" placeholder="Parent Contact Number" value={form.parentContactNumber} onChange={handleChange} required minLength={10} maxLength={15} autoComplete="tel" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                </>
              )}

              {mode === 'register' && selectedRole === 'faculty' && (
                <>
                  <input name="name" placeholder="Faculty Name" value={form.name} onChange={handleChange} required autoComplete="name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <input name="employeeId" placeholder="Emp_ID" value={form.employeeId} onChange={handleChange} required autoComplete="username" className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">Course</legend>
                    <div className="grid grid-cols-2 gap-3">
                      {['BCA', 'B.Tech'].map((course) => (
                        <label key={course} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.courses.includes(course)}
                            onChange={() => toggleFacultySelection('courses', course)}
                            className="accent-indigo-600"
                          />
                          {course}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">Semesters</legend>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                        <label key={semester} className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={form.semesters.includes(semester)}
                            onChange={() => toggleFacultySelection('semesters', semester)}
                            className="accent-indigo-600"
                          />
                          {semester}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {mode === 'login' && selectedRole === 'student' && (
                <input
                  name="studentId"
                  placeholder="Student ID"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              )}
              {mode === 'login' && selectedRole === 'faculty' && (
                <input
                  name="employeeId"
                  placeholder="Emp_ID"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              )}
              <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" />

              <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-200 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            {mode === 'login' && (
              <div className="mt-4">
                <button
                  type="button"
                  aria-expanded={passwordHelpOpen}
                  onClick={() => setPasswordHelpOpen((open) => !open)}
                  className="min-h-11 w-full rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Forgot password? Inform admin
                </button>
                {passwordHelpOpen && (
                  <form onSubmit={submitPasswordHelpRequest} className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                    <label className="block text-sm font-medium text-slate-700">
                      {selectedRole === 'student' ? 'Student ID' : 'Employee ID'}
                      <input
                        required
                        maxLength={50}
                        autoComplete="username"
                        value={passwordHelpAccountId}
                        onChange={(event) => setPasswordHelpAccountId(event.target.value)}
                        className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-slate-600">An administrator will review your request and reset your password after verifying your account.</p>
                    <button
                      type="submit"
                      disabled={passwordHelpSubmitting}
                      className="mt-3 min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {passwordHelpSubmitting ? 'Sending request...' : 'Send request to admin'}
                    </button>
                  </form>
                )}
              </div>
            )}
            <Link to="/admin/login" className="mt-5 block text-center text-xs font-medium text-slate-500 transition hover:text-indigo-600">Administrator sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-6">
      <div className="max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-600">Quiz Dashboard</p>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">Academic assessment management for modern colleges.</h1>
        <p className="mt-6 text-lg text-slate-600">
          Empower faculty and students with secure quiz workflows, analytics, result tracking, and exam integrity checks.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/auth" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500">Get Started</Link>
          <Link to="/student/dashboard" className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Demo Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

function ResultsPage() {
  const rows = [
    { quiz: 'DBMS Quiz', marks: '88 / 100', percentage: '88%', status: 'Released' },
    { quiz: 'Java Lab', marks: '92 / 100', percentage: '92%', status: 'Released' },
    { quiz: 'Web Fundamentals', marks: 'Pending', percentage: '--', status: 'Hidden' },
  ];

  return (
    <AppShell role="student">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">My Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3">Quiz</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.quiz} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium">{row.quiz}</td>
                  <td className="px-4 py-3">{row.marks}</td>
                  <td className="px-4 py-3">{row.percentage}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'Released' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard'} replace /> : <AuthPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/student/quiz/:id" element={<ProtectedRoute role="student"><QuizAttemptPage /></ProtectedRoute>} />
      <Route path="/student/results" element={<ProtectedRoute role="student"><ResultsPage /></ProtectedRoute>} />
      <Route path="/faculty/dashboard" element={<ProtectedRoute role="faculty"><FacultyDashboardPage /></ProtectedRoute>} />
      <Route path="/faculty/profile" element={<ProtectedRoute role="faculty"><FacultyProfilePage /></ProtectedRoute>} />
      <Route path="/faculty/create-quiz" element={<ProtectedRoute role="faculty"><QuizBuilderPage /></ProtectedRoute>} />
      <Route path="/faculty/quizzes" element={<ProtectedRoute role="faculty"><QuizBuilderPage /></ProtectedRoute>} />
      <Route path="/faculty/results" element={<ProtectedRoute role="faculty"><FacultyResultsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
