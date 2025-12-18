import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import ReadOnline from './pages/ReadOnline';
import Publisher from './pages/Publisher';
import TeachingGuide from './pages/TeachingGuide';
import Errata from "./pages/Errata";
import { trackVisitor } from './lib/visitorTracking';

function App() {
  useEffect(() => {
    trackVisitor();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogPost />} />
        <Route path="/read-online" element={<ReadOnline />} />
        <Route path="/publisher" element={<Publisher />} />
        <Route path="/teaching" element={<TeachingGuide />} />
        <Route path="/errata" element={<Errata />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

