import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/LoginPage/Login.jsx";
import Today from "./pages/Today.jsx";
import Weekly from "./pages/Weekly.jsx";
import Monthly from "./pages/Monthly.jsx";
import MyPage from "./pages/MyPage.jsx";
import Notice from "./pages/Notice.jsx";
import Setting from "./pages/Setting.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/today" element={<Today />} />
        <Route path="/weekly" element={<Weekly />} />
        <Route path="/monthly" element={<Monthly />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
