import { Navigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function RegisterPage() {
    const [ username, setUsername ] = useState();
    const [ password, setPassword ] = useState();
    const [ redirect , setRedirect ] = useState();

    const handleRegister = (e) => {
        e.preventDefault();
        axios.post("/register", {
            username: username,
            password: password
        })
        .then(response => {
            console.log(response);
            alert('Registration successful!');
            setRedirect(true);
          })
          .catch(error => {
            alert('Error during registration:', error);
          });
    }

    if(redirect){
        return <Navigate to={'/login'} />
    }
    
    return (
    <>
        <form className="register" onSubmit={handleRegister}>
            <h1>Register</h1>
            <input type="text" 
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input type="password" 
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button>Register</button>
        </form>
    </>
    )
}