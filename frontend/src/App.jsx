import React, { useState } from 'react'
import './App.css'
import Home from './Home'
import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Register from './Register.jsx'
import Login from './Login.jsx'
import Profile from './Profile.jsx'
import { createContext } from 'react'
import { useCookies } from 'react-cookie'

const UserContext = createContext();
const Secret = "Tine_DEV_28102548_0123456789__"

function App() {
  const [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user'])
  const [Error, setError] = useState(null);

  if (Error) {
    return (
      <div>Error</div>
    )
  } else {
    return (
      <UserContext.Provider value={{ Secret, user, setUser, cookies, setCookie, removeCookie, Error, setError }}>
        <div className="App">
          <header className="App-header">
            <NavBar />
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </header>
        </div>
      </UserContext.Provider>
    )
  }

}

export { UserContext }
export default App
