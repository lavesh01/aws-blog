import { useEffect, useState } from "react";

import Post from "../components/Post";
import axios from "axios";

export default function IndexPage(){
    const [ posts , setPosts ] = useState([]);
    useEffect(() => {
        axios.get("/post")
        .then(response => setPosts(response.data))
        .catch(err => console.log(err));
    },[]);

    return (
        <>
            { posts.length > 0 && posts.map((post) => {
                return <Post key={post._id} {...post} />
            })}
        </>
    )
};