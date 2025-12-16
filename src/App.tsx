import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import ReadOnline from './pages/ReadOnline';
import Publisher from './pages/Publisher';
import TeachingGuide from './pages/TeachingGuide';
import { trackVisitor } from './lib/visitorTracking';

function App() {
  useEffect(() => {
    trackVisitor();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogPost />} />
        <Route path="/read-online" element={<ReadOnline />} />
        <Route path="/publisher" element={<Publisher />} />
        <Route path="/teaching" element={<TeachingGuide />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
