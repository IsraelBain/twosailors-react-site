
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function App(){
  const [posts, setPosts] = useState([]);

  useEffect(()=>{
    axios.get('https://twosailorsbartending.ca/wp-json/wp/v2/posts')
    .then(response=>{
      setPosts(response.data);
    })
    .catch(error => {
      console.error('Error fetching posts: ', error);
    });
  }, []);

  return (
    <div>
      <h1> Two Sailors Bartending</h1>
      <h2> Blog Posts</h2>
      {posts.length > 0 ? (
        posts.map(post =>(
          <div key={post.id}>
            <h3>{post.title.rendered}</h3>
            <div dangerouslySetInnerHTML={{__html: post.content.rendered}} />
          </div>
        ))
      ) : (
        <p>Loading posts...</p>
      )}
    </div>
  );

}
    
export default App;
