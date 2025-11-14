import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from 'react-router-dom';
import Sidebar from "./Components/Sidebar";
import LeaveForm from "./Components/Leave-Form"; 

function App() {
  return (
    // 1. Wrap the entire application with Router
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f7f9' }}>
        
        {/* Sidebar will be visible on ALL routes */}
        <Sidebar />
        
        <main style={{ 
          flexGrow: 1, 
          padding: '20px 30px', 
          marginLeft: '250px', 
          width: 'calc(100% - 250px)', 
        }}>
          <Routes>
<Route 
        path="/" 
        element={<h2>Welcome to the Dashboard!</h2>} 
    />

            <Route 
              path="/leave-form" 
              element={<LeaveForm />} 
            />

            <Route 
              path="*" 
              element={<h3>404: Page Not Found</h3>} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;