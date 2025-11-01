import {  BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProivder } from "./context/AuthContext";
import { Suspense } from "react";

const Home = React.lazy(() => import('./pages/Home'));

function AppRoutes() {
  return (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
    {/* Public */}
    <Route path="/" eleement={<Home />} />
    <Route path='/login' eleement={<Login />} />

    {/* Protected */}
    <Route eleement={<ProtectedRoute requiredUserType='organizer'/>} >
      <Route path='/organizer/*' element={<OrganizerDashboard />} />
    </Route>

    <Route element={<ProtectedRoute requiredUserType='user'/>}>
      <Route path='/user/*' element={<UserDashboard />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
  </Suspense>
  );
}

const App = () => {
  return(
    <AuthProivder>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProivder>
  )
}

export default App;