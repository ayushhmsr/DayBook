import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { TransitionProvider } from './components/TransitionProvider.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { api } from './api/journalApi.js';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import AppShell from './pages/AppShell.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewEntry from './pages/NewEntry.jsx';
import EntryForm from './pages/EntryForm.jsx';
import Entries from './pages/Entries.jsx';

function RequireAuth({ children }) {
  return api.getUserSync() ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }) {
  return api.getUserSync() ? <Navigate to="/app" replace /> : children;
}

function RedirectNewEntry() {
  const { templateId } = useParams();
  return <Navigate to={`/app/new/${templateId}`} replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <TransitionProvider>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Auth />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <Auth initialMode="signup" />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewEntry />} />
          <Route path="new/:templateId" element={<EntryForm />} />
          <Route path="entries" element={<Entries />} />
        </Route>
        {/* Aliases for quick/direct navigation */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="/new" element={<Navigate to="/app/new" replace />} />
        <Route path="/new/:templateId" element={<RedirectNewEntry />} />
        <Route path="/entries" element={<Navigate to="/app/entries" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TransitionProvider>
  </LanguageProvider>
  );
}
