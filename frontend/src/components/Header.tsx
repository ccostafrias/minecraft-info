import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IoMdMoon } from 'react-icons/io';
import { MdWbSunny } from 'react-icons/md';

export default function Header() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")

    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // usa a preferência do sistema se não houver tema salvo
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }

    const timer = setTimeout(() => {
      document.body.classList.add('transitions-activated')
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // coloca uma classe em <html> para fins de controlar o tema com CSS
    document.documentElement.className = theme
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }

  return (
    <header className="p-4 flex justify-between">
      <nav>
        <ul className='flex gap-4'>
          <NavLink to="/" className={({isActive}) => isActive ? 'underline' : ''}>Recipes</NavLink>
          <NavLink to="/item" className={({isActive}) => isActive ? 'underline' : ''} >Items</NavLink>
          <NavLink to="/entity" className={({isActive}) => isActive ? 'underline' : ''} >Entities</NavLink>
          {/* <NavLink to="/potions" className={({isActive}) => isActive ? 'underline' : ''} >Potions</NavLink> */}
        </ul>
      </nav>
      <div>
        <ThemeChanger theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  )
}

interface ThemeChangerProps {
  theme: string;
  toggleTheme: () => void;
}

function ThemeChanger({ theme , toggleTheme }: ThemeChangerProps) {

  if (theme === "light") {
    return (
      <button
        onClick={toggleTheme} 
        aria-label="Mudar para tema escuro" 
        className="theme-toggle cursor-pointer"
        tabIndex={0}
      >
        <IoMdMoon size="30"/>
      </button>
    )
  }

  return (
    <button 
      onClick={toggleTheme} 
      aria-label="Mudar para tema claro" 
      className="theme-toggle cursor-pointer"
      tabIndex={0}
    >
      <MdWbSunny size="30"/>
    </button>
  )

}
