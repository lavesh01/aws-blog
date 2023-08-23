import './App.css';

import { Route, Routes } from 'react-router-dom';

import CreatePost from './pages/CreatePost';
import EditPage from './pages/EditPage';
import IndexPage from './pages/IndexPage';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PostPage from './pages/PostPage';
import RegisterPage from './pages/RegisterPage';
import { UserContextProvider } from './UserContext';
import axios from 'axios';

axios.defaults.baseURL= import.meta.env.VITE_API_BASE_URL;
 
function App() {
  return (
    <UserContextProvider>

      <Routes>
        <Route path='/' element={<Layout />} > 
          <Route index element={<IndexPage /> } />
          <Route path='/login' element={ <LoginPage />} />
          <Route path='/register' element={ <RegisterPage />} />
          <Route path='/create' element={ <CreatePost />} />
          <Route path='/post/:id' element={ <PostPage />} />
          <Route path='/edit/:id' element={ <EditPage />} />
        </Route>
      </Routes>
      
    </UserContextProvider>
       
  );
}

export default App;
