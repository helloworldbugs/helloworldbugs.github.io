<script lang='ts'>
  import type { TocItem } from './SidebarTypes'
  import { sidebarOpen } from '../../stores/sidebarStore'

  interface Props {
    toc?: TocItem[]
    isActive?: boolean
  }

  const { toc = [], isActive = false }: Props = $props()

  // 激活线：标题顶部越过视口内该位置时视为「正在阅读」。
  // 必须与点击跳转的落点偏移保持一致，否则点击后标题停在激活线下方，
  // 滚动监听会把上一个标题判定为当前项，出现点击与高亮不一致的问题。
  const ACTIVATION_OFFSET = 120

  let activeIndex = $state(0)
  let currentItems = $state(new Set<number>())
  let containerElement: HTMLElement | null = $state(null)

  // Helper function to render nested TOC items
  function getTocItemClass(index: number): string {
    const classes = ['toc-item']
    if (currentItems.has(index)) {
      classes.push('current')
    }
    if (activeIndex === index) {
      classes.push('active')
    }
    return classes.join(' ')
  }

  function activateNavByIndex(index: number): void {
    if (index < 0 || index >= toc.length)
      return

    activeIndex = index
    currentItems = new Set([index])

    // Update parent items
    let currentToc = toc[index]
    for (let i = index - 1; i >= 0; i--) {
      if (toc[i].level < currentToc.level) {
        currentItems.add(i)
        currentToc = toc[i]
      }
    }

    // Scroll TOC into view if needed
    if (isActive && containerElement) {
      const activeElement = containerElement.querySelector('.toc-item.active') as HTMLElement
      if (activeElement) {
        const offsetTop = activeElement.offsetTop - containerElement.clientHeight / 4
        containerElement.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        })
      }
    }
  }

  // 点击跳转期间锁定目标标题，避免滚动经过中间标题时高亮来回跳变
  let lockedTargetId: string | null = null

  function handleTocClick(event: MouseEvent, id: string, index: number) {
    event.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      lockedTargetId = id
      const targetTop = target.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: targetTop - ACTIVATION_OFFSET,
        behavior: 'smooth',
      })
      activateNavByIndex(index)
      // 移动端点击目录后自动关闭侧边栏
      if (window.innerWidth < 1024) {
        sidebarOpen.set(false)
      }
    }
  }

  // 滚动到文档底部时，最后一个标题可能永远到不了激活线，需要单独处理
  function isAtPageBottom(): boolean {
    return (
      window.scrollY + window.innerHeight
      >= document.documentElement.scrollHeight - 2
    )
  }

  // 用 $effect 而不是 onMount：加密文章的目录是解密后才通过 store 传入的，
  // toc 变化时必须重新采集标题并重新挂载监听，否则目录永远没有滚动高亮。
  $effect(() => {
    const items = toc

    if (items.length === 0)
      return

    // Get all section elements in document order
    const sections: HTMLElement[] = items.map((item) => {
      return document.getElementById(item.id) as HTMLElement
    }).filter(Boolean)

    if (sections.length === 0)
      return

    // 取最后一个顶部已越过激活线的标题；触底时直接取最后一个标题
    const findIndex = (): number => {
      if (isAtPageBottom())
        return sections.length - 1

      let index = 0
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top - ACTIVATION_OFFSET <= 2)
          index = i
        else
          break
      }
      return index
    }

    const syncActiveIndex = (): void => {
      if (lockedTargetId) {
        const target = document.getElementById(lockedTargetId)
        // 目标标题仍在激活线下方，说明点击后的滚动尚未结束，保持点击项高亮
        if (target && target.getBoundingClientRect().top > ACTIVATION_OFFSET + 2)
          return

        lockedTargetId = null
      }

      activateNavByIndex(findIndex())
    }

    let frame = 0
    const scheduleSync = (): void => {
      if (frame)
        return

      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncActiveIndex()
      })
    }

    // 用户主动操作滚动时立即解除点击锁定，交还给滚动监听
    const releaseLock = (): void => {
      lockedTargetId = null
    }

    syncActiveIndex()
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync)
    window.addEventListener('wheel', releaseLock, { passive: true })
    window.addEventListener('touchmove', releaseLock, { passive: true })
    window.addEventListener('keydown', releaseLock)

    // 图片懒加载、公式渲染等导致的布局变化不会触发 scroll，需要重新校准
    const resizeObserver
      = typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleSync)

    if (resizeObserver)
      resizeObserver.observe(document.body)

    return () => {
      if (frame)
        window.cancelAnimationFrame(frame)

      resizeObserver?.disconnect()
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      window.removeEventListener('wheel', releaseLock)
      window.removeEventListener('touchmove', releaseLock)
      window.removeEventListener('keydown', releaseLock)
    }
  })
</script>

<div class='contents' bind:this={containerElement}>
  {#if toc.length > 0}
    <ol class='toc'>
      {#each toc as item, index (item.id)}
        <li
          class={getTocItemClass(index)}
          style={`padding-left: ${(item.level - 1) * 0.75}rem`}
        >
          <a
            href={`#${item.id}`}
            class='toc-link'
            onclick={e => handleTocClick(e, item.id, index)}
          >
            {item.text}
          </a>
          {#if item.children && item.children.length > 0}
            <ol class='toc-child'>
              {#each item.children as child}
                <li class='toc-item'>
                  <a href={`#${child.id}`} class='toc-link'>
                    {child.text}
                  </a>
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>
  {:else}
    <p class='no-toc'>No contents available</p>
  {/if}
</div>

<style>
  .contents ol {
    padding: 0 0.125rem 0.3125rem 0.625rem;
    text-align: left;
    list-style: none;
    margin: 0;
  }

  .contents .toc-item {
    font-size: 0.875rem;
    line-height: 1.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .contents .toc-child {
    display: none;
  }

  .contents .active > .toc-child {
    display: block;
  }

  .contents .current > .toc-child {
    display: block;
  }

  .contents .current > .toc-child > .toc-item {
    display: block;
  }

  .contents .active > a {
    color: var(--primary-color);
  }

  .contents .current > a {
    color: var(--primary-color);
  }

  .contents .current > a:hover {
    color: var(--primary-color);
  }

  .contents .toc-link {
    color: inherit;
    text-decoration: none;
    display: block;
    transition: color 0.2s ease;
  }

  .contents .toc-link:hover {
    color: var(--primary-color);
  }

  .no-toc {
    color: var(--grey-5);
    text-align: center;
    font-size: 0.875rem;
  }
</style>
