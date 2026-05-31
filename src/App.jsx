import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/LoginPage/Login.jsx";
import Today from "./pages/Today.jsx";
import Weekly from "./pages/WeeklyPage/Weekly.jsx";
import Monthly from "./pages/Monthly.jsx";
import MyPage from "./pages/MyPage.jsx";
import Notice from "./pages/Notice.jsx";
import Setting from "./pages/Setting.jsx";
import LoginSuccess from "./pages/LoginPage/LoginSucess.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
        <Route path="/weekly" element={<ProtectedRoute><Weekly /></ProtectedRoute>} />
        <Route path="/monthly" element={<ProtectedRoute><Monthly /></ProtectedRoute>} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/login/success" element={<LoginSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
