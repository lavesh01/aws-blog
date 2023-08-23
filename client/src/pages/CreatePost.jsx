import 'react-quill/dist/quill.snow.css';

import Editor from './Editor';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

export default function CreatePost(){
    const [ title , setTitle ] = useState("");
    const [ summary , setSummary ] = useState("");
    const [ content , setContent ] = useState("");
    const [ files , setFiles ] = useState();
    const [ redirect, setRedirect ] = useState(false);

    const handlePost = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("title", title);
        formData.set("summary", summary);
        formData.set("content", content);
        formData.set("file", files?.[0]);
        
        axios.post("/post",formData,{
            withCredentials:true
        })
        .then(response => {
            console.log(response);
            if(response.status === 200){
                setRedirect(true);
            }
        }).catch(err => {
            console.log("Error: " ,err);
        })
    }

    if(redirect){
        return <Navigate to={'/'} />  
    }
    
    
    return (
        <form>
            <input type="title" placeholder={"Title"} value={title} onChange={(e) => setTitle(e.target.value)} ></input>
            <input type="summary" placeholder={"Summary"} value={summary} onChange={(e) => setSummary(e.target.value)}></input>
            <input type="file" name='photo' onChange={(e) => setFiles(e.target.files)} />
            <Editor
                value={content} 
                onChange={setContent}
            />
            <button style={{marginTop: '10px'}} onClick={handlePost}>Create post</button>
        </form>
    )
}