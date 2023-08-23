import { useContext, useState } from "react";

import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";

export default function LoginPage() {
    const [ username, setUsername ] = useState();
    const [ password, setPassword ] = useState();
    const [ redirect, setRedirect ] = useState(false);
    const { setUserInfo } = useContext(UserContext);

    const handleLogin = (e) => {
        e.preventDefault();
        axios.post("/login",{
            username: username,
            password: password
        },  { withCredentials: true } )
        .then(response => {
            if(response.status === 200){
                setUserInfo(response.data);
                setRedirect(true);
                alert("Successfully Logged in!");
            }
        })
        .catch(err => {
            alert("Error , Wrong Credentials." , err)
         });
        } 

        if(redirect){
            return <Navigate to={'/'} />
        }
        
        return (
        <>
            <form className="login" onSubmit={handleLogin}>
                <h1>Login</h1>
                <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}  />
                <button>Login</button>
            </form>
        </>
    )
}