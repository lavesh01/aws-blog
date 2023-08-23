import { Link, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { UserContext } from './../UserContext';
import axios from "axios";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    axios.get("/profile",{
      withCredentials: true
    }).then(response => {
      setUserInfo(response.data.username);
    }).catch(err => console.error(err))
  },[]);

  const handleLogout = async () => {
    await axios.get("/logout",{
      withCredentials: true
    }).then(response => {
      console.log(response);
      setUserInfo(null);
    })
    .catch(err => console.error(err));
  }

  const username = userInfo?.username;
  
  return(
      <header>
      <Link to="/" className="logo">My Blog</Link>
      <nav>
        { username && 
          <>
            <span>Hello, <strong>{ username }</strong> </span>
            <Link to="/create">Create a blog</Link>
            <Link to='/' onClick={handleLogout}>Logout</Link>
          </>
        }
        { !username && <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </> 
        }
      </nav>
    </header>
  )
};
