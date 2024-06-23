// script.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmWJyj99tOxfDOQTJtvFrwSTlpQNojuLM",
    authDomain: "project-idk-fc7f0.firebaseapp.com",
    projectId: "project-idk-fc7f0",
    storageBucket: "project-idk-fc7f0.appspot.com",
    messagingSenderId: "246069646148",
    appId: "1:246069646148:web:d6336c2c9029b2a986fd11",
    measurementId: "G-FZZKDG7G8D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let blogPosts = [];
let quotes = [];

// Function to fetch blog posts from Firestore
async function fetchBlogPosts() {
    const snapshot = await db.collection('blogPosts').get();
    blogPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderBlogGrid();
}

// Function to fetch quotes from an external API
async function fetchQuotes() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        quotes = [data.content];
    } catch (error) {
        console.error('Error fetching quotes:', error);
    }
}

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

function createBlogCard(post) {
    return `
        <article class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-content">
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                <a href="?post=${post.id}" class="read-more">Read More</a>
                <div class="like-button" onclick="likePost('${post.id}')">
                    <i class="far fa-thumbs-up"></i>
                    <span>${post.likes || 0}</span>
                </div>
            </div>
        </article>
    `;
}

function renderBlogGrid() {
    const blogContent = document.getElementById('blogContent');
    blogContent.innerHTML = `
        <section class="blog-grid">
            ${blogPosts.map(createBlogCard).join('')}
        </section>
    `;
}

function renderBlogPost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    const otherPosts = blogPosts.filter(p => p.id !== postId);
    const blogContent = document.getElementById('blogContent');

    blogContent.innerHTML = `
        <div class="back-and-quote">
            <a href="?" class="back-to-home">Back to Home</a>
            <div class="quote">${getRandomQuote()}</div>
        </div>
        <article class="blog-detail">
            <h2>${post.title}</h2>
            <img src="${post.image}" alt="${post.title}">
            <div class="content">${post.content}</div>
        </article>
        <section class="other-blogs">
            <h3>Explore Other Blogs from me</h3>
            <ul>
                ${otherPosts.map(p => `<li><a href="?post=${p.id}">${p.title}</a></li>`).join('')}
            </ul>
        </section>
    `;
}

async function likePost(postId) {
    const postRef = db.collection('blogPosts').doc(postId);
    const post = blogPosts.find(p => p.id === postId);

    if (post) {
        const newLikeCount = (post.likes || 0) + 1;
        await postRef.update({ likes: newLikeCount });
        post.likes = newLikeCount;

        // Re-render the blog grid to update the like count display
        renderBlogGrid();
    }
}

async function init() {
    await fetchQuotes(); // Fetch quotes from external API
    await fetchBlogPosts();

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    if (postId) {
        renderBlogPost(postId);
    } else {
        renderBlogGrid();
    }
}

init();
