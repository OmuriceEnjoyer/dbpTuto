import {Routes, Route} from "react-router-dom";
import {Layout} from "./components/Layout";
import {LayoutLogin} from "./components/LayoutLogin";
import {AuthProvider} from "./context/AuthContext";
import {ProtectedRoute} from "./components/ProtectedRoute";
import {LoginPage} from "./pages/loginPage";
import {RegisterPage} from "./pages/registerPage";
import {LogoutPage} from "./pages/logoutPage";  
import {EventListPage} from "./pages/eventListPage";
import {EventDetailPage} from "./pages/eventDetailPage";
import {CreateEventPage} from "./pages/createEventPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<h1>Home Page</h1>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <EventListPage />
            </ProtectedRoute>
          } />
          <Route path="/events/create" element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route element={<LayoutLogin />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;