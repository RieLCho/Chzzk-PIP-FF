import { useEffect, useState } from 'react'

import type { DEFAULT_OPTIONS } from '../types/options'
import { getOption } from '../types/options'
import { waitForElement } from './inject_btn'

import { PIPPortal } from './components/pip_button'
import { RecordPortal } from './components/rec_button'
import { ScreenShotPortal } from './components/screenshot_button'
import { SeekPortal } from './components/seek'
import { DownloadPortal } from './components/download_button'
import { isClipPage, isVODPage } from './utils/download/download'
import { setMaxHQ } from './utils/max_hq'

/**
 * InjectButtons component
 *
 * Chzzk-PIP 확장에서 추가하는 대부분의 버튼을 주입하는 컴포넌트입니다.
 *
 * @returns 주입될 버튼 컴포넌트
 */
export function InjectButtons (): React.ReactNode {
  const [target, setTarget] = useState<Element | undefined>(undefined)
  const [options, setOptions] = useState<typeof DEFAULT_OPTIONS>()

  useEffect(() => {
    getOption()
      .then(setOptions)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (target === undefined) {
      waitForElement('.pzp-pc__bottom-buttons-right')
        .then(setTarget)
        .then(() => {
          const script = document.createElement('script')
          script.src = chrome.runtime.getURL('monkeypatch/seek.js')
          document.body.appendChild(script)
        })
        .catch(console.error)
    }
  }, [target])

  // Inject preferHQ
  useEffect(() => {
    setTimeout(() => {
      if ((options?.preferHQ) ?? false) {
        void setMaxHQ()
      }
    }, 1000)
  }, [options?.preferHQ])

  return (
    <>
      {(isVODPage() || isClipPage()) && <DownloadPortal tg={target} />}

      {((options?.seek) ?? false) && (!(isVODPage() || isClipPage())) && <SeekPortal />}
      {((options?.pip) ?? false) && <PIPPortal tg={target} />}
      {((options?.screenshot) ?? false) && !isClipPage() && <ScreenShotPortal tg={target} />}
      {((options?.rec) ?? false) && <RecordPortal tg={target} />}

    </>
  )
}
