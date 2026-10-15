import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import seo from '../data/seo.json'

type Meta = { title: string; description: string; image: string }

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

export function useSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const routes = seo.routes as Record<string, Meta>
    const path = pathname.replace(/\/+$/, '') || '/'
    const m = routes[path] ?? routes['/']
    const url = `${seo.site}${path === '/' ? '/' : path}`
    document.title = m.title
    setMeta('name', 'description', m.description)
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', `${seo.site}/${m.image}`)
    setMeta('name', 'twitter:title', m.title)
    setMeta('name', 'twitter:description', m.description)
    setMeta('name', 'twitter:image', `${seo.site}/${m.image}`)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [pathname])
}
