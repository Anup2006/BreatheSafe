import { useState } from 'react'
import './App.css'
import Header from './Components/Header/Header.jsx'
import Footer from './Components/Footer/Footer.jsx'
import Content from './Components/Footer-box1/Content.jsx'
import ImageAnimation from './Components/Image/imageAnimation.jsx'
import Major from './Components/Footer-box2/Major.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import HealthInsights from './Pages/HealthInsights/HealthInsights.jsx'

function App() {
  

  return (
    <>
      <Header/>
      <ImageAnimation/>
      <Major/>
      <Content/>
      <Dashboard/>
      <HealthInsights/>
      <Footer/>
    </>
  )
}

export default App
