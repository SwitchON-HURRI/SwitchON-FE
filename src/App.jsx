import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage/Home.jsx";
import Login from "./pages/LoginPage/Login.jsx";
import Today from "./pages/TodayPage/Today.jsx";
import ManageSchedule from "./pages/TodayPage/ManageSchedule.jsx";
import Weekly from "./pages/WeeklyPage/Weekly.jsx";
import Monthly from "./pages/Monthly.jsx";
import MyPage from "./pages/MyPage/MyPage.jsx";
import Notice from "./pages/Notice.jsx";
import Setting from "./pages/SettingPage/Setting.jsx";
import LoginSuccess from "./pages/LoginPage/LoginSucess.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* '/' 경로에만 showAlert={false}를 부여하여 조용히 넘어가게 처리 */}
        <Route path="/" element={<ProtectedRoute showAlert={false}><Home /></ProtectedRoute>} />
        
        <Route path="/login" element={<Login />} />
        
        {/* 나머지 라우트는 기본값(showAlert=true)이 적용되어 기존 로직 유지 */}
        <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
        <Route path="/manage-schedule" element={<ProtectedRoute><ManageSchedule /></ProtectedRoute>} />
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