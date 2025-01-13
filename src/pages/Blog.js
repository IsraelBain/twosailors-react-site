import React from "react";

const Blog = () => {
    const posts = [
        {
          id: 1,
          title: "Our First Event",
          content: "We had an amazing time bartending at our first big event!",
        },
        {
          id: 2,
          title: "Cocktail Recipe of the Month",
          content:
            "Try our signature Sailors Mojito: 2 oz white rum, 1 oz lime juice, 1 oz simple syrup, fresh mint, and soda water. Perfect for any occasion!",
        },
        {
          id: 3,
          title: "Tips for Hosting the Perfect Party",
          content:
            "1. Always have enough ice! 2. Stock up on mixers. 3. Let us handle the bartending!",
        },
      ];

      return(
        <div>
            <h1>Blog</h1>
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                    </div>
                ))
            ) : (
                <p>No blog posts available.</p>
            )}
        </div>
      );
};

export default Blog;