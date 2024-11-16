import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/')
  const redirectToArticles = () => navigate('/articles')

  const logout = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      setMessage("Goodbye!");
    }
    redirectToLogin();
  };

  const login = ({ username, password }) => {
    setSpinnerOn(true)
    setMessage('')
    axios.post(loginUrl, { username, password })
      .then(res => {
        localStorage.setItem('token', res.data.token) // Corrected here
        setMessage(res.data.message)
        redirectToArticles();
      })
      .catch(err => {
        const responseMessage = err?.response?.data?.message
        setMessage(responseMessage || `Somethin' horrible logging in: ${err.message}`)
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }
  

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setSpinnerOn(true)
    setMessage('')
    axios.get(articlesUrl, { headers: { Authorization: localStorage.getItem('token') } })
      .then(res => {
        setMessage(res.data.message)
        setArticles(res.data.articles)
      })
      .catch(err => {
        setMessage(err?.response?.data?.message || 'Something bad happened')
        if (err.response.status == 401) {
          redirectToLogin()
        }
      })
      .finally(() => {
        setSpinnerOn(false)
      })  
  }

  const postArticle = article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setSpinnerOn(true)
    setMessage('')
    axios.post(articlesUrl, article, { headers: { Authorization: localStorage.getItem('token')}})
      .then(res => {
        setMessage(res.data.message)
        setArticles(articles => {
          return articles.concat(res.data.article)
        })
      })
      .catch(err => {
        setMessage(err?.response?.data?.message || 'Something bad happened')
      })
      .finally(() => {
        setSpinnerOn(false)
      })
  }

  const updateArticle = ({ article_id, article }) => {
    setMessage('')
    setSpinnerOn(true)
    axios.put(`${articlesUrl}/${article_id}`, article, {headers: {Authorization: 
      localStorage.getItem('token')}})
        .then(res => {
          setMessage(res.data.message)
          setArticles(articles => {
            return articles.map(art => {
              return art.article_id === article_id ? res.data.article: art
            })
          })
        })
        .catch(err => {
          setMessage(err?.response?.data?.message || "Something bad happened")
          if(err.response.status == 401) {
            redirectToLogin()
          }
        })
        .finally(() => {
          setSpinnerOn(false)
        })
  }

  const deleteArticle = article_id => {
    setMessage('')
    setSpinnerOn(true)
    axios.delete(`${articlesUrl}/${article_id}`, {headers: {Authorization: 
      localStorage.getItem('token')}})
        .then(res => {
          setMessage(res.data.message)
          setArticles(articles => {
            return articles.filter(art => {
              return art.article_id != article_id
            })
          })
        })
        .catch(err => {
          setMessage(err?.response?.data?.message || "Something bad happened")
          if(err.response.status == 401) {
            redirectToLogin()
          }
        })
        .finally(() => {
          setSpinnerOn(false)
        })
  }


  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <>
              <ArticleForm 
                currentArticle={articles.find(art => art.article_id == currentArticleId)}
                setCurrentArticleId={setCurrentArticleId}
                postArticle={postArticle}
                updateArticle={updateArticle}
               />
              <Articles 
                articles={articles}
                currentArticleId={currentArticleId}
                setCurrentArticleId={setCurrentArticleId}
                getArticles={getArticles}
                deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}