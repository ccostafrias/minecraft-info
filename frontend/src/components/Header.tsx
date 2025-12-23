import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    // pega o tema salvo em localStorage
    const savedTheme = localStorage.getItem("theme")

    // se tiver salvo, pega diretamente
    if (savedTheme) {
      setTheme(savedTheme)
    } else { // se não, pega da preferência do navegador
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
    }

    // só então adicionará uma nova classe para body, 
    const timer = setTimeout(() => {
      document.body.classList.add('transitions-activated')
    }, 50)

    // função de limpeza para remover o timer se o componente for desmontado
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
          <Link to="/">Recipes</Link>
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
      >
        🌙
      </button>
    )
  }

  return (
    <button 
      onClick={toggleTheme} 
      aria-label="Mudar para tema claro" 
      className="theme-toggle cursor-pointer"
    >
      ☀️
    </button>
  )

}
