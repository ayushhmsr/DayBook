import { Navigate } from 'react-router-dom';
import { api } from '../api/journalApi.js';

export default function NewEntry() {
  const user = api.getUserSync();
  const userProf = user?.profession || 'trader';
  return <Navigate to={`/app/new/${userProf}`} replace />;
}

