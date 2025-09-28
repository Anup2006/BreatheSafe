import { useState } from 'react'
import './App.css'
import Header from './Header/Header.jsx'
import Footer from './Footer/Footer.jsx'
import Content from './Footer-box1/Content.jsx'
import ImageAnimation from './Image/imageAnimation.jsx'
import Major from './Footer-box2/Major.jsx'
import Dashboard from './Dashboard/Dashboard.jsx'

function App() {
  

  return (
    <>
      <Header/>
      <ImageAnimation/>
      <Major/>
      <Content/>
      <Dashboard/>
      <Footer/>
    </>
  )
}

export default App
