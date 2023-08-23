import 'react-quill/dist/quill.snow.css';

import { Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Editor from './Editor';
import axios from 'axios';

export default function EditPage(){
    const { id } = useParams();
    const [ title , setTitle ] = useState("");
    const [ summary , setSummary ] = useState("");
    const [ files, setFiles ] = useState();
    // const [ cover, setCover ] = useState();
    const [ content , setContent ] = useState("");
    const [ redirect, setRedirect ] = useState(false);

    useEffect(() => {
        axios.get(`/post/${id}`)
        .then(postData => {
            const data = postData.data;
            setTitle(data.title);
            setSummary(data.summary);
            setContent(data.content);
        })
    },[id]);

    const handleUpdate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.set("title", title);
        formData.set("summary", summary);
        formData.set("content", content);
        if(files?.[0]){
            formData.set("file", files?.[0]);
        }
        formData.set("id", id);

        axios.put(`/post`,formData,{
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
        return <Navigate to={`/post/${id}`} />  
    }
    
    
    return (
        <form> 
            <input type="title" placeholder={"Title"} value={title} onChange={(e) => setTitle(e.target.value)} ></input>
            <input type="summary" placeholder={"Summary"} value={summary} onChange={(e) => setSummary(e.target.value)}></input>
            <input type="file" onChange={(e) => setFiles(e.target.files)} />
            <Editor 
                value={content} 
                onChange={setContent} 
            />
            <button style={{marginTop: '10px'}} onClick={handleUpdate}>Update post</button>
        </form>
    )
}