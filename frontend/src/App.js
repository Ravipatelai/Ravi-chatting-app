import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import RoomChat from "./RoomChat";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <nav className="absolute top-4 right-4 space-x-4">
          
          <Link to="/" className="text-blue-600 hover:underline"></Link>
         
        </nav>

        <Routes>
         
          <Route path="/" element={<RoomChat />} />
         
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
