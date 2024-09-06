import { render } from 'solid-js/web'
import './assets/index.css'
import App from './App'
import routes from '~solid-pages'
import { Router } from '@solidjs/router'

render(() => {
 const Routes =  routes
 console.log({routes})
  
  return (
    <Router root={App}>
      {routes}
    </Router>

  )
}, document.getElementById('root') as HTMLElement)
