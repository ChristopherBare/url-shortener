import './App.css'
import Form from "./form/form.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Redirect from "./redirect/redirect.tsx";

function App() {

  return (
      <Router>
          <div className="App">
              <div className="auth-wrapper">
                  <div className="auth-inner">
                      <Routes>
                          <Route path='/' Component={Form} />
                          <Route path="/app" Component={Form} />
                          <Route path="/:generatedKey" Component={Redirect} />
                      </Routes>
                  </div>
              </div>
          </div></Router>
  )
}

export default App
