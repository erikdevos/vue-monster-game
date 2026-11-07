import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppImage from './AppImage.vue'

const props = { src: '/a.png', alt: 'Pikachu', width: 215, height: 215 }

describe('AppImage', () => {
  it('renders an image with alt, size and loading', () => {
    const wrapper = mount(AppImage, { props: { ...props, loading: 'lazy' } })
    const img = wrapper.find('img')
    expect(img.attributes()).toMatchObject({
      src: '/a.png',
      alt: 'Pikachu',
      width: '215',
      height: '215',
      loading: 'lazy',
    })
  })

  it('renders a picture with a larger source when given one', () => {
    const wrapper = mount(AppImage, { props: { ...props, hqSrc: '/b.png', hqSize: 475 } })
    expect(wrapper.find('picture source').attributes()).toMatchObject({
      srcset: '/b.png',
      media: '(min-width: 480px)',
      width: '475',
    })
    expect(wrapper.find('picture img').attributes('src')).toBe('/a.png')
  })

  it('swaps a broken image for a placeholder of the same shape, and keeps the name', async () => {
    const wrapper = mount(AppImage, { props: { ...props, class: 'sprite' } as never })
    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    const fallback = wrapper.find('.image-fallback')
    expect(fallback.exists()).toBe(true)
    expect(fallback.classes()).toContain('sprite') // keeps the layout classes of the parent
    expect(fallback.attributes('style')).toContain('aspect-ratio: 215 / 215')
    expect(fallback.attributes('role')).toBe('img')
    expect(fallback.attributes('aria-label')).toBe('Pikachu')
  })

  it('hides a broken decorative image from assistive technology', async () => {
    const wrapper = mount(AppImage, { props: { ...props, alt: '' } })
    await wrapper.find('img').trigger('error')
    const fallback = wrapper.find('.image-fallback')
    expect(fallback.attributes('aria-hidden')).toBe('true')
    expect(fallback.attributes('role')).toBeUndefined()
  })

  it('also copes with a picture that fails', async () => {
    const wrapper = mount(AppImage, { props: { ...props, hqSrc: '/b.png' } })
    await wrapper.find('picture img').trigger('error')
    expect(wrapper.find('picture').exists()).toBe(false)
    expect(wrapper.find('.image-fallback').exists()).toBe(true)
  })

  it('tries again when it gets a new source (Ditto changing into another monster)', async () => {
    const wrapper = mount(AppImage, { props })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('.image-fallback').exists()).toBe(true)
    await wrapper.setProps({ src: '/c.png' })
    expect(wrapper.find('img').attributes('src')).toBe('/c.png')
    expect(wrapper.find('.image-fallback').exists()).toBe(false)
  })
})
